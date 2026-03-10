'use client';

import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { apiFetch } from '../../../lib/api-client.js';

/**
 * WordPress content rendered client-side.
 * Fetches through Nginx from the browser.
 */
export default function WordPressClientPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/wp/posts`)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <Typography variant="h4" component="h1" gutterBottom>Blog (Client-Side)</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : posts.length === 0 ? (
        <Typography>No posts available.</Typography>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Typography variant="h5" component="h2" dangerouslySetInnerHTML={{ __html: post.title?.rendered || post.title }} />
              <div dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered || post.excerpt }} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
