import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Collapse from '@mui/material/Collapse';

export default function WrappedMUIAlert({
  severity = `warning`, // `error` | `warning` | `info` | `success`
  variant = `standard`, // `standard` | `filled` | `outlined`
  title,
  children,
  icon,
  onClose,
  action,
  show = true,
  enableTransitions = false,
  sx,
  ...props
}) {
  const alert = (
    <Alert
      severity={severity}
      variant={variant}
      icon={icon}
      onClose={onClose}
      action={action}
      sx={{
        ...(!enableTransitions && {
          transition: `none !important`,
        }),
        ...sx,
      }}
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </Alert>
  );

  if (enableTransitions) {
    return (
      <Collapse in={show}>
        {alert}
      </Collapse>
    );
  }

  return show ? alert : null;
}
