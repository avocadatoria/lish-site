import db from '../../db/models/index.js';
import { Op } from 'sequelize';
import { notifyUser } from './notifications.js';

export default async function adminRoutes(fastify) {
  const admin = { preHandler: [fastify.requireAdmin] };

  // ── GET /api/admin/users ──────────────────────────
  // List all users with pagination and address count.
  fastify.get(`/api/admin/users`, admin, async (request) => {
    const { cursor, limit = 20 } = request.query;
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const where = {};

    if (cursor) {
      where.createdAt = { [Op.lt]: new Date(cursor) };
    }

    const { count, rows } = await db.User.findAndCountAll({
      where,
      include: [
        {
          model: db.Address,
          as: `addresses`,
          attributes: [`id`],
        },
      ],
      order: [[`createdAt`, `DESC`]],
      limit: safeLimit + 1,
      distinct: true,
    });

    const hasMore = rows.length > safeLimit;
    const items = hasMore ? rows.slice(0, safeLimit) : rows;
    const nextCursor = hasMore
      ? items[items.length - 1].createdAt.toISOString()
      : null;

    return {
      items: items.map((user) => ({
        ...user.toJSON(),
        addressCount: user.addresses?.length || 0,
        addresses: undefined,
      })),
      total: count,
      nextCursor,
      hasMore,
    };
  });

  // ── PUT /api/admin/users/:id ──────────────────────
  // Update user (only isActive and isAdmin fields allowed).
  fastify.put(`/api/admin/users/:id`, admin, async (request, reply) => {
    const allowedFields = [`isActive`, `isAdmin`];
    const updates = {};

    for (const field of allowedFields) {
      if (request.body[field] !== undefined) {
        updates[field] = request.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return reply.code(400).send({
        error: `BAD_REQUEST`,
        message: `No valid fields to update. Allowed: isActive, isAdmin`,
      });
    }

    // Prevent admins from modifying their own account
    if (request.params.id === request.user.id) {
      return reply.code(400).send({
        error: `BAD_REQUEST`,
        message: `You cannot modify your own admin account`,
      });
    }

    const user = await db.User.findByPk(request.params.id);

    if (!user) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `User not found`,
      });
    }

    await user.update(updates);

    await fastify.audit.log(
      request.user.id,
      `admin.updateUser`,
      `User`,
      user.id,
      updates,
      request.ip,
    );

    return user;
  });

  // ── GET /api/admin/stats ──────────────────────────
  // Return aggregate statistics for the admin dashboard.
  fastify.get(`/api/admin/stats`, admin, async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [userCount, orgCount, inquiryCount, recentSignups] = await Promise.all([
      db.User.count(),
      db.Organization.count(),
      db.Inquiry.count(),
      db.User.count({
        where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      }),
    ]);

    return { userCount, orgCount, inquiryCount, recentSignups };
  });

  // ── GET /api/admin/audit-logs ─────────────────────
  // List audit logs with pagination and filtering.
  fastify.get(`/api/admin/audit-logs`, admin, async (request) => {
    const { cursor, limit = 20, action, resource, userId, startDate, endDate } = request.query;
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const where = {};

    if (cursor) {
      where.createdAt = { [Op.lt]: new Date(cursor) };
    }

    if (action) {
      where.action = action;
    }

    if (resource) {
      where.resource = resource;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = where.createdAt || {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const logs = await db.AuditLog.findAll({
      where,
      include: [
        {
          model: db.User,
          attributes: [`id`, `email`, `firstName`, `lastName`],
        },
      ],
      order: [[`createdAt`, `DESC`]],
      limit: safeLimit + 1,
    });

    const hasMore = logs.length > safeLimit;
    const items = hasMore ? logs.slice(0, safeLimit) : logs;
    const nextCursor = hasMore
      ? items[items.length - 1].createdAt.toISOString()
      : null;

    return {
      items,
      nextCursor,
      hasMore,
    };
  });

  // ── POST /api/admin/notifications ─────────────────
  // Send a system-wide notification to all users.
  fastify.post(`/api/admin/notifications`, admin, async (request, reply) => {
    const { title, body } = request.body;

    if (!title || !body) {
      return reply.code(400).send({
        error: `BAD_REQUEST`,
        message: `title and body are required`,
      });
    }

    const users = await db.User.findAll({
      where: { isActive: true },
      attributes: [`id`],
    });

    const results = await Promise.allSettled(
      users.map((user) =>
        notifyUser(fastify, user.id, {
          type: `system`,
          title,
          body,
          data: { sentBy: request.user.id },
        }),
      ),
    );

    const sent = results.filter((r) => r.status === `fulfilled`).length;
    const failed = results.filter((r) => r.status === `rejected`).length;

    await fastify.audit.log(
      request.user.id,
      `admin.sendNotification`,
      `Notification`,
      null,
      { title, recipientCount: sent },
      request.ip,
    );

    return { sent, failed, total: users.length };
  });

  // ── GET /api/admin/organizations ──────────────────
  // List all organizations (admin view).
  fastify.get(`/api/admin/organizations`, admin, async (request) => {
    const { cursor, limit = 20 } = request.query;
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const where = {};

    if (cursor) {
      where.createdAt = { [Op.lt]: new Date(cursor) };
    }

    const orgs = await db.Organization.findAll({
      where,
      include: [
        {
          model: db.User,
          as: `owner`,
          attributes: [`id`, `email`, `firstName`, `lastName`],
        },
      ],
      order: [[`createdAt`, `DESC`]],
      limit: safeLimit + 1,
    });

    const hasMore = orgs.length > safeLimit;
    const items = hasMore ? orgs.slice(0, safeLimit) : orgs;
    const nextCursor = hasMore
      ? items[items.length - 1].createdAt.toISOString()
      : null;

    return {
      items,
      nextCursor,
      hasMore,
    };
  });
}
