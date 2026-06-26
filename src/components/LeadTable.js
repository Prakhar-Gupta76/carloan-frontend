import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

const columns = ['Customer Name', 'Mobile Number', 'Status'];

export default function LeadTable() {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <Table aria-label="customer leads table">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            {columns.map((column) => (
              <TableCell
                key={column}
                sx={{
                  color: 'primary.contrastText',
                  fontWeight: 700,
                  letterSpacing: 0
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length} sx={{ p: 0, borderBottom: 0 }}>
              <Box
                sx={{
                  alignItems: 'center',
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  justifyContent: 'center',
                  minHeight: { xs: 220, md: 420 },
                  px: 2
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  No records available.
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
