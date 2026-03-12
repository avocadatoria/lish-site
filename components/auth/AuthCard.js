'use client';

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export default function AuthCard({ title, subtitle, children }) {
  return (
    <Container
      maxWidth={`xs`}
      sx={{
        display: `flex`,
        flexDirection: `column`,
        alignItems: `center`,
        justifyContent: `center`,
        minHeight: `calc(100vh - 140px)`,
        py: 4,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Link href={`/`}>
          <img src={`/images/header.png`} alt={`LISH Logo`} width={64} height={64} />
        </Link>
      </Box>

      <Paper
        elevation={0}
        sx={{
          width: `100%`,
          p: 4,
          border: `1px solid`,
          borderColor: `divider`,
          borderRadius: 2,
        }}
      >
        {title && (
          <Typography variant={`h5`} component={`h1`} fontWeight={600} gutterBottom>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant={`body2`} color={`text.secondary`} sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </Paper>
    </Container>
  );
}
