'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../lib/api-client.js';

export default function InvitationPage() {
  const { token } = useParams();
  const router = useRouter();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch(`/api/invitations/${token}`)
      .then(setInvitation)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    setProcessing(true);
    try {
      await apiFetch(`/api/invitations/${token}/accept`, { method: `POST` });
      router.push(`/organizations`);
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  }

  async function handleDecline() {
    setProcessing(true);
    try {
      await apiFetch(`/api/invitations/${token}/decline`, { method: `POST` });
      router.push(`/dashboard`);
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  }

  if (loading) return <p>Loading invitation...</p>;
  if (error && !invitation) return <p>Error: {error}</p>;
  if (!invitation) return <p>Invitation not found.</p>;

  if (invitation.status !== `pending`) {
    return (
      <main>
        <h1>Invitation</h1>
        <p>This invitation has already been {invitation.status}.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Organization Invitation</h1>
      {error && <p style={{ color: `red` }}>{error}</p>}

      <p>
        You have been invited to join <strong>{invitation.organizationName}</strong> as
        a <strong>{invitation.role}</strong>.
      </p>

      <div style={{ display: `flex`, gap: `1rem`, marginTop: `1rem` }}>
        <button onClick={handleAccept} disabled={processing}>
          {processing ? `Processing...` : `Accept`}
        </button>
        <button onClick={handleDecline} disabled={processing}>
          Decline
        </button>
      </div>
    </main>
  );
}
