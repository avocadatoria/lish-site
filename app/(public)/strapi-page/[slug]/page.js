import Link from 'next/link';
import Typography from '@mui/material/Typography';

/**
 * Single CMS page — SSR for SEO.
 * Fetches by slug from Fastify → Strapi.
 */

async function getPage(slug) {
  const res = await fetch(`${process.env.API_URL}/api/strapi/slug/pages/${slug}?populate=*`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: `Page Not Found` };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt || ``,
  };
}

export default async function StrapiPageDetail({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return (
      <main>
        <Typography variant="h4" component="h1">Page not found</Typography>
        <Link href="/strapi-ssr">Back to CMS pages</Link>
      </main>
    );
  }

  return (
    <main>
      <article>
        <Typography variant="h4" component="h1" gutterBottom>{page.title}</Typography>
        {page.excerpt && <Typography color="text.secondary" sx={{ mb: 2 }}><em>{page.excerpt}</em></Typography>}
        {page.content && (
          <div className="cms-content" dangerouslySetInnerHTML={{ __html: page.content }} />
        )}
      </article>
      <Typography sx={{ mt: 4 }}>
        <Link href="/strapi-ssr">Back to CMS pages</Link>
      </Typography>
    </main>
  );
}
