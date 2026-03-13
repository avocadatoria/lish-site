/**
 * Server-side fetch helpers for calling Fastify API during SSR.
 */

const API_URL = process.env.API_URL;

async function serverFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    next: { revalidate: Number(process.env.SSR_REVALIDATE_SECS), ...options.next },
  });

  if (!res.ok) return null;
  return res.json();
}

/**
 * Fetch a Section by its URLSlug, with its Pages populated.
 */
export async function getSectionBySlug(slug) {
  const params = new URLSearchParams({
    'filters[URLSlug][$eq]': slug,
    'populate': `Pages`,
  });
  const result = await serverFetch(`/api/strapi/site-sections?${params}`);
  return result?.data?.[0] || null;
}

/**
 * Fetch a Page by its Slug.
 */
export async function getPageBySlug(slug) {
  const params = new URLSearchParams({
    'filters[Slug][$eq]': slug,
  });
  const result = await serverFetch(`/api/strapi/pages?${params}`);
  return result?.data?.[0] || null;
}

/**
 * Fetch a Page by its Slug with People (and their Photos) populated.
 * Preserves relation order from Strapi.
 */
export async function getPageWithPeople(slug) {
  const params = new URLSearchParams({
    'filters[Slug][$eq]': slug,
    'populate[People][populate]': `Photo`,
  });
  const result = await serverFetch(`/api/strapi/pages?${params}`);
  return result?.data?.[0] || null;
}

/**
 * Fetch the OurProvidersServices singleton — returns Services (with People
 * and Photos) in the order configured in Strapi.
 */
/**
 * Fetch a Service by its URLSlug.
 */
export async function getServiceBySlug(slug) {
  const params = new URLSearchParams({
    'filters[URLSlug][$eq]': slug,
  });
  const result = await serverFetch(`/api/strapi/services?${params}`);
  return result?.data?.[0] || null;
}

/**
 * Fetch the TestimonialsPageConfig singleton with its related Testimonials populated.
 */
export async function getTestimonialsPageConfig() {
  const params = new URLSearchParams({
    'populate': `testimonials`,
  });
  const result = await serverFetch(`/api/strapi/single/testimonials-page-config?${params}`);
  return result?.data || null;
}

export async function getProvidersPageServices() {
  const params = new URLSearchParams({
    'populate[services][populate][People][populate]': `Photo`,
  });
  const result = await serverFetch(`/api/strapi/single/our-providers-services-order?${params}`);
  return result?.data?.services || [];
}
