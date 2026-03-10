import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

export default function WrappedMUIToggleButtonGroup({
  value,
  onChange,
  options, // Array of { value, label, disabled? }
  exclusive = true,
  size = `small`,
  color = `primary`,
  enableRipple = false,
  sx,
  ...props
}) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive={exclusive}
      onChange={onChange}
      size={size}
      color={color}
      sx={sx}
      {...props}
    >
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          disableRipple={!enableRipple}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
