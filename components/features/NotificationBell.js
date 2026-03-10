'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications.js';

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener(`mousedown`, handleClickOutside);
    }
    return () => document.removeEventListener(`mousedown`, handleClickOutside);
  }, [open]);

  function handleNotificationClick(notification) {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  }

  return (
    <div ref={containerRef} style={{ position: `relative`, display: `inline-block` }}>
      <button
        type={`button`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ``}`}
        style={{
          background: `none`,
          border: `none`,
          cursor: `pointer`,
          position: `relative`,
          fontSize: `1.5rem`,
          padding: `0.25rem`,
        }}
      >
        <svg
          xmlns={`http://www.w3.org/2000/svg`}
          width={`24`}
          height={`24`}
          viewBox={`0 0 24 24`}
          fill={`none`}
          stroke={`currentColor`}
          strokeWidth={`2`}
          strokeLinecap={`round`}
          strokeLinejoin={`round`}
        >
          <path d={`M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9`} />
          <path d={`M13.73 21a2 2 0 0 1-3.46 0`} />
        </svg>

        {unreadCount > 0 && (
          <span
            style={{
              position: `absolute`,
              top: `-2px`,
              right: `-4px`,
              background: `#ef4444`,
              color: `#fff`,
              borderRadius: `50%`,
              width: `18px`,
              height: `18px`,
              fontSize: `0.7rem`,
              fontWeight: 600,
              display: `flex`,
              alignItems: `center`,
              justifyContent: `center`,
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? `99+` : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: `absolute`,
            right: 0,
            top: `100%`,
            marginTop: `0.5rem`,
            width: `320px`,
            maxHeight: `400px`,
            overflowY: `auto`,
            background: `#fff`,
            border: `1px solid #e5e7eb`,
            borderRadius: `8px`,
            boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: `flex`,
              justifyContent: `space-between`,
              alignItems: `center`,
              padding: `0.75rem 1rem`,
              borderBottom: `1px solid #e5e7eb`,
            }}
          >
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button
                type={`button`}
                onClick={markAllRead}
                style={{
                  background: `none`,
                  border: `none`,
                  color: `#3b82f6`,
                  cursor: `pointer`,
                  fontSize: `0.8rem`,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          {loading && (
            <div style={{ padding: `1rem`, textAlign: `center`, color: `#999` }}>
              Loading...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div style={{ padding: `1rem`, textAlign: `center`, color: `#999` }}>
              No notifications
            </div>
          )}

          {!loading &&
            notifications.map((n) => (
              <button
                type={`button`}
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: `block`,
                  width: `100%`,
                  textAlign: `left`,
                  padding: `0.75rem 1rem`,
                  borderBottom: `1px solid #f3f4f6`,
                  background: n.isRead ? `#fff` : `#f0f7ff`,
                  cursor: `pointer`,
                  border: `none`,
                  borderBlockEnd: `1px solid #f3f4f6`,
                }}
              >
                <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: `0.9rem` }}>
                  {n.title}
                </div>
                {n.body && (
                  <div
                    style={{
                      fontSize: `0.8rem`,
                      color: `#6b7280`,
                      marginTop: `0.25rem`,
                      overflow: `hidden`,
                      textOverflow: `ellipsis`,
                      whiteSpace: `nowrap`,
                    }}
                  >
                    {n.body}
                  </div>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
