import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

const FOOTER_LINKS = [
  { label: `Contact Us`, href: `/contact` },
  { label: `Terms of Use`, href: `/terms-of-use` },
  { label: `Privacy Policy`, href: `/privacy-policy` },
  { label: `Cookie Policy`, href: `/cookie-policy` },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: `auto`,
        textAlign: `center`,
        borderTop: `1px solid`,
        borderColor: `divider`,
        fontSize: `11px`,
      }}
    >
      <Box sx={{ display: `flex`, justifyContent: `center`, gap: 3, mb: 1, flexWrap: `wrap` }}>
        {FOOTER_LINKS.map(({ label, href }) => (
          <Typography
            key={href}
            component={Link}
            href={href}
            fontSize="inherit"
            color="text.secondary"
            sx={{ textDecoration: `none`, '&:hover': { textDecoration: `underline` } }}
          >
            {label}
          </Typography>
        ))}
        <Typography
          component="a"
          href="#"
          className="termly-display-preferences"
          fontSize="inherit"
          color="text.secondary"
          sx={{ textDecoration: `none`, '&:hover': { textDecoration: `underline` } }}
        >
          Consent Preferences
        </Typography>
        <Typography
          component="a"
          href="#"
          className="termly-display-preferences"
          fontSize="inherit"
          color="text.secondary"
          sx={{ textDecoration: `none`, '&:hover': { textDecoration: `underline` } }}
        >
          Do Not Sell or Share My Personal Information
        </Typography>
      </Box>
      <Typography fontSize="inherit" color="text.secondary">
        &copy; 2025–{new Date().getFullYear()} Prendox LLC. All rights reserved.
      </Typography>
    </Box>
  );
}
