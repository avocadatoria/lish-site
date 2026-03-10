export default function robots() {
  const baseUrl = process.env.APP_URL;
  return {
    rules: [
      {
        userAgent: `*`,
        allow: `/`,
        disallow: [`/dashboard`, `/settings`, `/billing`, `/admin`, `/api/`],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
