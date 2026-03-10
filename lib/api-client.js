/**
 * API fetch wrapper with credentials, JSON, and error handling.
 * Used by client-side code to call the Fastify API through Nginx.
 *
 * @param {string} path - API path (e.g. `/api/users/me`)
 * @param {RequestInit} [options] - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiFetch(path, options = {}) {
  const { body, headers: customHeaders, ...rest } = options;

  const headers = {
    ...customHeaders,
  };

  if (body && !(body instanceof FormData)) {
    headers[`Content-Type`] = `application/json`;
  }

  const res = await fetch(path, {
    credentials: `include`,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: res.statusText };
    }

    const err = new Error(errorData.message || `API error: ${res.status}`);
    err.status = res.status;
    err.data = errorData;
    throw err;
  }

  // Handle 204 No Content
  if (res.status === 204) return null;

  const contentType = res.headers.get(`content-type`);
  if (contentType?.includes(`application/json`)) {
    return res.json();
  }

  return res;
}
