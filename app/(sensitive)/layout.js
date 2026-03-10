'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth.js';

export default function SensitiveLayout({ children }) {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();
  const [reauthing, setReauthing] = useState(false);

  const handleReauth = useCallback(async () => {
    setReauthing(true);
    const success = await refreshAuth();
    if (!success) {
      router.replace(`/login`);
    }
    setReauthing(false);
  }, [refreshAuth, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login`);
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && !user.emailVerified) {
      router.replace(`/verify-email`);
    }
  }, [loading, user, router]);

  // Trigger re-auth check on mount for sensitive pages
  useEffect(() => {
    if (user && !reauthing) {
      // The server will return 403 FRESH_AUTH_REQUIRED if stale
      // This is handled at the API call level
    }
  }, [user, reauthing, handleReauth]);

  if (loading) {
    return null;
  }

  if (!user || !user.emailVerified) {
    return null;
  }

  return (
    <>
      {reauthing && <div>Re-authenticating...</div>}
      {children}
    </>
  );
}
