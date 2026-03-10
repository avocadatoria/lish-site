import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export const metadata = {
  title: `Cookie Policy`,
  description: `Cookie policy for our platform.`,
};

export default function CookiePolicyPage() {
  return (
    <Container maxWidth={`md`} sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>Cookie Policy</Typography>
      <iframe
        src="https://app.termly.io/policy-viewer/policy.html?policyUUID=858baae4-1a45-4a63-a213-865a8bc309b3"
        style={{ width: `100%`, height: `80vh`, border: `none` }}
        title="Cookie Policy"
      />
    </Container>
  );
}
