import * as wpService from '../services/wordpress.js';

export default async function wordpressRoutes(fastify) {
  // ── GET /api/wp/posts ─────────────────────────────
  fastify.get(`/api/wp/posts`, async (request) => {
    const { page, per_page, search, categories } = request.query;
    const result = await wpService.getPosts({ page, per_page, search, categories });
    return result;
  });

  // ── GET /api/wp/posts/:id ─────────────────────────
  fastify.get(`/api/wp/posts/:id`, async (request) => {
    const post = await wpService.getPost(request.params.id);
    return post;
  });

  // ── GET /api/wp/pages/:slug ───────────────────────
  fastify.get(`/api/wp/pages/:slug`, async (request) => {
    const page = await wpService.getPage(request.params.slug);
    return page;
  });
}
