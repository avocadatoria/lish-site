import fp from 'fastify-plugin';

const STATUS_MESSAGES = {
  400: `Bad request`,
  401: `Unauthorized`,
  403: `Forbidden`,
  404: `Not found`,
  409: `Conflict`,
  422: `Unprocessable entity`,
  429: `Too many requests`,
};

async function errorHandlerPlugin(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
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
      request.log.error(error);
      return reply.code(error.statusCode).send({
        error: error.code || `ERROR`,
        message: STATUS_MESSAGES[error.statusCode] || `Request failed`,
      });
    }

    // ── Default 500 ─────────────────────────────────
    request.log.error(error);

    return reply.code(500).send({
      error: `INTERNAL_SERVER_ERROR`,
      message: `An unexpected error occurred`,
    });
  });
}

export default fp(errorHandlerPlugin, {
  name: `error-handler`,
});
