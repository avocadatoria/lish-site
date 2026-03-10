import Drawer from '@mui/material/Drawer';

export default function WrappedMUIDrawer({
  children,
  open,
  onClose,
  anchor = `right`,
  enableTransitions = false,
  width = 250,
  ...props
}) {

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor={anchor}
      PaperProps={{
        sx: {
          width: anchor === `left` || anchor === `right` ? width : `100%`,
          height: anchor === `top` || anchor === `bottom` ? `auto` : `100%`,
        }
      }}
      {...props}
    >
      {children}
    </Drawer>
  );
}

