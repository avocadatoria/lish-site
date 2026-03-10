import { Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

export default function WrappedMUIAutocomplete({ name, control, label, rules, options, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl error={!!error} fullWidth>
          <Autocomplete
            options={options}
            value={value}
            onChange={(_, data) => onChange(data)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!error}
              />
            )}
            {...props}
          />
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
