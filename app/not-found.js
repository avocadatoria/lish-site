import Link from 'next/link';
import Typography from '@mui/material/Typography';

export default function NotFound() {
  return (
    <main>
      <Typography variant="h4" component="h1">404</Typography>
      <Typography>Page not found.</Typography>
      <Link href={`/`}>Go home</Link>
    </main>
  );
}
