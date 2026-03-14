import { createHmac } from 'node:crypto';

export function verifyPreviewToken(url, token) {
  if (!token) return false;
  const expected = createHmac(`sha256`, process.env.PREVIEW_SECRET).update(url).digest(`hex`);
  return token === expected;
}
