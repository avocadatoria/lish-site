import fp from 'fastify-plugin';
import cors from '@fastify/cors';

async function corsPlugin(fastify) {
  const isDev = process.env.NODE_ENV !== `production`;

  await fastify.register(cors, {
    origin: isDev ? true : process.env.APP_URL,
    credentials: true,
  });
}

export default fp(corsPlugin, {
  name: `cors`,
});
