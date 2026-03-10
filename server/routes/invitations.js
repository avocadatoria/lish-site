import crypto from 'node:crypto';
import db from '../../db/models/index.js';
import { sendMail } from '../../common/mailer.js';
import { invitationSchema } from '../../common/validation.js';
import { ORG_ROLES, INVITATION_STATUSES } from '../../common/constants.js';

export default async function invitationRoutes(fastify) {
  const auth = { preHandler: [fastify.requireAuth] };

  // ── POST /api/organizations/:slug/invitations ──
  // Create an invitation and send the invite email.
  fastify.post(`/api/organizations/:slug/invitations`, auth, async (request, reply) => {
    const data = invitationSchema.parse(request.body);

    const org = await db.Organization.findOne({
      where: { slug: request.params.slug },
    });

    if (!org) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Organization not found`,
      });
    }

    // Verify the inviter is an owner or admin
    const membership = await db.OrganizationMember.findOne({
      where: { organizationId: org.id, userId: request.user.id },
    });

    if (!membership || ![ORG_ROLES.OWNER, ORG_ROLES.ADMIN].includes(membership.role)) {
      return reply.code(403).send({
        error: `FORBIDDEN`,
        message: `Only owners and admins can invite members`,
      });
    }

    // Check for existing pending invitation
    const existing = await db.Invitation.findOne({
      where: {
        organizationId: org.id,
        email: data.email,
        status: INVITATION_STATUSES.PENDING,
      },
    });

    if (existing) {
      return reply.code(409).send({
        error: `CONFLICT`,
        message: `A pending invitation already exists for this email`,
      });
    }

    const token = crypto.randomBytes(32).toString(`hex`);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await db.Invitation.create({
      organizationId: org.id,
      invitedByUserId: request.user.id,
      email: data.email,
      role: data.role,
      token,
      expiresAt,
    });

    const acceptLink = `${process.env.APP_URL}/invitations/${token}`;

    await sendMail({
      to: data.email,
      subject: `You've been invited to join ${org.name}`,
      html: [
        `<p>You've been invited to join <strong>${org.name}</strong> as a <strong>${data.role}</strong>.</p>`,
        `<p><a href="${acceptLink}">Accept Invitation</a></p>`,
        `<p>This invitation expires in 7 days.</p>`,
      ].join(`\n`),
    });

    return reply.code(201).send(invitation);
  });

  // ── GET /api/invitations/:token ────────────
  // Public — get invitation details.
  fastify.get(`/api/invitations/:token`, async (request, reply) => {
    const invitation = await db.Invitation.findOne({
      where: { token: request.params.token },
      include: [
        {
          model: db.Organization,
          attributes: [`id`, `name`, `slug`, `logo`],
        },
      ],
    });

    if (!invitation) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Invitation not found`,
      });
    }

    return {
      id: invitation.id,
      organizationName: invitation.Organization.name,
      organizationSlug: invitation.Organization.slug,
      organizationLogo: invitation.Organization.logo,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    };
  });

  // ── POST /api/invitations/:token/accept ────
  fastify.post(`/api/invitations/:token/accept`, auth, async (request, reply) => {
    const invitation = await db.Invitation.findOne({
      where: { token: request.params.token },
    });

    if (!invitation) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Invitation not found`,
      });
    }

    if (invitation.status !== INVITATION_STATUSES.PENDING) {
      return reply.code(410).send({
        error: `GONE`,
        message: `Invitation has already been ${invitation.status}`,
      });
    }

    if (invitation.expiresAt < new Date()) {
      await invitation.update({ status: INVITATION_STATUSES.EXPIRED });
      return reply.code(410).send({
        error: `GONE`,
        message: `Invitation has expired`,
      });
    }

    // Verify the logged-in user's email matches the invitation
    if (request.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return reply.code(403).send({
        error: `FORBIDDEN`,
        message: `This invitation was sent to a different email address`,
      });
    }

    // Check user isn't already a member
    const existingMember = await db.OrganizationMember.findOne({
      where: {
        organizationId: invitation.organizationId,
        userId: request.user.id,
      },
    });

    if (existingMember) {
      return reply.code(409).send({
        error: `CONFLICT`,
        message: `You are already a member of this organization`,
      });
    }

    await db.OrganizationMember.create({
      organizationId: invitation.organizationId,
      userId: request.user.id,
      role: invitation.role,
    });

    await invitation.update({
      status: INVITATION_STATUSES.ACCEPTED,
      acceptedAt: new Date(),
    });

    return { status: `accepted` };
  });

  // ── POST /api/invitations/:token/decline ───
  fastify.post(`/api/invitations/:token/decline`, auth, async (request, reply) => {
    const invitation = await db.Invitation.findOne({
      where: { token: request.params.token },
    });

    if (!invitation) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Invitation not found`,
      });
    }

    if (invitation.status !== INVITATION_STATUSES.PENDING) {
      return reply.code(410).send({
        error: `GONE`,
        message: `Invitation has already been ${invitation.status}`,
      });
    }

    await invitation.update({ status: INVITATION_STATUSES.DECLINED });

    return { status: `declined` };
  });
}
