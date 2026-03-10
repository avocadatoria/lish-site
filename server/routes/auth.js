import crypto from 'node:crypto';
import db from '../../db/models/index.js';
import {
  getAuthorizationUrl,
  exchangeCode,
  getUserInfo,
  loginWithPassword,
  signupUser,
  requestPasswordReset,
  resendVerificationEmail,
  buildLogoutUrl,
  startPasswordlessEmail,
  verifyPasswordlessOtp,
} from '../services/auth0.js';
import { validatePassword } from '../../common/password-rules.js';
import { fromAuthProviderEmail, validateEmail, normalizeEmail } from '../../common/email-mangling.js';
import { AUTH_PROVIDERS } from '../../common/auth-providers.js';
import { AUTH_ERRORS } from '../../common/error-codes.js';
import { ROUTES } from '../../common/routes.js';

const { User } = db;

const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === `true`;

/**
 * Builds the session user object from a DB user record.
 * When REQUIRE_EMAIL_VERIFICATION is false, emailVerified is forced to true.
 */
function buildSessionUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImage: user.profileImage,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
    emailVerified: requireEmailVerification ? user.emailVerified : true,
  };
}

/**
 * Upserts a user from Auth0 userinfo. Returns the DB user record.
 */
async function upsertUser(userInfo, authType, extraDefaults = {}) {
  if (!userInfo.email) {
    const err = new Error(`No email address returned by the auth provider. If you signed in with GitHub, make sure your GitHub email is set to public.`);
    err.code = AUTH_ERRORS.MISSING_EMAIL;
    throw err;
  }

  const emailVerified = userInfo.email_verified ?? false;
  const cleanEmail = fromAuthProviderEmail(userInfo.email);

  // Try to find by auth identity (e.g. auth0|abc, google-oauth2|xyz, email|123)
  let user = await User.findOne({
    where: {
      externalAuthId: userInfo.sub,
      externalAuthProvider: `auth0`,
    },
  });

  // If not found by identity, check if email is taken by a different auth method
  if (!user) {
    const emailUser = await User.findOne({ where: { email: cleanEmail } });
    if (emailUser) {
      const err = new Error(`This email is already associated with a different sign-in method`);
      err.code = AUTH_ERRORS.EMAIL_CONFLICT;
      err.existingProvider = emailUser.authType;
      err.email = cleanEmail;
      err.email = cleanEmail;
      throw err;
    }
  }

  if (user) {
    await user.update({
      email: cleanEmail,
      authType,
      firstName: userInfo.given_name || user.firstName,
      lastName: userInfo.family_name || user.lastName,
      profileImage: userInfo.picture || user.profileImage,
      emailVerified,
      lastLoginAt: new Date(),
    });
  } else {
    user = await User.create({
      externalAuthId: userInfo.sub,
      externalAuthProvider: `auth0`,
      authType,
      email: cleanEmail,
      firstName: extraDefaults.firstName || userInfo.given_name || null,
      lastName: extraDefaults.lastName || userInfo.family_name || null,
      profileImage: userInfo.picture || null,
      emailVerified,
      lastLoginAt: new Date(),
    });
  }

  return user;
}

// Rate limit config for auth endpoints
const authRateLimit = {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: `1 minute`,
    },
  },
};

/**
 * Validates and normalizes an email. Sends 400 if invalid.
 * @returns {string|null} normalized email, or null if reply was sent
 */
function validateEmailOrReply(email, reply) {
  const normalized = normalizeEmail(email);
  const error = validateEmail(normalized);
  if (error) {
    reply.code(400).send({ error: AUTH_ERRORS.INVALID_EMAIL, message: error });
    return null;
  }
  return normalized;
}

/**
 * Sends the standard 403 ACCOUNT_DEACTIVATED response.
 */
function replyAccountDeactivated(reply) {
  return reply.code(403).send({
    error: AUTH_ERRORS.ACCOUNT_DEACTIVATED,
    message: `This account has been deactivated`,
  });
}

/**
 * Sets session user, authenticatedAt, accessToken and saves.
 */
async function initSession(session, user, accessToken) {
  session.user = buildSessionUser(user);
  session.authenticatedAt = Date.now();
  session.accessToken = accessToken;
  await session.save();
}

/**
 * Auth routes plugin.
 */
export default async function authRoutes(fastify) {
  // ── GET /api/auth/login ──────────────────────────────
  // PKCE redirect to Auth0 (kept for social login / MFA fallback).
  fastify.get(`/api/auth/login`, async (request, reply) => {
    const session = await request.getSession();
    const { screen_hint: screenHint, connection } = request.query;

    // Encode the connection in the state so the callback knows which
    // provider was used without parsing Auth0's sub claim format.
    const nonce = crypto.randomBytes(32).toString(`hex`);
    const state = connection ? `${nonce}.${connection}` : nonce;
    const codeVerifier = crypto.randomBytes(32).toString(`base64url`);

    session.state = state;
    session.codeVerifier = codeVerifier;
    await session.save();

    const authorizationUrl = await getAuthorizationUrl(state, codeVerifier, screenHint, connection);
    return reply.redirect(authorizationUrl);
  });

  // ── GET /api/auth/callback ───────────────────────────
  // Auth0 redirects here after PKCE authentication.
  fastify.get(`/api/auth/callback`, async (request, reply) => {
    const { code, state } = request.query;
    const session = await request.getSession();

    if (!state || state !== session.state) {
      return reply.code(400).send({ error: AUTH_ERRORS.INVALID_STATE });
    }

    // Extract the connection from the state (encoded as <nonce>.<connection>)
    const dotIndex = state.indexOf(`.`);
    const connection = dotIndex >= 0 ? state.slice(dotIndex + 1) : null;
    const provider = AUTH_PROVIDERS.find((p) => p.connection === connection);
    const authType = provider ? provider.id : `password`;

    // Use APP_URL for correct protocol (fixes FRP HTTPS in dev)
    const currentUrl = new URL(request.url, process.env.APP_URL).href;

    const tokens = await exchangeCode(currentUrl, session.codeVerifier, session.state);
    const userInfo = await getUserInfo(tokens.access_token);

    let user;
    try {
      user = await upsertUser(userInfo, authType);
    } catch (err) {
      if (err.code === AUTH_ERRORS.EMAIL_CONFLICT) {
        return reply.redirect(`${ROUTES.LOGIN}?error=email_conflict&provider=${encodeURIComponent(err.existingProvider)}`);
      }
      if (err.code === AUTH_ERRORS.MISSING_EMAIL) {
        return reply.redirect(`${ROUTES.LOGIN}?error=missing_email`);
      }
      throw err;
    }

    if (!user.isActive) return replyAccountDeactivated(reply);

    delete session.state;
    delete session.codeVerifier;

    await initSession(session, user, tokens.access_token);

    if (requireEmailVerification && !user.emailVerified) {
      return reply.redirect(ROUTES.VERIFY_EMAIL);
    }

    return reply.redirect(ROUTES.DASHBOARD);
  });

  // ── POST /api/auth/login ─────────────────────────────
  // Custom login via ROPC (Resource Owner Password Grant).
  fastify.post(`/api/auth/login`, authRateLimit, async (request, reply) => {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return reply.code(400).send({
        error: AUTH_ERRORS.INVALID_REQUEST,
        message: `Email and password are required`,
      });
    }

    const cleanEmail = validateEmailOrReply(email, reply);
    if (!cleanEmail) return;

    let tokens;
    try {
      tokens = await loginWithPassword(cleanEmail, password);
    } catch (err) {
      // Generic error — never reveal whether email exists or password is wrong
      request.log.warn({ email: cleanEmail, auth0Code: err.auth0Code }, `Login failed`);
      return reply.code(401).send({
        error: AUTH_ERRORS.INVALID_CREDENTIALS,
        message: `Invalid email or password`,
      });
    }

    const userInfo = await getUserInfo(tokens.access_token);

    let user;
    try {
      user = await upsertUser(userInfo, `password`);
    } catch (err) {
      if (err.code === AUTH_ERRORS.EMAIL_CONFLICT) {
        return reply.code(409).send({
          error: AUTH_ERRORS.EMAIL_CONFLICT,
          message: `This email is already associated with a different sign-in method`,
          provider: err.existingProvider,
          email: err.email,
        });
      }
      throw err;
    }

    if (!user.isActive) return replyAccountDeactivated(reply);

    const session = await request.getSession();
    await initSession(session, user, tokens.access_token);

    return { user: session.user };
  });

  // ── POST /api/auth/otp/start ────────────────────────
  // Sends a 6-digit OTP code to the user's email.
  fastify.post(`/api/auth/otp/start`, authRateLimit, async (request, reply) => {
    const { email } = request.body || {};

    if (!email) {
      return reply.code(400).send({
        error: AUTH_ERRORS.INVALID_REQUEST,
        message: `Email is required`,
      });
    }

    const cleanEmail = validateEmailOrReply(email, reply);
    if (!cleanEmail) return;

    // Only send OTP if user exists locally. OTP serves two purposes:
    // 1. Login (only for password users — social users are blocked at verify)
    // 2. Identity confirmation (account deletion — works for all users)
    // We always send the code here; the login-specific guard is on verify.
    // Still return { ok: true } regardless to prevent email enumeration.
    const existingUser = await User.findOne({ where: { email: cleanEmail } });

    if (existingUser) {
      try {
        await startPasswordlessEmail(cleanEmail);
      } catch (err) {
        request.log.error({ err, email: cleanEmail }, `OTP start failed`);
      }
    }

    return { ok: true };
  });

  // ── POST /api/auth/otp/verify ─────────────────────
  // Verifies the OTP code and logs in an existing user. Does not create accounts.
  fastify.post(`/api/auth/otp/verify`, authRateLimit, async (request, reply) => {
    const { email, otp } = request.body || {};

    if (!email || !otp) {
      return reply.code(400).send({
        error: AUTH_ERRORS.INVALID_REQUEST,
        message: `Email and code are required`,
      });
    }

    const cleanEmail = validateEmailOrReply(email, reply);
    if (!cleanEmail) return;

    // OTP is login-only — user must already have an account with a compatible auth method
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (!existingUser) {
      return reply.code(401).send({
        error: AUTH_ERRORS.NO_ACCOUNT,
        message: `No account found for this email. Please sign up first.`,
      });
    }

    const isSocialUser = existingUser.externalAuthId && !existingUser.externalAuthId.startsWith(`auth0|`);
    if (isSocialUser) {
      const provider = existingUser.externalAuthId.split(`|`)[0];
      return reply.code(409).send({
        error: AUTH_ERRORS.EMAIL_CONFLICT,
        message: `This email is already associated with a different sign-in method`,
        provider,
      });
    }

    let tokens;
    try {
      tokens = await verifyPasswordlessOtp(cleanEmail, otp.trim());
    } catch (err) {
      request.log.warn({ email: cleanEmail, auth0Code: err.auth0Code }, `OTP verify failed`);
      return reply.code(401).send({
        error: AUTH_ERRORS.INVALID_OTP,
        message: `Invalid or expired code. Please try again.`,
      });
    }

    // OTP creates a separate Auth0 identity (email|xyz) distinct from the
    // user's primary identity (auth0|abc). Skip upsertUser — we already
    // verified the user exists locally.
    if (!existingUser.isActive) return replyAccountDeactivated(reply);

    // Entering a valid OTP proves email ownership — mark verified + update login time
    await existingUser.update({ lastLoginAt: new Date(), emailVerified: true });

    const session = await request.getSession();
    await initSession(session, existingUser, tokens.access_token);

    return { user: session.user };
  });

  // ── POST /api/auth/signup ────────────────────────────
  // Creates Auth0 user, then auto-logs in via ROPC.
  fastify.post(`/api/auth/signup`, authRateLimit, async (request, reply) => {
    const { email, password, firstName, lastName } = request.body || {};

    if (!email || !password) {
      return reply.code(400).send({
        error: AUTH_ERRORS.INVALID_REQUEST,
        message: `Email and password are required`,
      });
    }

    const cleanEmail = validateEmailOrReply(email, reply);
    if (!cleanEmail) return;

    const passwordErrors = validatePassword(password, cleanEmail);
    if (passwordErrors.length > 0) {
      return reply.code(400).send({
        error: AUTH_ERRORS.INVALID_PASSWORD,
        message: passwordErrors[0],
        errors: passwordErrors,
      });
    }

    // Block signup if email already exists locally (any auth method)
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      return reply.code(409).send({
        error: AUTH_ERRORS.USER_EXISTS,
        message: `An account with this email already exists`,
      });
    }

    // Create Auth0 user
    try {
      await signupUser(cleanEmail, password, firstName, lastName);
    } catch (err) {
      if (err.auth0Code === `user_exists` || err.auth0Code === `invalid_signup`) {
        return reply.code(409).send({
          error: AUTH_ERRORS.USER_EXISTS,
          message: `An account with this email already exists`,
        });
      }

      // Auth0 password policy violations come back as 'invalid_password'
      if (err.auth0Code === `invalid_password`) {
        return reply.code(400).send({
          error: AUTH_ERRORS.INVALID_PASSWORD,
          message: err.message || `Password does not meet requirements`,
        });
      }

      request.log.error({ err }, `Signup failed`);
      return reply.code(500).send({
        error: AUTH_ERRORS.SIGNUP_FAILED,
        message: `Account creation failed. Please try again.`,
      });
    }

    // Auto-login via ROPC
    let tokens;
    try {
      tokens = await loginWithPassword(cleanEmail, password);
    } catch (err) {
      request.log.error({ auth0Code: err.auth0Code }, `Auto-login after signup failed`);
      return reply.code(500).send({
        error: AUTH_ERRORS.AUTO_LOGIN_FAILED,
        message: `Account created but auto-login failed. Please sign in manually.`,
      });
    }

    const userInfo = await getUserInfo(tokens.access_token);
    const user = await upsertUser(userInfo, `password`, { firstName, lastName });

    const session = await request.getSession();
    await initSession(session, user, tokens.access_token);

    return { user: session.user };
  });

  // ── POST /api/auth/forgot-password ───────────────────
  // Triggers password reset email. Always returns success (prevents enumeration).
  fastify.post(`/api/auth/forgot-password`, authRateLimit, async (request, reply) => {
    const { email } = request.body || {};

    if (!email || typeof email !== `string`) {
      return reply.code(400).send({
        error: AUTH_ERRORS.INVALID_EMAIL,
        message: `Please provide a valid email address`,
      });
    }

    const cleanEmail = validateEmailOrReply(email, reply);
    if (!cleanEmail) return;

    // Only send reset if user exists AND uses password auth (not social).
    // Still return { ok: true } regardless to prevent email enumeration.
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    const isSocialUser = existingUser?.externalAuthId && !existingUser.externalAuthId.startsWith(`auth0|`);

    if (existingUser && !isSocialUser) {
      try {
        await requestPasswordReset(cleanEmail);
      } catch (err) {
        request.log.error({ err }, `Password reset request failed`);
      }
    }

    return { ok: true };
  });

  // ── POST /api/auth/resend-verification ───────────────
  // Resends verification email. Requires auth (unverified OK).
  fastify.post(`/api/auth/resend-verification`, {
    preHandler: [fastify.requireAuthAllowUnverified],
  }, async (request, reply) => {
    const user = await User.findByPk(request.user.id);

    if (!user || !user.externalAuthId) {
      return reply.code(400).send({
        error: AUTH_ERRORS.NO_AUTH_ID,
        message: `Cannot resend verification email`,
      });
    }

    try {
      await resendVerificationEmail(user.externalAuthId);
    } catch (err) {
      request.log.error({ err }, `Resend verification email failed`);
      return reply.code(500).send({
        error: AUTH_ERRORS.RESEND_FAILED,
        message: `Failed to resend verification email. Please try again.`,
      });
    }

    return { ok: true };
  });

  // ── POST /api/auth/check-verification ────────────────
  // Re-checks email_verified status from Auth0. Requires auth (unverified OK).
  fastify.post(`/api/auth/check-verification`, {
    preHandler: [fastify.requireAuthAllowUnverified],
  }, async (request, reply) => {
    const session = request.session;

    if (!session.accessToken) {
      return reply.code(400).send({
        error: AUTH_ERRORS.NO_TOKEN,
        message: `No access token — please log in again`,
      });
    }

    let userInfo;
    try {
      userInfo = await getUserInfo(session.accessToken);
    } catch {
      return reply.code(401).send({
        error: AUTH_ERRORS.TOKEN_INVALID,
        message: `Access token expired — please log in again`,
      });
    }

    const emailVerified = userInfo.email_verified ?? false;

    // Update DB
    await User.update(
      { emailVerified },
      { where: { id: request.user.id } },
    );

    // Update session
    session.user = {
      ...session.user,
      emailVerified: requireEmailVerification ? emailVerified : true,
    };
    await session.save();

    return { emailVerified: session.user.emailVerified };
  });

  // ── POST /api/auth/logout ────────────────────────────
  // Destroys local session. Returns Auth0 logout URL for federated logout.
  // Accepts optional `returnTo` (relative path) forwarded to Auth0's returnTo.
  fastify.post(`/api/auth/logout`, async (request) => {
    const session = await request.getSession();
    session.destroy();

    const { returnTo } = request.body || {};
    const safePath = typeof returnTo === `string` && returnTo.startsWith(`/`) ? returnTo : null;

    return { logoutUrl: buildLogoutUrl(safePath) };
  });

  // ── GET /api/auth/me ─────────────────────────────────
  // Returns the current user from session, or null.
  // Uses requireAuthAllowUnverified so the session is re-validated against DB.
  // Returns null (not 401) if no session exists, so the frontend can distinguish
  // "not logged in" from "logged in but deactivated."
  fastify.get(`/api/auth/me`, async (request, reply) => {
    const session = await request.getSession();
    if (!session.user) return null;

    const dbUser = await User.findByPk(session.user.id);
    if (!dbUser || !dbUser.isActive) {
      session.destroy();
      return null;
    }

    const user = buildSessionUser(dbUser);
    session.user = user;
    await session.save();

    return user;
  });

  // ── POST /api/auth/refresh ───────────────────────────
  // Re-verifies with Auth0, refreshes session. Requires auth (unverified OK).
  fastify.post(`/api/auth/refresh`, {
    preHandler: [fastify.requireAuthAllowUnverified],
  }, async (request, reply) => {
    const { session } = request;

    if (!session.accessToken) {
      return reply.code(400).send({
        error: AUTH_ERRORS.NO_TOKEN,
        message: `No access token in session — please log in again`,
      });
    }

    let userInfo;
    try {
      userInfo = await getUserInfo(session.accessToken);
    } catch {
      return reply.code(401).send({
        error: AUTH_ERRORS.TOKEN_INVALID,
        message: `Access token is no longer valid — please log in again`,
      });
    }

    // Re-fetch from DB to check isActive and get fresh data
    const dbUser = await User.findByPk(request.user.id);

    if (!dbUser || !dbUser.isActive) {
      session.destroy();
      return reply.code(401).send({
        error: AUTH_ERRORS.ACCOUNT_DEACTIVATED,
        message: `This account has been deactivated`,
      });
    }

    // Update emailVerified from Auth0
    const emailVerified = userInfo.email_verified ?? false;
    if (dbUser.emailVerified !== emailVerified) {
      await dbUser.update({ emailVerified });
    }

    session.authenticatedAt = Date.now();
    session.user = buildSessionUser(dbUser);
    await session.save();

    return { ok: true, user: session.user };
  });
}
