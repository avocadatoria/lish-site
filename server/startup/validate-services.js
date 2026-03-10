import { createLogger } from '../../common/logger.js';

const log = createLogger(`startup:services`);

/**
 * Ping external services. Failures are warnings, not fatal.
 */
export async function validateServices() {
  log.info(`Checking external service connectivity...`);

  const checks = [
    { name: `Auth0`, check: checkAuth0 },
    { name: `Stripe`, check: checkStripe },
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

async function checkAuth0() {
  const domain = process.env.AUTH0_DOMAIN;
  const res = await fetch(`https://${domain}/.well-known/openid-configuration`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function checkStripe() {
  const { default: Stripe } = await import(`stripe`);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  await stripe.balance.retrieve();
}

async function checkAwsS3() {
  const { S3Client, ListBucketsCommand } = await import(`@aws-sdk/client-s3`);
  const client = new S3Client({ region: process.env.AWS_REGION });
  await client.send(new ListBucketsCommand({}));
}
