'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../hooks/useAuth.js';

export default function AdminLayout({ children }) {
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

  if (user.isAdmin !== true) {
    return (
      <main>
        <Typography variant="h4" component="h1">Access Denied</Typography>
        <Typography>You do not have permission to access the admin area.</Typography>
        <Link href={`/dashboard`}>Return to Dashboard</Link>
      </main>
    );
  }

  return (
    <div style={{ display: `flex`, minHeight: `100vh` }}>
      <nav style={{ width: 240, padding: `1rem`, borderRight: `1px solid #e0e0e0` }}>
        <Typography variant="h5" component="h2" gutterBottom>Admin</Typography>
        <ul style={{ listStyle: `none`, padding: 0 }}>
          <li style={{ marginBottom: `0.5rem` }}>
            <Link href={`/admin`}>Dashboard</Link>
          </li>
          <li style={{ marginBottom: `0.5rem` }}>
            <Link href={`/admin/users`}>Users</Link>
          </li>
          <li style={{ marginBottom: `0.5rem` }}>
            <Link href={`/admin/organizations`}>Organizations</Link>
          </li>
          <li style={{ marginBottom: `0.5rem` }}>
            <Link href={`/admin/inquiries`}>Inquiries</Link>
          </li>
          <li style={{ marginBottom: `0.5rem` }}>
            <Link href={`/admin/audit-logs`}>Audit Logs</Link>
          </li>
          <li style={{ marginBottom: `0.5rem` }}>
            <Link href={`/admin/notifications`}>Notifications</Link>
          </li>
        </ul>
        <hr />
        <Link href={`/dashboard`}>Back to App</Link>
      </nav>
      <main style={{ flex: 1, padding: `1rem` }}>
        {children}
      </main>
    </div>
  );
}
