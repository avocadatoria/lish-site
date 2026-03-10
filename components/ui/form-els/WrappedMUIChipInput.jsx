import { Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { useState } from 'react';

export default function WrappedMUIChipInput({ 
  name, 
  control, 
  label, 
  rules,
  placeholder = `Type and press Enter`,
  ...props 
}) {
  const [inputValue, setInputValue] = useState(``);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const chips = field.value || [];

        const handleKeyDown = (e) => {
          if (e.key === `Enter` && inputValue.trim()) {
            e.preventDefault();
            if (!chips.includes(inputValue.trim())) {
              field.onChange([...chips, inputValue.trim()]);
            }
            setInputValue(``);
          } else if (e.key === `Backspace` && !inputValue && chips.length > 0) {
            field.onChange(chips.slice(0, -1));
          }
        };

        const handleDelete = (chipToDelete) => {
          field.onChange(chips.filter((chip) => chip !== chipToDelete));
        };

        return (
          <FormControl error={!!error} fullWidth {...props}>
            <TextField
              label={label}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              error={!!error}
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: `flex`, flexWrap: `wrap`, gap: 0.5, mr: 1 }}>
                    {chips.map((chip, index) => (
                      <Chip
                        key={index}
                        label={chip}
                        onDelete={() => handleDelete(chip)}
                        size={`small`}
                      />
                    ))}
                  </Box>
                ),
              }}
            />
            {error && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        );
      }}
    />
  );
}
