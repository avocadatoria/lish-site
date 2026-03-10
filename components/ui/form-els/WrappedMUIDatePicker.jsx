import { Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DatePickerProvider from './DatePickerProvider';

export default function WrappedMUIDatePicker({ name, control, label, rules, ...props }) {
  return (
    <DatePickerProvider>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <DatePicker
            {...field}
            label={label}
            slotProps={{
              textField: {
                error: !!fieldState.error,
                helperText: fieldState.error?.message,
              },
            }}
            {...props}
          />
        )}
      />
    </DatePickerProvider>
  );
}
