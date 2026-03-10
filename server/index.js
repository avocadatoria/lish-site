import 'dotenv/config';
import { buildApp } from './app.js';

const PORT = process.env.API_PORT;
const HOST = `0.0.0.0`;

const app = buildApp();

try {
  await app.listen({ port: Number(PORT), host: HOST });
  app.log.info(`Fastify API listening on ${HOST}:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
