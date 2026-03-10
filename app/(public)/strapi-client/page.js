'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import { apiFetch } from '../../../lib/api-client.js';

/**
 * Strapi pages rendered client-side.
 * Fetches through Nginx from the browser.
 */
export default function StrapiClientPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/strapi/pages?populate=*`)
      .then((result) => setPages(result.data || []))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main><Typography>Loading...</Typography></main>;

  return (
    <main>
      <Typography variant="h4" component="h1" gutterBottom>CMS Pages (Client-Side)</Typography>
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
