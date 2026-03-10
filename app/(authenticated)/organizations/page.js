'use client';

import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { apiFetch } from '../../../lib/api-client.js';

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/organizations`)
      .then((data) => setOrgs(data.data || data))
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <main>
      <Typography variant="h4" component="h1" gutterBottom>Organizations</Typography>
      {orgs.length === 0 ? (
        <Typography>No organizations yet.</Typography>
      ) : (
        <ul>
          {orgs.map((org) => (
            <li key={org.id}>
              <a href={`/organizations/${org.slug}`}>{org.name}</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
