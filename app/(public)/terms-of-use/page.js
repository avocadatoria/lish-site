import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export const metadata = {
  title: `Terms of Use`,
  description: `Terms of use for our platform.`,
};

export default function TermsOfUsePage() {
  return (
    <Container maxWidth={`md`} sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>Terms of Use</Typography>
      <iframe
        src="https://app.termly.io/policy-viewer/policy.html?policyUUID=c3b32230-b03e-45b9-ab44-4e6ecf822784"
        style={{ width: `100%`, height: `80vh`, border: `none` }}
        title="Terms of Use"
      />
    </Container>
  );
}
