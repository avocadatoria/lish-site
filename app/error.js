'use client';

import Typography from '@mui/material/Typography';

export default function Error({ error, reset }) {
  return (
    <main>
      <Typography variant="h4" component="h1">Something went wrong</Typography>
      <Typography>{error?.message || `An unexpected error occurred.`}</Typography>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
