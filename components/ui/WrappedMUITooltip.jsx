import Tooltip from '@mui/material/Tooltip';

export default function WrappedMUITooltip({
  children,
  title,
  enableTransitions = false,
  TransitionProps = { timeout: 0 },
  enterDelay = 0,
  leaveDelay = 0,
  disableInteractive = true,
  ...props
}) {

  return (
    <Tooltip
      title={title}
      TransitionProps={enableTransitions ? undefined : TransitionProps}
      enterDelay={enableTransitions ? undefined : enterDelay}
      leaveDelay={enableTransitions ? undefined : leaveDelay}
      disableInteractive={disableInteractive}
      {...props}
    >
      {children}
    </Tooltip>
  );
}
