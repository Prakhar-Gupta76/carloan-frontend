import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

const bankInterestRates = [
  {
    bank: 'HDFC Bank',
    interestRate: '8%-10%'
  },
  {
    bank: 'Punjab National Bank',
    interestRate: '8%-9%'
  },
  {
    bank: 'ICICI Bank',
    interestRate: '8%-9.5%'
  },
  {
    bank: 'Axis Bank',
    interestRate: '9%-11%'
  },
  {
    bank: 'State Bank of India',
    interestRate: '7%-9%'
  },
  {
    bank: 'Punjab & Sindh Bank',
    interestRate: '8%-10%'
  },
  {
    bank: 'Kotak Mahindra Bank',
    interestRate: '9%-10.5%'
  },
  {
    bank: 'Indusland Bank',
    interestRate: '8%-10%'
  },
  {
    bank: 'Union Bank of India',
    interestRate: '8%-9.5%'
  },
  {
    bank: 'Indusland Bank',
    interestRate: '8%-9%'
  }
];

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
      <Table aria-label="bank interest rates table">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            {['S.No.', 'Bank', 'Interest Rates'].map((column) => (
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
          {bankInterestRates.map((bankInterestRate, index) => (
            <TableRow key={bankInterestRate.bank}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{bankInterestRate.bank}</TableCell>
              <TableCell>{bankInterestRate.interestRate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
