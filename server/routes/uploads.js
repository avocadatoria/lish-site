import { getSignedUploadUrl } from '../services/aws/s3.js';
import { deleteObject } from '../services/aws/s3.js';
import { createLogger } from '../../common/logger.js';

const log = createLogger(`routes:uploads`);

/**
 * Upload routes — Fastify plugin.
 *
 * Requires the `auth` plugin to be registered (provides `fastify.requireAuth`).
 *
 * @param {import(`fastify`).FastifyInstance} fastify
 */
export default async function uploadRoutes(fastify) {
  /**
   * POST /api/uploads/signed-url
   *
   * Generate a pre-signed S3 upload URL and return it alongside the
   * CloudFront public URL the file will be accessible at after upload.
   */
  fastify.post(`/api/uploads/signed-url`, {
    preHandler: [fastify.requireAuth],
  }, async (request, reply) => {
    const { filename, contentType } = request.body || {};

    if (!filename || !contentType) {
      return reply.code(400).send({
        error: `BAD_REQUEST`,
        message: `filename and contentType are required`,
      });
    }

    const userId = request.user.id;
    const key = `uploads/${userId}/${Date.now()}-${filename}`;

    const uploadUrl = await getSignedUploadUrl(key, contentType);
    const publicUrl = `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${key}`;

    log.info({ key, userId }, `Generated signed upload URL for user`);

    return reply.send({ uploadUrl, key, publicUrl });
  });

  /**
   * DELETE /api/uploads/:key(*)
   *
   * Delete an uploaded file from S3.
   * The wildcard param captures the full S3 key including slashes.
   */
  fastify.delete(`/api/uploads/*`, {
    preHandler: [fastify.requireAuth],
  }, async (request, reply) => {
    const key = request.params[`*`];

    if (!key) {
      return reply.code(400).send({
        error: `BAD_REQUEST`,
        message: `key is required`,
      });
    }

    // Ensure the user can only delete their own uploads
    const expectedPrefix = `uploads/${request.user.id}/`;
    if (!key.startsWith(expectedPrefix)) {
      return reply.code(403).send({
        error: `FORBIDDEN`,
        message: `You can only delete your own uploads`,
      });
    }

    await deleteObject(key);
    log.info({ key }, `Deleted uploaded file`);

    return reply.code(204).send();
  });
}
