'use client';

import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { apiFetch } from '../../../lib/api-client.js';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch(`/api/admin/stats`)
      .then((data) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>Loading stats...</Typography>;
  if (error) return <Typography>Error: {error}</Typography>;

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>Admin Dashboard</Typography>
      <div style={{ display: `grid`, gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, gap: `1rem`, marginTop: `1rem` }}>
        <div style={{ padding: `1.5rem`, border: `1px solid #e0e0e0`, borderRadius: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: `bold`, m: 0 }}>{stats.userCount}</Typography>
          <Typography color="text.secondary">Total Users</Typography>
        </div>
        <div style={{ padding: `1.5rem`, border: `1px solid #e0e0e0`, borderRadius: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: `bold`, m: 0 }}>{stats.orgCount}</Typography>
          <Typography color="text.secondary">Organizations</Typography>
        </div>
        <div style={{ padding: `1.5rem`, border: `1px solid #e0e0e0`, borderRadius: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: `bold`, m: 0 }}>{stats.inquiryCount}</Typography>
          <Typography color="text.secondary">Inquiries</Typography>
        </div>
        <div style={{ padding: `1.5rem`, border: `1px solid #e0e0e0`, borderRadius: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: `bold`, m: 0 }}>{stats.recentSignups}</Typography>
          <Typography color="text.secondary">Signups (7 days)</Typography>
        </div>
      </div>
    </div>
  );
}
