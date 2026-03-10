'use client';

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function WrappedMUIPasswordField({ name, control, label, rules, helperText, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label={label}
          type={showPassword ? `text` : `password`}
          error={!!error}
          helperText={error?.message || helperText}
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position={`end`}>
                  <IconButton
                    aria-label={showPassword ? `Hide password` : `Show password`}
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge={`end`}
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          {...props}
        />
      )}
    />
  );
}
