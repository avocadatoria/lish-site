import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';

export default function WrappedMUITextField({ name, control, label, rules, type = `text`, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label={label}
          type={type}
          error={!!error}
          helperText={error?.message}
          fullWidth
          {...props}
        />
      )}
    />
  );
}
