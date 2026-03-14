import Link from 'next/link';
import Typography from '@mui/material/Typography';
import { getServicesListByKey, getLocationsConfig } from '../lib/server-api.js';

export default async function HomePage() {
  const [services, locationsConfig] = await Promise.all([
    getServicesListByKey(`Homepage`),
    getLocationsConfig(),
  ]);

  const locations = locationsConfig?.Locations || [];

  return (
    <main>
      <Typography variant={`h4`} component={`h1`}>LISH</Typography>
      <Typography>This is the LISH webapp.</Typography>
      {services.length > 0 && (
        <ul style={{ marginTop: `2rem` }}>
          {services.map((s) => (
            <li key={s.documentId}>
              <Link href={`/services/${s.URLSlug}`}>
                {s.HomepageLabel || s.DefaultLabel}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {locations.length > 0 && (
        <ul style={{ marginTop: `2rem` }}>
          {locations.map((loc) => (
            <li key={loc.documentId}>{loc.Label}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
