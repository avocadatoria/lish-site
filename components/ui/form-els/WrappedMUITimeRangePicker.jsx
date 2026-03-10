import { Controller } from 'react-hook-form';
import { TimeRangePicker } from '@mui/x-date-pickers-pro/TimeRangePicker';
import DatePickerProvider from './DatePickerProvider';

export default function WrappedMUITimeRangePicker({ name, control, label, rules, ...props }) {
  return (
    <DatePickerProvider>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <TimeRangePicker
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
