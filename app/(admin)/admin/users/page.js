'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../../lib/api-client.js';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async (cursor = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: `20` });
      if (cursor) params.set(`cursor`, cursor);

      const data = await apiFetch(`/api/admin/users?${params}`);
      setUsers((prev) => (cursor ? [...prev, ...data.items] : data.items));
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function toggleField(userId, field, currentValue) {
    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: `PUT`,
        body: { [field]: !currentValue },
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, [field]: !currentValue } : u)),
      );
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>User Management</h1>
      <p>{total} total users</p>

      <table style={{ width: `100%`, borderCollapse: `collapse`, marginTop: `1rem` }}>
        <thead>
          <tr>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Email</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Name</th>
            <th style={{ textAlign: `center`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Active</th>
            <th style={{ textAlign: `center`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Admin</th>
            <th style={{ textAlign: `center`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Addresses</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>{user.email}</td>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>
                {user.firstName} {user.lastName}
              </td>
              <td style={{ textAlign: `center`, padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>
                <button
                  onClick={() => toggleField(user.id, `isActive`, user.isActive)}
                  style={{
                    padding: `0.25rem 0.75rem`,
                    backgroundColor: user.isActive ? `#4caf50` : `#f44336`,
                    color: `white`,
                    border: `none`,
                    borderRadius: 4,
                    cursor: `pointer`,
                  }}
                >
                  {user.isActive ? `Active` : `Inactive`}
                </button>
              </td>
              <td style={{ textAlign: `center`, padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>
                <button
                  onClick={() => toggleField(user.id, `isAdmin`, user.isAdmin)}
                  style={{
                    padding: `0.25rem 0.75rem`,
                    backgroundColor: user.isAdmin ? `#1976d2` : `#9e9e9e`,
                    color: `white`,
                    border: `none`,
                    borderRadius: 4,
                    cursor: `pointer`,
                  }}
                >
                  {user.isAdmin ? `Admin` : `User`}
                </button>
              </td>
              <td style={{ textAlign: `center`, padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>
                {user.addressCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>Loading...</p>}

      {hasMore && !loading && (
        <button
          onClick={() => fetchUsers(nextCursor)}
          style={{ marginTop: `1rem`, padding: `0.5rem 1rem`, cursor: `pointer` }}
        >
          Load More
        </button>
      )}
    </div>
  );
}
