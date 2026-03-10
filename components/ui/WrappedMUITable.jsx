import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function WrappedMUITable({
  headers,
  rows,
  striped = false,
  containerProps = {},
  ...props
}) {
  return (
    <TableContainer component={Paper} {...containerProps}>
      <Table {...props}>
        {headers && (
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index} {...(header.props || {})}>
                  {header.label || header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              sx={{
                ...(striped && rowIndex % 2 === 1 && { bgcolor: `action.hover` }),
              }}
            >
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} {...(cell.props || {})}>
                  {cell.content || cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
