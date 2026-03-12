import Typography from '@mui/material/Typography';

/**
 * WordPress content rendered server-side (SSR for SEO).
 * Server Component — fetches from Fastify API directly (bypassing Nginx).
 */
export const metadata = {
  title: `Blog | LISH`,
  description: `Latest posts from our blog.`,
};

async function getWordPressPosts() {
  try {
    const res = await fetch(`${process.env.API_URL}/api/wp/posts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function WordPressSsrPage() {
  const posts = await getWordPressPosts();

  return (
    <main>
      <Typography variant="h4" component="h1" gutterBottom>Blog</Typography>
      {posts.length === 0 ? (
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
