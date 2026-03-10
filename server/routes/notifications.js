import db from '../../db/models/index.js';
import { Op } from 'sequelize';

/**
 * Create a notification record and push it to the user via SSE.
 */
export async function notifyUser(fastify, userId, { type, title, body, data }) {
  const notification = await db.Notification.create({
    userId,
    type,
    title,
    body,
    data,
  });

  fastify.sse.send(userId, `notification`, notification.toJSON());

  return notification;
}

export default async function notificationRoutes(fastify) {
  const auth = { preHandler: [fastify.requireAuth] };

  // ── GET /api/notifications ──────────────────
  // List user's notifications with cursor-based pagination.
  fastify.get(`/api/notifications`, auth, async (request) => {
    const { cursor, limit = 20 } = request.query;
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const where = { userId: request.user.id };

    if (cursor) {
      where.createdAt = { [Op.lt]: new Date(cursor) };
    }

    const notifications = await db.Notification.findAll({
      where,
      order: [[`createdAt`, `DESC`]],
      limit: safeLimit + 1,
    });

    const hasMore = notifications.length > safeLimit;
    const items = hasMore ? notifications.slice(0, safeLimit) : notifications;
    const nextCursor = hasMore
      ? items[items.length - 1].createdAt.toISOString()
      : null;

    return {
      items,
      nextCursor,
      hasMore,
    };
  });

  // ── PUT /api/notifications/:id/read ─────────
  // Mark a single notification as read.
  fastify.put(`/api/notifications/:id/read`, auth, async (request, reply) => {
    const notification = await db.Notification.findOne({
      where: { id: request.params.id, userId: request.user.id },
    });

    if (!notification) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Notification not found`,
      });
    }

    await notification.update({ isRead: true, readAt: new Date() });
    return notification;
  });

  // ── PUT /api/notifications/read-all ─────────
  // Mark all unread notifications as read.
  fastify.put(`/api/notifications/read-all`, auth, async (request) => {
    const [count] = await db.Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: request.user.id, isRead: false } },
    );

    return { updated: count };
  });

  // ── GET /api/notifications/unread-count ─────
  fastify.get(`/api/notifications/unread-count`, auth, async (request) => {
    const count = await db.Notification.count({
      where: { userId: request.user.id, isRead: false },
    });

    return { count };
  });

  // ── GET /api/sse ────────────────────────────
  // Server-Sent Events endpoint for real-time notifications.
  fastify.get(`/api/sse`, auth, async (request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': `text/event-stream`,
      'Cache-Control': `no-cache`,
      'Connection': `keep-alive`,
    });

    // Send initial heartbeat so the client knows the connection is alive
    reply.raw.write(`:ok\n\n`);

    const userId = request.user.id;
    fastify.sse.addClient(userId, reply);

    request.raw.on(`close`, () => {
      fastify.sse.removeClient(userId, reply);
    });
  });
}
