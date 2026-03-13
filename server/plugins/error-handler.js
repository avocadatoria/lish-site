import fp from 'fastify-plugin';

async function errorHandlerPlugin(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    const isProd = process.env.NODE_ENV === `production`;

    // ── Zod validation errors ───────────────────────
    if (error.name === `ZodError` || error.issues) {
      return reply.code(400).send({
        error: `VALIDATION_ERROR`,
        message: `Request validation failed`,
        details: (error.issues || error.errors).map((issue) => ({
          field: issue.path?.join(`.`),
          message: issue.message,
        })),
      });
    }

    // ── Errors with explicit status codes ───────────
    if (error.statusCode) {
      return reply.code(error.statusCode).send({
        error: error.code || `ERROR`,
        message: error.message,
      });
    }

    // ── Default 500 ─────────────────────────────────
    request.log.error(error);

    return reply.code(500).send({
      error: `INTERNAL_SERVER_ERROR`,
      message: isProd ? `An unexpected error occurred` : error.message,
    });
  });
}

export default fp(errorHandlerPlugin, {
  name: `error-handler`,
});
