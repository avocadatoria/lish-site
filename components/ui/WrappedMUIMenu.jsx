import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function WrappedMUIMenu({
  anchorEl,
  open,
  onClose,
  items, // Array of { label, onClick, icon?, disabled?, divider?, header? }
  dense = false,
  menuItemSx,
  ...props
}) {

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        list: { dense },
        ...(props.slotProps || {})
      }}
      {...props}
    >
      {items.map((item, index) => (
        item.divider ? (
          <MenuItem key={index} divider disabled sx={menuItemSx} />
        ) : item.header ? (
          <Box key={index} sx={{ px: 2, py: 1 }}>
            {item.header}
          </Box>
        ) : (
          <MenuItem
            key={index}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            disabled={item.disabled}
            sx={menuItemSx}
          >
            {item.icon && <Box component="span" sx={{ mr: 1, display: 'inline-flex', alignItems: 'center' }}>{item.icon}</Box>}
            {item.label}
          </MenuItem>
        )
      ))}
    </Menu>
  );
}
