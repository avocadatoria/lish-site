import * as client from 'openid-client';
import { createLogger } from '../../common/logger.js';
import { toAuthProviderEmail } from '../../common/email-mangling.js';

const log = createLogger(`service:auth0`);

let _config = null;
let _managementToken = null;
let _managementTokenExpiresAt = 0;

const AUTH0_BASE = () => `https://${process.env.AUTH0_DOMAIN}`;

// ── OIDC Discovery ─────────────────────────────────────

/**
 * Returns a cached OIDC discovery configuration for the Auth0 tenant.
 * Uses openid-client v6 functional API.
 */
export async function getConfig() {
  if (_config) return _config;

  const issuerUrl = new URL(AUTH0_BASE());

  _config = await client.discovery(
    issuerUrl,
    process.env.AUTH0_CLIENT_ID,
    process.env.AUTH0_CLIENT_SECRET,
  );

  return _config;
}

// ── PKCE Authorization (existing, kept for social/MFA fallback) ────

/**
 * Builds an Auth0 authorization URL with PKCE.
 *
 * @param {string} state - opaque state value for CSRF protection
 * @param {string} codeVerifier - PKCE code verifier (stored in session)
 * @param {string} [screenHint] - optional: 'signup' to show signup tab
 * @param {string} [connection] - optional: Auth0 connection name (e.g. 'google-oauth2')
 * @returns {Promise<string>} the full authorization URL
 */
export async function getAuthorizationUrl(state, codeVerifier, screenHint, connection) {
  const config = await getConfig();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

  const params = {
    redirect_uri: process.env.AUTH0_CALLBACK_URL,
    scope: `openid profile email`,
    response_type: `code`,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: `S256`,
  };

  if (screenHint) {
    params.screen_hint = screenHint;
  }

  if (connection) {
    params.connection = connection;
  }

  const url = client.buildAuthorizationUrl(config, params);
  return url.href;
}

/**
 * Exchanges an authorization code for tokens using the PKCE code verifier.
 */
export async function exchangeCode(currentUrl, codeVerifier, expectedState) {
  const config = await getConfig();

  const tokens = await client.authorizationCodeGrant(
    config,
    new URL(currentUrl),
    { pkceCodeVerifier: codeVerifier, expectedState },
  );

  return tokens;
}

/**
 * Fetches the Auth0 userinfo for an access token.
 */
export async function getUserInfo(accessToken) {
  const res = await fetch(`${AUTH0_BASE()}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch user info: ${body}`);
  }

  return res.json();
}

// ── ROPC Login ─────────────────────────────────────────

/**
 * Authenticates a user with email/password via Resource Owner Password Grant.
 * Returns tokens (access_token, id_token).
 *
 * Requires: Password grant enabled on the Auth0 app, Default Directory set.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} { access_token, id_token, token_type, expires_in }
 */
export async function loginWithPassword(email, password) {
  const res = await fetch(`${AUTH0_BASE()}/oauth/token`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({
      grant_type: `password`,
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      username: toAuthProviderEmail(email),
      password,
      scope: `openid profile email`,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error_description || `Authentication failed`);
    err.auth0Code = body.error;
    err.statusCode = res.status;
    throw err;
  }

  return res.json();
}

// ── Signup ─────────────────────────────────────────────

/**
 * Creates a new user in Auth0's database connection.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} [firstName]
 * @param {string} [lastName]
 * @returns {Promise<object>} Auth0 user object
 */
export async function signupUser(email, password, firstName, lastName) {
  const url = `${AUTH0_BASE()}/dbconnections/signup`;
  const options = {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      email: toAuthProviderEmail(email),
      password,
      connection: process.env.AUTH0_DB_CONNECTION,
      user_metadata: {
        given_name: firstName || undefined,
        family_name: lastName || undefined,
      },
    }),
  };

  const res = await fetch(url, options);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.description || body.message || `Signup failed`);
    err.auth0Code = body.code;
    err.statusCode = res.status;
    throw err;
  }

  return res.json();
}

// ── Password Reset ─────────────────────────────────────

/**
 * Triggers a password reset email via Auth0.
 * This is the Authentication API endpoint (not Management API).
 */
export async function requestPasswordReset(email) {
  const res = await fetch(`${AUTH0_BASE()}/dbconnections/change_password`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      email: toAuthProviderEmail(email),
      connection: process.env.AUTH0_DB_CONNECTION,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Auth0 password reset failed: ${body}`);
  }

  return true;
}

// ── Management API ─────────────────────────────────────

/**
 * Gets a Management API token via client_credentials grant.
 * Cached until 60 seconds before expiry.
 */
export async function getManagementToken() {
  if (_managementToken && Date.now() < _managementTokenExpiresAt) {
    return _managementToken;
  }

  const res = await fetch(`${AUTH0_BASE()}/oauth/token`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({
      grant_type: `client_credentials`,
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `${AUTH0_BASE()}/api/v2/`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to get Management API token: ${body}`);
  }

  const data = await res.json();
  _managementToken = data.access_token;
  _managementTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return _managementToken;
}

/**
 * Resends the email verification email for a user.
 * Requires Management API with create:user_tickets scope.
 *
 * @param {string} auth0UserId - Auth0 user ID (e.g. 'auth0|abc123')
 */
export async function resendVerificationEmail(auth0UserId) {
  const token = await getManagementToken();

  const res = await fetch(`${AUTH0_BASE()}/api/v2/jobs/verification-email`, {
    method: `POST`,
    headers: {
      'Content-Type': `application/json`,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: auth0UserId,
      client_id: process.env.AUTH0_CLIENT_ID,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    log.error({ body, auth0UserId }, `Failed to resend verification email`);
    throw new Error(`Failed to resend verification email`);
  }

  return true;
}

/**
 * Deletes a user from Auth0.
 * Requires Management API with delete:users scope.
 *
 * @param {string} auth0UserId - Auth0 user ID (e.g. 'auth0|abc123')
 */
export async function deleteAuth0User(auth0UserId) {
  const token = await getManagementToken();

  const res = await fetch(`${AUTH0_BASE()}/api/v2/users/${encodeURIComponent(auth0UserId)}`, {
    method: `DELETE`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    log.error({ body, auth0UserId }, `Failed to delete Auth0 user`);
    throw new Error(`Failed to delete Auth0 user`);
  }

  return true;
}

// ── Email OTP (Passwordless) ──────────────────────────

/**
 * Starts a passwordless email OTP flow.
 * Auth0 sends a 6-digit code to the given email address.
 *
 * @param {string} email
 * @returns {Promise<object>} Auth0 response
 */
export async function startPasswordlessEmail(email) {
  const res = await fetch(`${AUTH0_BASE()}/passwordless/start`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      connection: `email`,
      email: toAuthProviderEmail(email),
      send: `code`,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error_description || `Failed to send OTP`);
    err.auth0Code = body.error;
    err.statusCode = res.status;
    throw err;
  }

  return res.json();
}

/**
 * Exchanges an email OTP code for tokens.
 *
 * @param {string} email
 * @param {string} otp - the 6-digit code
 * @returns {Promise<object>} { access_token, id_token, token_type, expires_in }
 */
export async function verifyPasswordlessOtp(email, otp) {
  const res = await fetch(`${AUTH0_BASE()}/oauth/token`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({
      grant_type: `http://auth0.com/oauth/grant-type/passwordless/otp`,
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      otp,
      username: toAuthProviderEmail(email),
      realm: `email`,
      scope: `openid profile email`,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error_description || `Invalid or expired code`);
    err.auth0Code = body.error;
    err.statusCode = res.status;
    throw err;
  }

  return res.json();
}

// ── Logout URL ─────────────────────────────────────────

/**
 * Builds the Auth0 logout URL for federated logout.
 * Redirecting the browser to this URL clears the Auth0 session.
 */
export function buildLogoutUrl(returnToPath) {
  const base = process.env.APP_URL.replace(/\/$/, ``);
  const params = new URLSearchParams({
    client_id: process.env.AUTH0_CLIENT_ID,
    returnTo: returnToPath ? `${base}${returnToPath}` : base,
  });

  return `${AUTH0_BASE()}/v2/logout?${params}`;
}
