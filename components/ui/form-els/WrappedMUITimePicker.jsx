import { Controller } from 'react-hook-form';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DatePickerProvider from './DatePickerProvider';

export default function WrappedMUITimePicker({ name, control, label, rules, ...props }) {
  return (
    <DatePickerProvider>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <TimePicker
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
