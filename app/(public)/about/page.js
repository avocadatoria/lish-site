import Typography from '@mui/material/Typography';

export const metadata = {
  title: `About | LISH`,
  description: `Learn more about LISH.`,
};

export default function AboutPage() {
  return (
    <main>
      <Typography variant="h4" component="h1">About</Typography>
      <Typography>This is the LISH webapp.</Typography>
    </main>
  );
}
