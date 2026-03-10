import { Controller } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Slider from '@mui/material/Slider';
import FormHelperText from '@mui/material/FormHelperText';

export default function WrappedMUISlider({ name, control, label, rules, min = 0, max = 100, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error} fullWidth>
          {label && <FormLabel>{label}</FormLabel>}
          <Slider
            {...field}
            min={min}
            max={max}
            {...props}
          />
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
