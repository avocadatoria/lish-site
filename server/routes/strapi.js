import * as strapiService from '../services/strapi.js';
import { processStrapiResponse } from '../services/cms-html.js';

const ALLOWED_QUERY_KEYS = [`populate`, `sort`, `fields`, `status`];
const ALLOWED_QUERY_PREFIXES = [`filters[`, `populate[`, `sort[`, `fields[`, `pagination[`];

/**
 * Filter query params to only those safe to forward to Strapi.
 */
function sanitizeQuery(query) {
  const clean = {};
  for (const [key, value] of Object.entries(query)) {
    if (ALLOWED_QUERY_KEYS.includes(key) || ALLOWED_QUERY_PREFIXES.some((p) => key.startsWith(p))) {
      clean[key] = value;
    }
  }
  if (clean.status && clean.status !== `draft` && clean.status !== `published`) {
    delete clean.status;
  }
  return clean;
}

export default async function strapiRoutes(fastify) {
  // ── GET /api/strapi/:pluralApiId ─────────────────────
  // List entries from any collection type
  fastify.get(`/api/strapi/:pluralApiId`, async (request) => {
    const { pluralApiId } = request.params;
    const query = sanitizeQuery(request.query);
    const result = await strapiService.getEntries(pluralApiId, query);
    return processStrapiResponse(result, { status: query.status });
  });

  // ── GET /api/strapi/slug/:pluralApiId/:slug ──────────
  // Get a single entry by slug (must be before :documentId to avoid clash)
  fastify.get(`/api/strapi/slug/:pluralApiId/:slug`, async (request) => {
    const { pluralApiId, slug } = request.params;
    const query = sanitizeQuery(request.query);
    const result = await strapiService.getEntryBySlug(pluralApiId, slug, query);
    return processStrapiResponse(result, { status: query.status });
  });

  // ── GET /api/strapi/single/:singularApiId ────────────
  // Get a single type entry
  fastify.get(`/api/strapi/single/:singularApiId`, async (request) => {
    const { singularApiId } = request.params;
    const query = sanitizeQuery(request.query);
    const result = await strapiService.getSingleType(singularApiId, query);
    return processStrapiResponse(result, { status: query.status });
  });

  // ── GET /api/strapi/:pluralApiId/:documentId ─────────
  // Get a single entry by document ID
  fastify.get(`/api/strapi/:pluralApiId/:documentId`, async (request) => {
    const { pluralApiId, documentId } = request.params;
    const query = sanitizeQuery(request.query);
    const result = await strapiService.getEntry(pluralApiId, documentId, query);
    return processStrapiResponse(result, { status: query.status });
  });
}
