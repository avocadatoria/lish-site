import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function WrappedMUISnackbar({
  open,
  onClose,
  message,
  severity = `success`,
  autoHideDuration = 3000,
  enableTransitions = false,
  anchorOrigin = { vertical: `bottom`, horizontal: `right` },
  children,
  ...props
}) {

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      {...props}
    >
      {children || (
        <Alert onClose={onClose} severity={severity} sx={{ width: `100%` }}>
          {message}
        </Alert>
      )}
    </Snackbar>
  );
}
