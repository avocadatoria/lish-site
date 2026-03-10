'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../../lib/api-client.js';

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchOrgs = useCallback(async (cursor = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: `20` });
      if (cursor) params.set(`cursor`, cursor);

      const data = await apiFetch(`/api/admin/organizations?${params}`);
      setOrgs((prev) => (cursor ? [...prev, ...data.items] : data.items));
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Organization Management</h1>

      <table style={{ width: `100%`, borderCollapse: `collapse`, marginTop: `1rem` }}>
        <thead>
          <tr>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Name</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Slug</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Owner</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Website</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org) => (
            <tr key={org.id}>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>{org.name}</td>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>{org.slug}</td>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>
                {org.owner ? `${org.owner.firstName || ``} ${org.owner.lastName || ``} (${org.owner.email})`.trim() : `—`}
              </td>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>
                {org.website ? (
                  <a href={org.website} target={`_blank`} rel={`noopener noreferrer`}>{org.website}</a>
                ) : `—`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>Loading...</p>}

      {hasMore && !loading && (
        <button
          onClick={() => fetchOrgs(nextCursor)}
          style={{ marginTop: `1rem`, padding: `0.5rem 1rem`, cursor: `pointer` }}
        >
          Load More
        </button>
      )}
    </div>
  );
}
