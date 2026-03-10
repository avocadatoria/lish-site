import db from '../../db/models/index.js';
import { organizationSchema } from '../../common/validation.js';
import { ORG_ROLES } from '../../common/constants.js';

export default async function organizationRoutes(fastify) {
  const auth = { preHandler: [fastify.requireAuth] };

  // ── GET /api/organizations ────────────────────────
  // List organizations the current user belongs to.
  fastify.get(`/api/organizations`, auth, async (request) => {
    const memberships = await db.OrganizationMember.findAll({
      where: { userId: request.user.id },
      include: [{ model: db.Organization }],
    });

    return memberships.map((m) => ({
      ...m.Organization.toJSON(),
      role: m.role,
    }));
  });

  // ── POST /api/organizations ───────────────────────
  // Create a new organization. The current user becomes the owner.
  fastify.post(`/api/organizations`, auth, async (request) => {
    const data = organizationSchema.parse(request.body);

    const org = await db.Organization.create({
      ...data,
      ownerId: request.user.id,
    });

    // Add the creator as owner member
    await db.OrganizationMember.create({
      organizationId: org.id,
      userId: request.user.id,
      role: ORG_ROLES.OWNER,
    });

    return org;
  });

  // ── GET /api/organizations/:slug ──────────────────
  fastify.get(`/api/organizations/:slug`, auth, async (request, reply) => {
    const org = await db.Organization.findOne({
      where: { slug: request.params.slug },
      include: [
        {
          model: db.OrganizationMember,
          as: `members`,
          include: [{ model: db.User, attributes: [`id`, `firstName`, `lastName`, `email`, `profileImage`] }],
        },
      ],
    });

    if (!org) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Organization not found`,
      });
    }

    // Verify the user is a member
    const isMember = org.members.some((m) => m.userId === request.user.id);
    if (!isMember) {
      return reply.code(403).send({
        error: `FORBIDDEN`,
        message: `You are not a member of this organization`,
      });
    }

    return org;
  });

  // ── PUT /api/organizations/:slug ──────────────────
  // Only owner or admin can update.
  fastify.put(`/api/organizations/:slug`, auth, async (request, reply) => {
    const data = organizationSchema.parse(request.body);

    const org = await db.Organization.findOne({
      where: { slug: request.params.slug },
    });

    if (!org) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Organization not found`,
      });
    }

    const membership = await db.OrganizationMember.findOne({
      where: { organizationId: org.id, userId: request.user.id },
    });

    if (!membership || ![ORG_ROLES.OWNER, ORG_ROLES.ADMIN].includes(membership.role)) {
      return reply.code(403).send({
        error: `FORBIDDEN`,
        message: `Only owners and admins can update organizations`,
      });
    }

    await org.update(data);
    return org;
  });

  // ── DELETE /api/organizations/:slug ───────────────
  // Only the owner can delete (soft delete).
  fastify.delete(`/api/organizations/:slug`, auth, async (request, reply) => {
    const org = await db.Organization.findOne({
      where: { slug: request.params.slug },
    });

    if (!org) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Organization not found`,
      });
    }

    if (org.ownerId !== request.user.id) {
      return reply.code(403).send({
        error: `FORBIDDEN`,
        message: `Only the owner can delete an organization`,
      });
    }

    await org.destroy();
    return reply.code(204).send();
  });
}
