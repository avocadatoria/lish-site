import fp from 'fastify-plugin';
import cors from '@fastify/cors';

async function corsPlugin(fastify) {
  const corsOrigin = process.env.CORS_ORIGIN;
  await fastify.register(cors, {
    origin: corsOrigin === `*` ? true : corsOrigin.split(`,`).map((o) => o.trim()),
    credentials: true,
  });
}

export default fp(corsPlugin, {
  name: `cors`,
});
