import fp from 'fastify-plugin';

async function errorHandlerPlugin(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    const isProd = process.env.NODE_ENV === `production`;

    // ── Sequelize ValidationError ───────────────────
    if (error.name === `SequelizeValidationError`) {
      return reply.code(400).send({
        error: `VALIDATION_ERROR`,
        message: `One or more fields failed validation`,
        details: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
          type: e.type,
        })),
      });
    }

    // ── Sequelize UniqueConstraintError ──────────────
    if (error.name === `SequelizeUniqueConstraintError`) {
      return reply.code(409).send({
        error: `CONFLICT`,
        message: `A record with that value already exists`,
        details: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

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
