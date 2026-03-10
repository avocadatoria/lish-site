import db from '../../db/models/index.js';
import { createCsvStream } from '../services/csv-export.js';

// ── Column definitions per resource ──────────
const RESOURCE_CONFIGS = {
  users: {
    model: `User`,
    columns: [
      { key: `id`, header: `ID` },
      { key: `email`, header: `Email` },
      { key: `firstName`, header: `First Name` },
      { key: `lastName`, header: `Last Name` },
      { key: `createdAt`, header: `Created At` },
    ],
  },
  organizations: {
    model: `Organization`,
    columns: [
      { key: `id`, header: `ID` },
      { key: `name`, header: `Name` },
      { key: `slug`, header: `Slug` },
      { key: `description`, header: `Description` },
      { key: `createdAt`, header: `Created At` },
    ],
  },
  inquiries: {
    model: `Inquiry`,
    columns: [
      { key: `id`, header: `ID` },
      { key: `name`, header: `Name` },
      { key: `email`, header: `Email` },
      { key: `phone`, header: `Phone` },
      { key: `subject`, header: `Subject` },
      { key: `message`, header: `Message` },
      { key: `status`, header: `Status` },
      { key: `createdAt`, header: `Created At` },
    ],
  },
  'audit-logs': {
    model: `AuditLog`,
    columns: [
      { key: `id`, header: `ID` },
      { key: `userId`, header: `User ID` },
      { key: `action`, header: `Action` },
      { key: `resource`, header: `Resource` },
      { key: `resourceId`, header: `Resource ID` },
      { key: `ipAddress`, header: `IP Address` },
      { key: `createdAt`, header: `Created At` },
    ],
  },
};

export default async function exportRoutes(fastify) {
  const auth = { preHandler: [fastify.requireAdmin] };

  // ── GET /api/export/:resource ───────────────
  // Export a resource as CSV download.
  fastify.get(`/api/export/:resource`, auth, async (request, reply) => {
    const { resource } = request.params;
    const config = RESOURCE_CONFIGS[resource];

    if (!config) {
      return reply.code(400).send({
        error: `BAD_REQUEST`,
        message: `Unsupported resource "${resource}". Supported: ${Object.keys(RESOURCE_CONFIGS).join(`, `)}`,
      });
    }

    const model = db[config.model];
    if (!model) {
      return reply.code(500).send({
        error: `INTERNAL`,
        message: `Model "${config.model}" not found`,
      });
    }

    const records = await model.findAll({ raw: true });
    const date = new Date().toISOString().split(`T`)[0];

    const csvStream = createCsvStream(records, config.columns);

    reply.raw.writeHead(200, {
      'Content-Type': `text/csv`,
      'Content-Disposition': `attachment; filename="${resource}-${date}.csv"`,
    });

    csvStream.pipe(reply.raw);
  });
}
