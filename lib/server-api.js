/**
 * Server-side fetch helpers for calling Fastify API during SSR.
 */

const API_URL = process.env.API_URL;

async function serverFetch(path, { draft, ...options } = {}) {
  const url = new URL(`${API_URL}${path}`);
  if (draft) {
    url.searchParams.set(`status`, `draft`);
  }

  const res = await fetch(url, {
    ...options,
    next: draft
      ? { revalidate: 0, ...options.next }
      : { revalidate: Number(process.env.SSR_REVALIDATE_SECS), ...options.next },
  });

  if (!res.ok) return null;
  return res.json();
}

/**
 * Fetch a Section by its URLSlug, with its Pages populated.
 */
export async function getSectionBySlug(slug, opts = {}) {
  const params = new URLSearchParams({
    'filters[URLSlug][$eq]': slug,
    'populate': `Pages`,
  });
  const result = await serverFetch(`/api/strapi/site-sections?${params}`, opts);
  return result?.data?.[0] || null;
}

/**
 * Fetch a Page by its Slug.
 */
export async function getPageBySlug(slug, opts = {}) {
  const params = new URLSearchParams({
    'filters[Slug][$eq]': slug,
  });
  const result = await serverFetch(`/api/strapi/pages?${params}`, opts);
  return result?.data?.[0] || null;
}

/**
 * Fetch a Service by its URLSlug.
 */
export async function getServiceBySlug(slug, opts = {}) {
  const params = new URLSearchParams({
    'filters[URLSlug][$eq]': slug,
  });
  const result = await serverFetch(`/api/strapi/services?${params}`, opts);
  return result?.data?.[0] || null;
}

/**
 * Fetch the TestimonialsPageConfig singleton with its related Testimonials populated.
 */
export async function getTestimonialsPageConfig(opts = {}) {
  const params = new URLSearchParams({
    'populate': `testimonials`,
  });
  const result = await serverFetch(`/api/strapi/single/testimonials-page-config?${params}`, opts);
  return result?.data || null;
}

/**
 * Fetch a PeopleList by its Key, with People and their Photos populated.
 */
export async function getPeopleListByKey(key, opts = {}) {
  const params = new URLSearchParams({
    'filters[Key][$eq]': key,
    'populate[People][populate]': `Photo`,
  });
  const result = await serverFetch(`/api/strapi/people-lists?${params}`, opts);
  return result?.data?.[0] || null;
}

/**
 * Fetch a ServicesList by its Key, with Services populated.
 */
export async function getServicesListByKey(key, opts = {}) {
  const params = new URLSearchParams({
    'filters[Key][$eq]': key,
    'populate': `Services`,
  });
  const result = await serverFetch(`/api/strapi/services-lists?${params}`, opts);
  return result?.data?.[0]?.Services || [];
}

/**
 * Fetch LocationsConfig singleton with Locations populated.
 */
export async function getLocationsConfig(opts = {}) {
  const result = await serverFetch(`/api/strapi/single/locations-config?populate=Locations`, opts);
  return result?.data || null;
}

export async function getProvidersPageServices(opts = {}) {
  const listParams = new URLSearchParams({
    'filters[Key][$eq]': `OurProvidersPage`,
    'populate': `Services`,
  });
  const listResult = await serverFetch(`/api/strapi/services-lists?${listParams}`, opts);
  const orderedServices = listResult?.data?.[0]?.Services || [];
  if (orderedServices.length === 0) return [];

  const params = new URLSearchParams({
    'populate[PeopleList][populate][People][populate]': `Photo`,
    'pagination[pageSize]': `100`,
  });
  orderedServices.forEach((s, i) => {
    params.append(`filters[documentId][$in][${i}]`, s.documentId);
  });
  const allResult = await serverFetch(`/api/strapi/services?${params}`, opts);
  const serviceMap = new Map((allResult?.data || []).map((s) => [s.documentId, s]));

  return orderedServices
    .map((s) => serviceMap.get(s.documentId))
    .filter(Boolean)
    .map((s) => ({ ...s, People: s.PeopleList?.People || [] }));
}
