import CircularProgress from '@mui/material/CircularProgress';

export default function WrappedMUICircularProgress({
  size = 40,
  color = `primary`, // `primary` | `secondary` | `error` | `info` | `success` | `warning` | `inherit`
  thickness = 3.6,
  ...props
}) {
  return (
    <CircularProgress
      size={size}
      color={color}
      thickness={thickness}
      {...props}
    />
  );
}
