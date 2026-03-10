import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { createLogger } from '../../../common/logger.js';

const log = createLogger(`services:aws:cloudfront`);

/**
 * Generate a signed CloudFront URL for private content.
 *
 * @param {string} path      - the path portion of the URL (e.g. `uploads/user123/file.pdf`)
 * @param {number} expiresIn - URL expiry in seconds (default 86400 = 24 hours)
 * @returns {string} signed CloudFront URL
 */
export function getSignedCloudfrontUrl(path, expiresIn = 86400) {
  const domain = process.env.AWS_CLOUDFRONT_DOMAIN;
  const url = `https://${domain}/${path}`;
  const dateLessThan = new Date(Date.now() + expiresIn * 1000).toISOString();

  const signedUrl = getSignedUrl({
    url,
    keyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID,
    privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
    dateLessThan,
  });

  log.info({ path, expiresIn }, `Generated signed CloudFront URL`);
  return signedUrl;
}
