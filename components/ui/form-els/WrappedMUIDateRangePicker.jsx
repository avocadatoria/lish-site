import { Controller } from 'react-hook-form';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import DatePickerProvider from './DatePickerProvider';

export default function WrappedMUIDateRangePicker({ name, control, label, rules, ...props }) {
  return (
    <DatePickerProvider>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <DateRangePicker
            label={label}
            value={field.value || [null, null]}
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
