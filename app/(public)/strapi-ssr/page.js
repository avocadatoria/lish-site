import Link from 'next/link';
import Typography from '@mui/material/Typography';

/**
 * Strapi pages rendered server-side (SSR for SEO).
 * Server Component — fetches from Fastify API directly (bypassing Nginx).
 */
export const metadata = {
  title: `CMS Pages | LISH`,
  description: `Content managed via Strapi CMS.`,
};

async function getStrapiPages() {
  try {
    const res = await fetch(`${process.env.API_URL}/api/strapi/pages?populate=*`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result.data || [];
  } catch {
    return [];
  }
}

export default async function StrapiSsrPage() {
  const pages = await getStrapiPages();

  return (
    <main>
      <Typography variant="h4" component="h1" gutterBottom>CMS Pages (SSR)</Typography>
      {pages.length === 0 ? (
        <Typography>No pages published.</Typography>
      ) : (
        <ul>
          {pages.map((page) => (
            <li key={page.documentId}>
              <Typography variant="h6" component="h3">
                <Link href={`/strapi-page/${page.slug}`}>{page.title}</Link>
              </Typography>
              {page.excerpt && <Typography>{page.excerpt}</Typography>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
