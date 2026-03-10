import { Controller } from 'react-hook-form';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';

export default function WrappedMUIToggleButtonGroup({ 
  name, 
  control, 
  label, 
  rules,
  children,
  exclusive = true,
  ...props 
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error} fullWidth>
          {label && <FormLabel>{label}</FormLabel>}
          <ToggleButtonGroup
            value={field.value}
            onChange={(e, value) => field.onChange(value)}
            exclusive={exclusive}
            {...props}
          >
            {children}
          </ToggleButtonGroup>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
