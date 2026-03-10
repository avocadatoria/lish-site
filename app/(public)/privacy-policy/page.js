import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export const metadata = {
  title: `Privacy Policy`,
  description: `Privacy policy for our platform.`,
};

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth={`md`} sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>Privacy Policy</Typography>
      <iframe
        src="https://app.termly.io/policy-viewer/policy.html?policyUUID=b28ce17c-8639-40b8-a84e-f67dc619bc24"
        style={{ width: `100%`, height: `80vh`, border: `none` }}
        title="Privacy Policy"
      />
    </Container>
  );
}
