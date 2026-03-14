/**
 * Quick Strapi API fetch utility.
 * Usage: node scripts/strapi-fetch.js <path>
 * Example: node scripts/strapi-fetch.js /api/main-navigation?populate=Services
 */

import 'dotenv/config';

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const path = process.argv[2];
if (!path) {
  console.error(`Usage: node scripts/strapi-fetch.js <path>`);
  process.exit(1);
}

const url = `${STRAPI_URL}${path}`;
console.log(`GET ${url}\n`);

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
});

console.log(`Status: ${res.status}`);
const json = await res.json();
console.log(JSON.stringify(json, null, 2));
