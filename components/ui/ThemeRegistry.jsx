'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: `#556B2F`,
    },
    secondary: {
      main: `#424242`,
    },
  },
  typography: {
    fontFamily: `Inter, Roboto, Helvetica, Arial, sans-serif`,
    button: {
      textTransform: `none`,
    },
  },
  shape: {
    borderRadius: 4,
  },
  transitions: {
    // Global transition disable as backup (WrappedMUI components handle individually)
    create: () => `none`,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    // Ripple disabled globally as backup (WrappedMUIButton handles it)
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

export default function ThemeRegistry({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
