import { createLogger } from '../../common/logger.js';

const log = createLogger(`startup:services`);

/**
 * Ping external services. Failures are warnings, not fatal.
 */
export async function validateServices() {
  log.info(`Checking external service connectivity...`);

  const checks = [
    { name: `AWS S3`, check: checkAwsS3 },
  ];

  for (const { name, check } of checks) {
    try {
      await check();
      log.info(`${name}: OK`);
    } catch (err) {
      log.warn({ err: err.message }, `${name}: UNREACHABLE (non-fatal)`);
    }
  }
}

async function checkAwsS3() {
  const { S3Client, ListBucketsCommand } = await import(`@aws-sdk/client-s3`);
  const client = new S3Client({ region: process.env.AWS_REGION });
  await client.send(new ListBucketsCommand({}));
}
