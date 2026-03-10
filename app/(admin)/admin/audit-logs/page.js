'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../../lib/api-client.js';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({ action: ``, resource: ``, userId: ``, startDate: ``, endDate: `` });

  const fetchLogs = useCallback(async (cursor = null, currentFilters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: `20` });
      if (cursor) params.set(`cursor`, cursor);
      if (currentFilters.action) params.set(`action`, currentFilters.action);
      if (currentFilters.resource) params.set(`resource`, currentFilters.resource);
      if (currentFilters.userId) params.set(`userId`, currentFilters.userId);
      if (currentFilters.startDate) params.set(`startDate`, currentFilters.startDate);
      if (currentFilters.endDate) params.set(`endDate`, currentFilters.endDate);

      const data = await apiFetch(`/api/admin/audit-logs?${params}`);
      setLogs((prev) => (cursor ? [...prev, ...data.items] : data.items));
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(null, filters);
  }, [fetchLogs, filters]);

  function handleFilterChange(field, value) {
    setLogs([]);
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Audit Logs</h1>

      <div style={{ display: `flex`, gap: `0.5rem`, flexWrap: `wrap`, marginBottom: `1rem` }}>
        <input
          type={`text`}
          placeholder={`Filter by action`}
          value={filters.action}
          onChange={(e) => handleFilterChange(`action`, e.target.value)}
          style={{ padding: `0.25rem 0.5rem` }}
        />
        <input
          type={`text`}
          placeholder={`Filter by resource`}
          value={filters.resource}
          onChange={(e) => handleFilterChange(`resource`, e.target.value)}
          style={{ padding: `0.25rem 0.5rem` }}
        />
        <input
          type={`text`}
          placeholder={`Filter by user ID`}
          value={filters.userId}
          onChange={(e) => handleFilterChange(`userId`, e.target.value)}
          style={{ padding: `0.25rem 0.5rem` }}
        />
        <input
          type={`date`}
          value={filters.startDate}
          onChange={(e) => handleFilterChange(`startDate`, e.target.value)}
          style={{ padding: `0.25rem 0.5rem` }}
        />
        <input
          type={`date`}
          value={filters.endDate}
          onChange={(e) => handleFilterChange(`endDate`, e.target.value)}
          style={{ padding: `0.25rem 0.5rem` }}
        />
      </div>

      <table style={{ width: `100%`, borderCollapse: `collapse`, marginTop: `1rem` }}>
        <thead>
          <tr>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Timestamp</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>User</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Action</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Resource</th>
            <th style={{ textAlign: `left`, padding: `0.5rem`, borderBottom: `2px solid #e0e0e0` }}>Resource ID</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>
                {log.User ? `${log.User.firstName || ``} ${log.User.lastName || ``} (${log.User.email})`.trim() : `—`}
              </td>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>{log.action}</td>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0` }}>{log.resource}</td>
              <td style={{ padding: `0.5rem`, borderBottom: `1px solid #f0f0f0`, fontFamily: `monospace`, fontSize: `0.85rem` }}>
                {log.resourceId || `—`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>Loading...</p>}

      {hasMore && !loading && (
        <button
          onClick={() => fetchLogs(nextCursor, filters)}
          style={{ marginTop: `1rem`, padding: `0.5rem 1rem`, cursor: `pointer` }}
        >
          Load More
        </button>
      )}
    </div>
  );
}
