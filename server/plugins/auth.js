import fp from 'fastify-plugin';
import db from '../../db/models/index.js';
import { FRESH_AUTH_WINDOW_MS } from '../../common/constants.js';
import { AUTH_ERRORS } from '../../common/error-codes.js';

const { User } = db;
const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === `true`;

/**
 * Core session + DB check shared by all auth decorators.
 * Always re-fetches the user from the DB to catch deactivations in real time.
 *
 * @returns {{ session, dbUser }} or sends an error response and returns null
 */
async function verifySession(request, reply) {
  const session = await request.getSession();

  if (!session.user) {
    reply.code(401).send({ error: AUTH_ERRORS.UNAUTHORIZED });
    return null;
  }

  // Always re-check the DB — session is a stale snapshot
  const dbUser = await User.findByPk(session.user.id);

  if (!dbUser || !dbUser.isActive) {
    session.destroy();
    reply.code(401).send({
      error: AUTH_ERRORS.ACCOUNT_DEACTIVATED,
      message: `This account has been deactivated`,
    });
    return null;
  }

  // Keep session in sync with DB
  request.user = {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    profileImage: dbUser.profileImage,
    isAdmin: dbUser.isAdmin,
    isActive: dbUser.isActive,
    emailVerified: requireEmailVerification ? dbUser.emailVerified : true,
  };
  session.user = request.user;
  await session.save();
  request.session = session;

  return { session, dbUser };
}

async function authPlugin(fastify) {
  // ── requireAuth ─────────────────────────────────────
  // Verifies session, re-checks DB for isActive, enforces emailVerified.
  fastify.decorate(`requireAuth`, async function requireAuth(request, reply) {
    const result = await verifySession(request, reply);
    if (!result) return;

    if (requireEmailVerification && !result.dbUser.emailVerified) {
      return reply.code(403).send({
        error: AUTH_ERRORS.EMAIL_NOT_VERIFIED,
        message: `Please verify your email address`,
      });
    }
  });

  // ── requireAuthAllowUnverified ────────────────────
  // Same as requireAuth but skips the emailVerified check.
  // Used only for: resend-verification, check-verification, refresh, logout.
  fastify.decorate(`requireAuthAllowUnverified`, async function requireAuthAllowUnverified(request, reply) {
    await verifySession(request, reply);
  });

  // ── requireFreshAuth ────────────────────────────────
  // Same as requireAuth, plus checks that the session was
  // authenticated within the FRESH_AUTH_WINDOW_MS (5 min).
  fastify.decorate(`requireFreshAuth`, async function requireFreshAuth(request, reply) {
    const result = await verifySession(request, reply);
    if (!result) return;

    if (requireEmailVerification && !result.dbUser.emailVerified) {
      return reply.code(403).send({
        error: AUTH_ERRORS.EMAIL_NOT_VERIFIED,
        message: `Please verify your email address`,
      });
    }

    const elapsed = Date.now() - result.session.authenticatedAt;

    if (!result.session.authenticatedAt || elapsed > FRESH_AUTH_WINDOW_MS) {
      return reply.code(403).send({
        error: AUTH_ERRORS.FRESH_AUTH_REQUIRED,
        message: `Please re-authenticate`,
      });
    }
  });

  // ── requireAdmin ────────────────────────────────────
  // Same as requireAuth, plus checks that the user is an admin.
  fastify.decorate(`requireAdmin`, async function requireAdmin(request, reply) {
    const result = await verifySession(request, reply);
    if (!result) return;

    if (requireEmailVerification && !result.dbUser.emailVerified) {
      return reply.code(403).send({
        error: AUTH_ERRORS.EMAIL_NOT_VERIFIED,
        message: `Please verify your email address`,
      });
    }

    if (!result.dbUser.isAdmin) {
      return reply.code(403).send({ error: AUTH_ERRORS.FORBIDDEN });
    }
  });
}

export default fp(authPlugin, {
  name: `auth`,
  dependencies: [`session`],
});
