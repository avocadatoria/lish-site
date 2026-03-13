export default async function routes(fastify) {
  fastify.register((await import(`./health.js`)).default);
  fastify.register((await import(`./strapi.js`)).default);
  fastify.register((await import(`./inquiries.js`)).default);
}
