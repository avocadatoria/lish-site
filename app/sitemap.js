export default async function sitemap() {
  const baseUrl = process.env.APP_URL;

  // Static pages
  const staticPages = [``, `/about`, `/wp-ssr`].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: `weekly`,
    priority: path === `` ? 1 : 0.8,
  }));

  // Could fetch dynamic slugs from API here
  // e.g. const orgs = await fetch(`${apiUrl}/api/public/organizations`).then(r => r.json());

  return staticPages;
}
