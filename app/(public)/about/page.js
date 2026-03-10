import Typography from '@mui/material/Typography';

export const metadata = {
  title: `About | Kitchen Sink Webapp`,
  description: `Learn more about our platform.`,
};

export default function AboutPage() {
  return (
    <main>
      <Typography variant="h4" component="h1">About</Typography>
      <Typography>Kitchen Sink Webapp is a kitchen-sink template webapp.</Typography>
    </main>
  );
}
