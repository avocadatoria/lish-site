import { createLogger } from '../../common/logger.js';

const log = createLogger(`services:strapi`);

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const headers = {
  Authorization: `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': `application/json`,
};

/**
 * Generic fetch helper for Strapi REST API.
 */
async function strapiFetch(url) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const err = new Error(`Strapi API error: ${response.status}`);
    err.statusCode = response.status;
    throw err;
  }

  return response.json();
}

/**
 * Fetch a list of entries from a collection type.
 *
 * @param {string} pluralApiId - e.g. 'pages', 'blog-posts'
 * @param {object} params - query params (pagination, filters, populate, sort, fields)
 * @returns {Promise<{ data: object[], meta: object }>}
 */
export async function getEntries(pluralApiId, params = {}) {
  const url = new URL(`/api/${pluralApiId}`, STRAPI_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  log.debug({ pluralApiId, params }, `Fetching Strapi entries`);
  return strapiFetch(url);
}

/**
 * Fetch a single entry by documentId.
 *
 * @param {string} pluralApiId - e.g. 'pages', 'blog-posts'
 * @param {string} documentId - Strapi document ID
 * @param {object} params - query params (populate, fields)
 * @returns {Promise<{ data: object, meta: object }>}
 */
export async function getEntry(pluralApiId, documentId, params = {}) {
  const url = new URL(`/api/${pluralApiId}/${documentId}`, STRAPI_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return strapiFetch(url);
}

/**
 * Fetch a single entry by slug field.
 *
 * @param {string} pluralApiId - e.g. 'pages'
 * @param {string} slug - the slug value
 * @param {object} params - additional query params
 * @returns {Promise<object>}
 */
export async function getEntryBySlug(pluralApiId, slug, params = {}) {
  const result = await getEntries(pluralApiId, {
    'filters[slug][$eq]': slug,
    ...params,
  });

  if (!result.data || result.data.length === 0) {
    const err = new Error(`Strapi entry not found: ${pluralApiId}/${slug}`);
    err.statusCode = 404;
    throw err;
  }

  return result.data[0];
}

/**
 * Fetch a single type entry (e.g. 'homepage').
 *
 * @param {string} singularApiId - e.g. 'homepage'
 * @param {object} params - query params (populate, fields)
 * @returns {Promise<{ data: object, meta: object }>}
 */
export async function getSingleType(singularApiId, params = {}) {
  const url = new URL(`/api/${singularApiId}`, STRAPI_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return strapiFetch(url);
}
