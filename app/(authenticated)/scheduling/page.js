'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api-client.js';

export default function SchedulingPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    apiFetch(`/api/calendar/events`)
      .then((data) => {
        setEvents(data.events || data || []);
        setConnected(true);
      })
      .catch((err) => {
        if (err.status === 400 || err.data?.error === `CALENDAR_NOT_CONNECTED`) {
          setConnected(false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function connectCalendar() {
    window.location.href = `/api/calendar/connect`;
  }

  async function createMeeting() {
    try {
      const meeting = await apiFetch(`/api/meetings`, {
        method: `POST`,
        body: {
          topic: `Quick Meeting`,
          duration: 30,
          startTime: new Date(Date.now() + 3600000).toISOString(),
        },
      });
      alert(`Meeting created! Join URL: ${meeting.joinUrl}`);      } catch (err) {
      alert(`Failed: ${err.message}`);      }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <main>
      <h1>Scheduling</h1>

      {!connected ? (
        <div>
          <p>Connect your Google Calendar to view events.</p>
          <button onClick={connectCalendar}>Connect Google Calendar</button>
        </div>
      ) : (
        <>
          <h2>Your Events</h2>
          {events.length === 0 ? (
            <p>No upcoming events.</p>
          ) : (
            <ul>
              {events.map((event) => (
                <li key={event.id}>
                  <strong>{event.summary}</strong>
                  {event.start?.dateTime && (
                    <span> — {new Date(event.start.dateTime).toLocaleString()}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <h2>Zoom</h2>
      <button onClick={createMeeting}>Create Zoom Meeting</button>
    </main>
  );
}
