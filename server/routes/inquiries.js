import db from '../../db/models/index.js';
import { inquirySchema, paginationSchema } from '../../common/validation.js';
import { INQUIRY_STATUS_VALUES } from '../../common/constants.js';
import { sendMail } from '../../common/mailer.js';
import { paginateQuery } from '../../common/pagination.js';
import { z } from 'zod';

const statusUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUS_VALUES),
});

export default async function inquiryRoutes(fastify) {
  const admin = { preHandler: [fastify.requireAdmin] };

  // ── POST /api/inquiries ─────────────────────
  // Public — create a new inquiry (contact form / lead capture).
  fastify.post(`/api/inquiries`, async (request, reply) => {
    const data = inquirySchema.parse(request.body);

    const inquiry = await db.Inquiry.create({
      ...data,
      status: `new`,
    });

    // Notification email to site admins — inquiry is already saved,
    // so log the failure but don't blow up the user's request.
    try {
      await sendMail({
        to: process.env.CONTACT_US_RECIPIENT,
        subject: `New inquiry from ${data.name}: ${data.subject}`,
        html: [
          `<p><strong>Name:</strong> ${data.name}</p>`,
          `<p><strong>Email:</strong> ${data.email}</p>`,
          data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ``,
          `<p><strong>Subject:</strong> ${data.subject}</p>`,
          `<p><strong>Message:</strong></p>`,
          `<p>${data.message.replace(/\n/g, `<br>`)}</p>`,
        ].join(`\n`),
      });
    } catch (err) {
      request.log.error({ err, inquiryId: inquiry.id }, `Failed to send inquiry notification email`);
    }

    return reply.code(201).send(inquiry);
  });

  // ── GET /api/inquiries ──────────────────────
  // Admin — list all inquiries with cursor-based pagination.
  fastify.get(`/api/inquiries`, admin, async (request) => {
    const { cursor, limit } = paginationSchema.parse(request.query);

    return paginateQuery(db.Inquiry, {
      cursor,
      limit,
      order: [[`createdAt`, `DESC`]],
    });
  });

  // ── PUT /api/inquiries/:id/status ───────────
  // Admin — update inquiry status.
  fastify.put(`/api/inquiries/:id/status`, admin, async (request, reply) => {
    const { status } = statusUpdateSchema.parse(request.body);

    const inquiry = await db.Inquiry.findByPk(request.params.id);

    if (!inquiry) {
      return reply.code(404).send({
        error: `NOT_FOUND`,
        message: `Inquiry not found`,
      });
    }

    await inquiry.update({ status });
    return inquiry;
  });
}
