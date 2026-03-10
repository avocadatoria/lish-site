'use client';

import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { apiFetch } from '../../lib/api-client.js';

export default function WordPressContent({ endpoint = `/api/wp/posts`, renderItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch(endpoint)
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [endpoint]);

  if (loading) return <Typography>Loading content...</Typography>;
  if (error) return <Typography>Error loading content: {error}</Typography>;
  if (items.length === 0) return <Typography>No content available.</Typography>;

  return (
    <div>
      {items.map((item) =>
        renderItem ? (
          renderItem(item)
        ) : (
          <article key={item.id}>
            <Typography variant="h5" component="h2" dangerouslySetInnerHTML={{ __html: item.title?.rendered || item.title }} />
            <div dangerouslySetInnerHTML={{ __html: item.content?.rendered || item.content }} />
          </article>
        )
      )}
    </div>
  );
}
