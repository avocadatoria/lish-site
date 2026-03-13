import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import corsPlugin from './plugins/cors.js';
import errorHandlerPlugin from './plugins/error-handler.js';
import ssePlugin from './plugins/sse.js';
import routes from './routes/index.js';

export function buildApp(opts = {}) {
  const isDev = process.env.NODE_ENV !== `production`;

  const defaultLogger = {
    level: process.env.LOG_LEVEL,
    ...(isDev && {
      transport: {
        target: `pino-pretty`,
        options: { colorize: true },
      },
    }),
  };

  const app = Fastify({
    logger: opts.logger ?? defaultLogger,
    ...opts,
  });

  // Plugins
  app.register(rateLimit, { global: false });
  app.register(corsPlugin);
  app.register(errorHandlerPlugin);
  app.register(ssePlugin);

  // Routes
  app.register(routes);

  return app;
}
