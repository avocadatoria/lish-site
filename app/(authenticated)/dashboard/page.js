'use client';

import Typography from '@mui/material/Typography';
import { useAuth } from '../../../hooks/useAuth.js';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <main>
      <Typography variant="h4" component="h1">Dashboard</Typography>
      <Typography>Welcome, {user?.firstName || `User`}!</Typography>
    </main>
  );
}
