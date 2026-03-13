import { inquirySchema } from '../../common/validation.js';
import { sendMail } from '../../common/mailer.js';
import { createEntry } from '../services/strapi.js';

export default async function inquiryRoutes(fastify) {
  // ── POST /api/inquiries ─────────────────────
  // Public — create a new inquiry (contact form).
  fastify.post(`/api/inquiries`, async (request, reply) => {
    const data = inquirySchema.parse(request.body);

    const result = await createEntry(`inquiries`, {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
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
      request.log.error({ err }, `Failed to send inquiry notification email`);
    }

    return reply.code(201).send(result.data);
  });
}
