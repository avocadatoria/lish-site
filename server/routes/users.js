import db from '../../db/models/index.js';
import { userUpdateSchema, addressSchema } from '../../common/validation.js';
import { deleteAuth0User } from '../services/auth0.js';
import { createLogger } from '../../common/logger.js';

const log = createLogger(`route:users`);

export default async function userRoutes(fastify) {
  const auth = { preHandler: [fastify.requireAuth] };
  const freshAuth = { preHandler: [fastify.requireFreshAuth] };

  // ── GET /api/users/me ─────────────────────────────
  fastify.get(`/api/users/me`, auth, async (request) => {
    const user = await db.User.findByPk(request.user.id, {
      include: [
        { model: db.Address, as: `addresses` },
        { model: db.UserAttribute, as: `attributes` },
      ],
    });

    if (!user) {
      const err = new Error(`User not found`);
      err.statusCode = 404;
      throw err;
    }

    return user;
  });

  // ── PUT /api/users/me ─────────────────────────────
  fastify.put(`/api/users/me`, auth, async (request) => {
    const data = userUpdateSchema.parse(request.body);

    const user = await db.User.findByPk(request.user.id);
    if (!user) {
      const err = new Error(`User not found`);
      err.statusCode = 404;
      throw err;
    }

    await user.update(data);
    return user;
  });

  // ── GET /api/users/me/addresses ───────────────────
  fastify.get(`/api/users/me/addresses`, auth, async (request) => {
    const addresses = await db.Address.findAll({
      where: { userId: request.user.id },
    });
    return addresses;
  });

  // ── POST /api/users/me/addresses ──────────────────
  fastify.post(`/api/users/me/addresses`, auth, async (request) => {
    const data = addressSchema.parse(request.body);

    const address = await db.Address.create({
      ...data,
      userId: request.user.id,
    });
    return address;
  });

  // ── PUT /api/users/me/addresses/:id ───────────────
  fastify.put(`/api/users/me/addresses/:id`, auth, async (request, reply) => {
    const data = addressSchema.parse(request.body);

    const address = await db.Address.findOne({
      where: { id: request.params.id, userId: request.user.id },
    });

    if (!address) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Address not found`,
      });
    }

    await address.update(data);
    return address;
  });

  // ── DELETE /api/users/me/addresses/:id ────────────
  fastify.delete(`/api/users/me/addresses/:id`, auth, async (request, reply) => {
    const address = await db.Address.findOne({
      where: { id: request.params.id, userId: request.user.id },
    });

    if (!address) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Address not found`,
      });
    }

    await address.destroy();
    return reply.code(204).send();
  });

  // ── DELETE /api/users/me ──────────────────────────
  // Requires fresh authentication (< 5 min). No OTP — re-login is the gate.
  fastify.delete(`/api/users/me`, freshAuth, async (request, reply) => {
    const user = await db.User.findByPk(request.user.id);
    if (!user) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `User not found`,
      });
    }

    // Mark as deleting before Auth0 call
    await user.update({ deletionStatus: `deleting` });

    // Delete from Auth0 first — if this fails, roll back the flag
    try {
      await deleteAuth0User(user.externalAuthId);
    } catch (err) {
      log.error({ err, userId: user.id }, `Auth0 deletion failed, rolling back`);
      await user.update({ deletionStatus: null });
      return reply.code(500).send({
        error: `DELETION_FAILED`,
        message: `Failed to delete account. Please try again.`,
      });
    }

    // Auth0 succeeded — finalize and soft-delete
    await user.update({
      deletionStatus: `deleted`,
      internalNotes: `Soft-deleted via account deletion on ${new Date().toISOString()}. The unique constraint on email only applies to active rows (WHERE deletedAt IS NULL), so a new account with this email can be created.`,
    });
    await user.destroy();
    log.info({ userId: user.id }, `User account deleted`);

    // Destroy session
    const session = await request.getSession();
    session.destroy();

    return { ok: true };
  });
}
