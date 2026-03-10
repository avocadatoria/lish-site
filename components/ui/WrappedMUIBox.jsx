import Box from '@mui/material/Box';

export default function WrappedMUIBox({ children, ...props }) {
  return (
    <Box {...props}>
      {children}
    </Box>
  );
}
