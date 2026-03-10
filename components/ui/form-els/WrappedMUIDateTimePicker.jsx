import { Controller } from 'react-hook-form';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DatePickerProvider from './DatePickerProvider';

export default function WrappedMUIDateTimePicker({ name, control, label, rules, ...props }) {
  return (
    <DatePickerProvider>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <DateTimePicker
            label={label}
            value={field.value}
            onChange={field.onChange}
            slotProps={{
              textField: {
                error: !!error,
                helperText: error?.message,
                fullWidth: true,
              },
            }}
            {...props}
          />
        )}
      />
    </DatePickerProvider>
  );
}
