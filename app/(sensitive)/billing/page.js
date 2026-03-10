'use client';

import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { apiFetch } from '../../../lib/api-client.js';

export default function BillingPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/stripe/subscription`)
      .then(setSubscription)
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, []);

  async function openPortal() {
    try {
      const { url } = await apiFetch(`/api/stripe/portal`, { method: `POST` });
      window.location.href = url;
    } catch (err) {
      console.error(`Failed to open portal:`, err);
    }
  }

  async function startCheckout() {
    try {
      const { url } = await apiFetch(`/api/stripe/checkout`, { method: `POST` });
      window.location.href = url;
    } catch (err) {
      console.error(`Failed to start checkout:`, err);
    }
  }

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <main>
      <Typography variant="h4" component="h1" gutterBottom>Billing</Typography>
      {subscription ? (
        <div>
          <Typography>Status: {subscription.status}</Typography>
          <Typography>Plan: {subscription.plan || `N/A`}</Typography>
          <button onClick={openPortal}>Manage Subscription</button>
        </div>
      ) : (
        <div>
          <Typography>No active subscription.</Typography>
          <button onClick={startCheckout}>Subscribe</button>
        </div>
      )}
    </main>
  );
}
