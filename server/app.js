import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import corsPlugin from './plugins/cors.js';
import errorHandlerPlugin from './plugins/error-handler.js';

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
  app.register(rateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX),
    timeWindow: Number(process.env.RATE_LIMIT_WINDOW_SECS) * 1_000,
  });
  app.register(corsPlugin);
  app.register(errorHandlerPlugin);

  // Security headers
  app.addHook(`onSend`, (request, reply, payload, done) => {
    reply.header(`X-Content-Type-Options`, `nosniff`);
    reply.header(`Content-Security-Policy`, `frame-ancestors 'self' ${process.env.CMS_URL}`);
    reply.header(`Referrer-Policy`, `strict-origin-when-cross-origin`);
    reply.header(`X-DNS-Prefetch-Control`, `off`);
    reply.header(`X-Permitted-Cross-Domain-Policies`, `none`);
    done();
  });

  // Routes
  app.register(routes);

  return app;
}
