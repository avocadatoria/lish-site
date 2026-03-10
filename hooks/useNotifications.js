'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api-client.js';

/**
 * Notifications hook — fetches notifications and unread count,
 * provides mark-as-read helpers.
 *
 * @returns {{
 *   notifications: Array,
 *   unreadCount: number,
 *   loading: boolean,
 *   markAsRead: (id: string) => Promise<void>,
 *   markAllRead: () => Promise<void>,
 *   refresh: () => Promise<void>,
 * }}
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/notifications`);
      setNotifications(data.items || []);
    } catch {
      // Swallow — user may not be authenticated yet
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/notifications/unread-count`);
      setUnreadCount(data.count);
    } catch {
      // Swallow
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    setLoading(false);
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markAsRead = useCallback(async (id) => {
    await apiFetch(`/api/notifications/${id}/read`, { method: `PUT` });

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await apiFetch(`/api/notifications/read-all`, { method: `PUT` });

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
    );
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllRead, refresh };
}
