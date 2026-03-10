export default async function routes(fastify) {
  fastify.register((await import(`./health.js`)).default);
  fastify.register((await import(`./auth.js`)).default);
  fastify.register((await import(`./users.js`)).default);
  fastify.register((await import(`./organizations.js`)).default);
  fastify.register((await import(`./stripe.js`)).default);
  fastify.register((await import(`./strapi.js`)).default);
  fastify.register((await import(`./wordpress.js`)).default);
  fastify.register((await import(`./ai.js`)).default);
  fastify.register((await import(`./uploads.js`)).default);
  fastify.register((await import(`./notifications.js`)).default);
  fastify.register((await import(`./invitations.js`)).default);
  fastify.register((await import(`./calendar.js`)).default);
  fastify.register((await import(`./meetings.js`)).default);
  fastify.register((await import(`./admin.js`)).default);
  fastify.register((await import(`./search.js`)).default);
  fastify.register((await import(`./export.js`)).default);
  fastify.register((await import(`./inquiries.js`)).default);
}
