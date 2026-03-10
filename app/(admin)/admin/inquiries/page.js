'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../../lib/api-client.js';

const STATUS_COLORS = {
  new: { bg: `#e3f2fd`, color: `#1565c0` },
  read: { bg: `#fff3e0`, color: `#e65100` },
  replied: { bg: `#e8f5e9`, color: `#2e7d32` },
  archived: { bg: `#f5f5f5`, color: `#616161` },
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState(``);

  const fetchInquiries = useCallback(async (cursor = null, status = ``) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: `20` });
      if (cursor) params.set(`cursor`, cursor);
      if (status) params.set(`status`, status);

      const data = await apiFetch(`/api/inquiries?${params}`);
      setInquiries((prev) => (cursor ? [...prev, ...data.items] : data.items));
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries(null, statusFilter);
  }, [fetchInquiries, statusFilter]);

  function handleStatusChange(e) {
    setStatusFilter(e.target.value);
    setInquiries([]);
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Inquiry Management</h1>

      <div style={{ marginBottom: `1rem` }}>
        <label htmlFor={`status-filter`} style={{ marginRight: `0.5rem` }}>Filter by status:</label>
        <select
          id={`status-filter`}
          value={statusFilter}
          onChange={handleStatusChange}
          style={{ padding: `0.25rem 0.5rem` }}
        >
          <option value={``}>All</option>
          <option value={`new`}>New</option>
          <option value={`read`}>Read</option>
          <option value={`replied`}>Replied</option>
          <option value={`archived`}>Archived</option>
        </select>
      </div>

      <table style={{ width: `100%`, borderCollapse: `collapse`, marginTop: `1rem` }}>
        <thead>
          <tr>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Name</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Email</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Subject</th>
            <th style={{ textAlign: `center`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Status</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => {
            const statusStyle = STATUS_COLORS[inquiry.status] || STATUS_COLORS.new;
            return (
              <tr key={inquiry.id}>
                <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>{inquiry.name}</td>
                <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>{inquiry.email}</td>
                <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>{inquiry.subject}</td>
                <td style={{ textAlign: `center`, padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>
                  <span style={{
                    display: `inline-block`,
                    padding: `0.2rem 0.6rem`,
                    borderRadius: 12,
                    fontSize: `0.85rem`,
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    fontWeight: 500,
                  }}>
                    {inquiry.status}
                  </span>
                </td>
                <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {loading && <p>Loading...</p>}

      {hasMore && !loading && (
        <button
          onClick={() => fetchInquiries(nextCursor, statusFilter)}
          style={{ marginTop: `1rem`, padding: `0.5rem 1rem`, cursor: `pointer` }}
        >
          Load More
        </button>
      )}
    </div>
  );
}
