import { sequelize } from '../../db/models/index.js';
import { fullTextSearch } from '../services/search.js';

export default async function searchRoutes(fastify) {
  const auth = { preHandler: [fastify.requireAuth] };

  // ── GET /api/search ─────────────────────────
  // Full-text search across users and organizations.
  // Query params:
  //   q     — search query (required)
  //   type  — comma-separated filter: users,organizations (optional)
  //   limit — max results (optional, default 20)
  fastify.get(`/api/search`, auth, async (request, reply) => {
    const { q, type, limit } = request.query;

    if (!q || !q.trim()) {
      return reply.code(400).send({
        error: `BAD_REQUEST`,
        message: 'Query parameter `q` is required',
      });
    }

    // Map user-facing type names to model names
    const typeMapping = {
      users: `User`,
      organizations: `Organization`,
    };

    let tables;
    if (type) {
      tables = type
        .split(`,`)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => typeMapping[t])
        .map((t) => typeMapping[t]);

      if (tables.length === 0) {
        return reply.code(400).send({
          error: `BAD_REQUEST`,
          message: `Invalid type filter. Supported: users, organizations`,
        });
      }
    }

    const results = await fullTextSearch(sequelize, {
      query: q,
      tables,
      limit: limit ? Number(limit) : undefined,
    });

    return results;
  });
}
