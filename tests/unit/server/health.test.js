import { describe, it, expect } from 'vitest';
import { buildApp } from '../../../server/app.js';

describe(`GET /api/health`, () => {
  it(`returns status ok`, async () => {
    const app = buildApp({ logger: false });
    const res = await app.inject({ method: `GET`, url: `/api/health` });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe(`ok`);
  });
});
