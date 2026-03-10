import { useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';

function DraggablePaper(props) {
  const nodeRef = useRef(null);
  return (
    <Draggable 
      handle={`#draggable-dialog-title`} 
      nodeRef={nodeRef}
      cancel={`[class*="MuiDialogContent-root"]`}
    >
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  );
}

export default function WrappedMUIDialog({ 
  open,
  onClose,
  title,
  children,
  actions,
  draggable = true,
  maxWidth = `sm`,
  fullWidth = true,
  titleSx = {},
  ...props 
}) {

  return (
    <Dialog 
      open={open}
      onClose={onClose}
      PaperComponent={draggable ? DraggablePaper : Paper}
      aria-labelledby={draggable ? `draggable-dialog-title` : undefined}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      {...props}
    >
      <DialogTitle 
        id={draggable ? `draggable-dialog-title` : undefined}
        sx={{ 
          cursor: draggable ? `move` : `default`,
          bgcolor: `primary.main`,
          color: `primary.contrastText`,
          ...titleSx
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
