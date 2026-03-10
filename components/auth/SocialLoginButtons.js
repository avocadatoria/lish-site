'use client';

import Box from '@mui/material/Box';
import WrappedMUIButton from '../ui/WrappedMUIButton';

/**
 * Renders a vertical stack of third-party login buttons.
 *
 * @param {Array} providers - from AUTH_PROVIDERS config
 * @param {Function} onProviderClick - called with the connection string
 * @param {boolean} disabled
 */
export default function SocialLoginButtons({ providers, onProviderClick, disabled }) {
  if (!providers?.length) return null;

  return (
    <Box sx={{ display: `flex`, flexDirection: `column`, gap: 1.5 }}>
      {providers.map((provider) => (
        <WrappedMUIButton
          key={provider.id}
          variant={`outlined`}
          fullWidth
          disabled={disabled}
          onClick={() => onProviderClick(provider.connection)}
          startIcon={
            <img
              src={`/icons/auth/${provider.icon}`}
              alt=""
              width={20}
              height={20}
              style={{ display: `block` }}
            />
          }
          sx={{
            justifyContent: `center`,
            textTransform: `none`,
            fontWeight: 400,
            color: `text.primary`,
            borderColor: `divider`,
            '&:hover': {
              borderColor: `text.secondary`,
              backgroundColor: `action.hover`,
            },
          }}
        >
          Continue with {provider.label}
        </WrappedMUIButton>
      ))}
    </Box>
  );
}
