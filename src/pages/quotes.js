import { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { getQuotes, getUser, saveUser } from '@/api/auth';
import { setUser } from '@/redux/slices/authSlice';

const initialFilters = {
  salary: 0,
  loan_amount: 0,
  loan_tenure: 0
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

export default function QuotesPage() {
  const dispatch = useDispatch();
  const { mobileNumber, user } = useSelector((state) => state.auth);

  const requestMobileNumber = mobileNumber || user?.mobile_number || '';
  const [filters, setFilters] = useState(initialFilters);
  const [quotes, setQuotes] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [savingBank, setSavingBank] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (!requestMobileNumber) {
      return;
    }

    setLoadingUser(true);

    getUser(requestMobileNumber)
      .then((response) => {
        const userDetails = response?.data?.[0];

        if (userDetails) {
          dispatch(setUser(userDetails));
        }
      })
      .catch((apiError) => {
        setSnackbar({
          open: true,
          message: apiError.message,
          severity: 'error'
        });
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, [dispatch, requestMobileNumber]);

  useEffect(() => {

    setFilters((currentFilters) => ({
      ...currentFilters,
      salary: user.salary ?? 0,
      loan_amount: user.loan_amount ?? 0,
      loan_tenure: user.loan_tenure ?? 0
    }));
  }, [user]);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!filters.loan_amount || !filters.loan_tenure) {
        setQuotes([]);
        return;
      }

      setLoadingQuotes(true);

      try {
        const response = await getQuotes({
          loan_amount: filters.loan_amount,
          loan_tenure: filters.loan_tenure
        });

        setQuotes(response?.data || []);
      } catch (apiError) {
        setQuotes([]);
        setSnackbar({
          open: true,
          message: apiError.message,
          severity: 'error'
        });
      } finally {
        setLoadingQuotes(false);
      }
    };

    fetchQuotes();
  }, [filters.loan_amount, filters.loan_tenure]);

  const setFilterValue = (field) => (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '');

    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: digitsOnly === '' ? 0 : Number(digitsOnly)
    }));
  };

  const getNumberValue = (field) => (filters[field] === 0 ? '' : filters[field]);

  const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

  const loanTenureText = filters.loan_tenure
    ? `${filters.loan_tenure} ${filters.loan_tenure === 1 ? 'year' : 'years'}`
    : '-';

  const handleQuoteSelect = async (quote) => {
    if (!requestMobileNumber) {
      setSnackbar({
        open: true,
        message: 'Mobile number is missing. Please complete OTP verification again.',
        severity: 'error'
      });
      return;
    }

    setSavingBank(quote.bank);

    try {
      await saveUser({
        mobile_number: requestMobileNumber,
        salary: filters.salary,
        loan_amount: filters.loan_amount,
        loan_tenure: filters.loan_tenure
      });

      setSelectedQuote(quote);
    } catch (apiError) {
      setSnackbar({
        open: true,
        message: apiError.message,
        severity: 'error'
      });
    } finally {
      setSavingBank('');
    }
  };

  const closeSnackbar = () => {
    setSnackbar((currentSnackbar) => ({
      ...currentSnackbar,
      open: false
    }));
  };

  return (
    <>
      <Head>
        <title>Quotes Page</title>
      </Head>

      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100vh',
          py: { xs: 2, md: 4 }
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Typography color="primary.main" fontWeight={800} variant="h4">
              Quotes Page
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  alignSelf: 'start',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2
                }}
              >
                <Stack spacing={2}>
                  <Typography fontWeight={800} variant="h6">
                    Filters
                  </Typography>

                  <TextField
                    fullWidth
                    inputProps={{ inputMode: 'numeric' }}
                    label="Monthly Salary"
                    onChange={setFilterValue('salary')}
                    placeholder="0"
                    type="number"
                    value={getNumberValue('salary')}
                  />

                  <TextField
                    fullWidth
                    inputProps={{ inputMode: 'numeric' }}
                    label="Loan Amount"
                    onChange={setFilterValue('loan_amount')}
                    placeholder="0"
                    type="number"
                    value={getNumberValue('loan_amount')}
                  />

                  <TextField
                    fullWidth
                    inputProps={{ inputMode: 'numeric' }}
                    label="Loan Tenure"
                    onChange={setFilterValue('loan_tenure')}
                    placeholder="0"
                    type="number"
                    value={getNumberValue('loan_tenure')}
                  />
                </Stack>
              </Paper>

              <Stack spacing={2}>
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    minHeight: 40
                  }}
                >
                  <Typography color="text.secondary" fontWeight={700}>
                    Showing {quotes.length} results
                  </Typography>

                  {(loadingUser || loadingQuotes) && (
                    <CircularProgress color="primary" size={22} />
                  )}
                </Box>

                {quotes.map((quote) => (
                  <Paper
                    elevation={0}
                    key={quote.bank}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: { xs: 2, md: 2.5 }
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Box
                        sx={{
                          alignItems: { xs: 'stretch', sm: 'center' },
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: 1.5,
                          justifyContent: 'space-between'
                        }}
                      >
                        <Typography fontWeight={800} variant="h6">
                          {quote.bank}
                        </Typography>

                        <Button
                          disabled={savingBank === quote.bank}
                          onClick={() => handleQuoteSelect(quote)}
                          sx={{ minWidth: 160 }}
                          variant="contained"
                        >
                          {savingBank === quote.bank ? (
                            <CircularProgress
                              color="inherit"
                              size={18}
                              sx={{ mr: 1 }}
                            />
                          ) : null}
                          {formatCurrency(quote.monthly_emi)}
                        </Button>
                      </Box>

                      <Typography color="text.secondary">
                        Interest Rate: {quote.interest_rate}% p.a.
                      </Typography>
                      <Typography color="text.secondary">
                        Loan Amount: {formatCurrency(filters.loan_amount)}
                      </Typography>
                      <Typography color="text.secondary">
                        Loan Tenure: {loanTenureText}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Backdrop
        open={Boolean(selectedQuote)}
        sx={{
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(32, 33, 36, 0.35)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 1,
            height: 220,
            maxWidth: 'calc(100vw - 32px)',
            width: 420
          }}
        />
      </Backdrop>

      <Snackbar
        autoHideDuration={5000}
        onClose={closeSnackbar}
        open={snackbar.open}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
