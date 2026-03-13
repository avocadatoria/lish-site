import * as strapiService from '../services/strapi.js';
import { processStrapiResponse } from '../services/cms-html.js';

export default async function strapiRoutes(fastify) {
  // ── GET /api/strapi/:pluralApiId ─────────────────────
  // List entries from any collection type
  fastify.get(`/api/strapi/:pluralApiId`, async (request) => {
    const { pluralApiId } = request.params;
    const result = await strapiService.getEntries(pluralApiId, request.query);
    return processStrapiResponse(result);
  });

  // ── GET /api/strapi/slug/:pluralApiId/:slug ──────────
  // Get a single entry by slug (must be before :documentId to avoid clash)
  fastify.get(`/api/strapi/slug/:pluralApiId/:slug`, async (request) => {
    const { pluralApiId, slug } = request.params;
    const result = await strapiService.getEntryBySlug(pluralApiId, slug, request.query);
    return processStrapiResponse(result);
  });

  // ── GET /api/strapi/single/:singularApiId ────────────
  // Get a single type entry
  fastify.get(`/api/strapi/single/:singularApiId`, async (request) => {
    const { singularApiId } = request.params;
    const result = await strapiService.getSingleType(singularApiId, request.query);
    return processStrapiResponse(result);
  });

  // ── GET /api/strapi/:pluralApiId/:documentId ─────────
  // Get a single entry by document ID
  fastify.get(`/api/strapi/:pluralApiId/:documentId`, async (request) => {
    const { pluralApiId, documentId } = request.params;
    const result = await strapiService.getEntry(pluralApiId, documentId, request.query);
    return processStrapiResponse(result);
  });
}
