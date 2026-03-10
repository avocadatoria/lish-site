'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api-client.js';

export default function OrganizationDetailPage() {
  const { slug } = useParams();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/organizations/${slug}`)
      .then(setOrg)
      .catch(() => setOrg(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (!org) return <p>Organization not found.</p>;

  return (
    <main>
      <h1>{org.name}</h1>
      {org.description && <p>{org.description}</p>}
      {org.website && <p><a href={org.website} target={`_blank`} rel={`noopener noreferrer`}>{org.website}</a></p>}

      <h2>Members</h2>
      {org.members?.length > 0 ? (
        <ul>
          {org.members.map((m) => (
            <li key={m.id}>
              {m.User?.firstName} {m.User?.lastName} — {m.role}
            </li>
          ))}
        </ul>
      ) : (
        <p>No members.</p>
      )}
    </main>
  );
}
