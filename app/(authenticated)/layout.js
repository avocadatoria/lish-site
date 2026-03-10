'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth.js';

export default function AuthenticatedLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  if (loading) {
    return null;
  }

  if (!user || !user.emailVerified) {
    return null;
  }

  return <>{children}</>;
}
