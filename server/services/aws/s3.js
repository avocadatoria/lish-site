import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createLogger } from '../../../common/logger.js';

const log = createLogger(`services:aws:s3`);

let _client = null;

function getClient() {
  if (!_client) {
    _client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    log.info(`S3Client initialized`);
  }
  return _client;
}

/**
 * Generate a pre-signed PUT URL for uploading an object to S3.
 *
 * @param {string} key         - S3 object key
 * @param {string} contentType - MIME type of the object
 * @param {number} expiresIn   - URL expiry in seconds (default 3600)
 * @returns {Promise<string>} signed upload URL
 */
export async function getSignedUploadUrl(key, contentType, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(getClient(), command, { expiresIn });
  log.info({ key, contentType, expiresIn }, `Generated signed upload URL`);
  return url;
}

/**
 * Generate a pre-signed GET URL for downloading an object from S3.
 *
 * @param {string} key       - S3 object key
 * @param {number} expiresIn - URL expiry in seconds (default 3600)
 * @returns {Promise<string>} signed download URL
 */
export async function getSignedDownloadUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(getClient(), command, { expiresIn });
  log.info({ key, expiresIn }, `Generated signed download URL`);
  return url;
}

/**
 * Delete an object from S3.
 *
 * @param {string} key - S3 object key to delete
 * @returns {Promise<void>}
 */
export async function deleteObject(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  await getClient().send(command);
  log.info({ key }, `Deleted S3 object`);
}
