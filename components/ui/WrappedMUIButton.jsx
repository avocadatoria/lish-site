import Button from '@mui/material/Button';

export default function WrappedMUIButton({
  children,
  disableRipple = true,
  enableRipple = false,
  ...props
}) {
  return (
    <Button 
      disableRipple={enableRipple ? false : disableRipple}
      {...props}
    >
      {children}
    </Button>
  );
}
