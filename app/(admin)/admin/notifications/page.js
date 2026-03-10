'use client';

import { useState } from 'react';
import { apiFetch } from '../../../../lib/api-client.js';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState(``);
  const [body, setBody] = useState(``);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    setError(null);

    try {
      const data = await apiFetch(`/api/admin/notifications`, {
        method: `POST`,
        body: { title, body },
      });
      setResult(data);
      setTitle(``);
      setBody(``);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1>Send Notification</h1>
      <p>Send a system-wide notification to all active users.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 500, marginTop: `1rem` }}>
        <div style={{ marginBottom: `1rem` }}>
          <label htmlFor={`notif-title`} style={{ display: `block`, marginBottom: `0.25rem`, fontWeight: 500 }}>
            Title
          </label>
          <input
            id={`notif-title`}
            type={`text`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: `100%`, padding: `0.5rem`, boxSizing: `border-box` }}
          />
        </div>

        <div style={{ marginBottom: `1rem` }}>
          <label htmlFor={`notif-body`} style={{ display: `block`, marginBottom: `0.25rem`, fontWeight: 500 }}>
            Body
          </label>
          <textarea
            id={`notif-body`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={4}
            style={{ width: `100%`, padding: `0.5rem`, boxSizing: `border-box` }}
          />
        </div>

        <button
          type={`submit`}
          disabled={sending}
          style={{
            padding: `0.5rem 1.5rem`,
            backgroundColor: `#1976d2`,
            color: `white`,
            border: `none`,
            borderRadius: 4,
            cursor: sending ? `not-allowed` : `pointer`,
            opacity: sending ? 0.6 : 1,
          }}
        >
          {sending ? `Sending...` : `Send Notification`}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: `1rem`, padding: `1rem`, backgroundColor: `#e8f5e9`, borderRadius: 4 }}>
          <p style={{ margin: 0 }}>
            Notification sent to {result.sent} user{result.sent !== 1 ? `s` : ``}.
            {result.failed > 0 && ` ${result.failed} failed.`}
          </p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: `1rem`, padding: `1rem`, backgroundColor: `#ffebee`, borderRadius: 4 }}>
          <p style={{ margin: 0, color: `#c62828` }}>Error: {error}</p>
        </div>
      )}
    </div>
  );
}
