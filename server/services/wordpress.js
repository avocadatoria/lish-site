const WP_API_URL = process.env.WORDPRESS_API_URL;

/**
 * Fetch posts from the WordPress REST API.
 *
 * @param {object} params - query params (page, per_page, search, categories, etc.)
 * @returns {Promise<{ posts: object[], total: number, totalPages: number }>}
 */
export async function getPosts(params = {}) {
  const url = new URL(`${WP_API_URL}/wp/v2/posts`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    const err = new Error(`WordPress API error: ${response.status}`);
    err.statusCode = response.status;
    throw err;
  }

  const posts = await response.json();
  return {
    posts,
    total: Number(response.headers.get(`X-WP-Total`) || 0),
    totalPages: Number(response.headers.get(`X-WP-TotalPages`) || 0),
  };
}

/**
 * Fetch a single post by ID.
 *
 * @param {number|string} id - WordPress post ID
 * @returns {Promise<object>}
 */
export async function getPost(id) {
  const response = await fetch(`${WP_API_URL}/wp/v2/posts/${id}`);
  if (!response.ok) {
    const err = new Error(`WordPress post not found: ${id}`);
    err.statusCode = response.status;
    throw err;
  }
  return response.json();
}

/**
 * Fetch a page by slug.
 *
 * @param {string} slug - WordPress page slug
 * @returns {Promise<object>}
 */
export async function getPage(slug) {
  const url = new URL(`${WP_API_URL}/wp/v2/pages`);
  url.searchParams.set(`slug`, slug);

  const response = await fetch(url);
  if (!response.ok) {
    const err = new Error(`WordPress API error: ${response.status}`);
    err.statusCode = response.status;
    throw err;
  }

  const pages = await response.json();
  if (pages.length === 0) {
    const err = new Error(`WordPress page not found: ${slug}`);
    err.statusCode = 404;
    throw err;
  }
  return pages[0];
}
