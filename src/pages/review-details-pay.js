import { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { getUser, pay } from '@/api/auth';
import { setUser } from '@/redux/slices/authSlice';
import { formatCurrency } from '@/utils/formatters';

const formatTenure = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return '-';
  }

  return `${numericValue} ${numericValue === 1 ? 'year' : 'years'}`;
};

const formatInterestRate = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return '-';
  }

  return `${numericValue}% p.a.`;
};

function DetailRow({ label, value }) {
  const displayValue = value === null || value === undefined || value === ''
    ? '-'
    : value;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.5,
        gridTemplateColumns: { xs: '1fr', sm: '220px 1fr' },
        py: 1
      }}
    >
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography fontWeight={700}>{displayValue}</Typography>
    </Box>
  );
}

function DetailSection({ items, title }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: { xs: 2, md: 3 }
      }}
    >
      <Stack spacing={1}>
        <Typography fontWeight={800} variant="h6">
          {title}
        </Typography>

        <Box>
          {items.map((item, index) => (
            <Box key={item.label}>
              <DetailRow label={item.label} value={item.value} />
              {index < items.length - 1 ? <Divider /> : null}
            </Box>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function ReviewDetailsPayPage() {
  const dispatch = useDispatch();
  const { mobileNumber, user } = useSelector((state) => state.auth);
  const requestMobileNumber = mobileNumber || user?.mobile_number || '';
  const [loadingUser, setLoadingUser] = useState(false);
  const [paying, setPaying] = useState(false);
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
          return;
        }

        setSnackbar({
          open: true,
          message: 'User details not found.',
          severity: 'error'
        });
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

  const applicantDetails = [
    {
      label: 'Name',
      value: user?.name
    },
    {
      label: 'Mobile Number',
      value: user?.mobile_number
    },
    {
      label: 'PAN',
      value: user?.pan
    },
    {
      label: 'Permanent Address',
      value: user?.permanent_address
    }
  ];
  const loanDetails = [
    {
      label: 'Loan Amount',
      value: formatCurrency(user?.loan_amount)
    },
    {
      label: 'Loan Tenure',
      value: formatTenure(user?.loan_tenure)
    },
    {
      label: 'Monthly EMI',
      value: formatCurrency(user?.loan_monthly_emi)
    },
    {
      label: 'Loan Bank',
      value: user?.loan_bank
    },
    {
      label: 'Interest Rate',
      value: formatInterestRate(user?.loan_interest_rate)
    }
  ];

  const closeSnackbar = () => {
    setSnackbar((currentSnackbar) => ({
      ...currentSnackbar,
      open: false
    }));
  };

  const handlePay = async () => {
    if (!requestMobileNumber) {
      setSnackbar({
        open: true,
        message: 'Mobile number is missing. Please complete OTP verification again.',
        severity: 'error'
      });
      return;
    }

    setPaying(true);

    try {
      const response = await pay({
        mobile_number: requestMobileNumber
      });
      const sessionUrl = response?.data?.[0]?.sessionUrl;

      if (!sessionUrl) {
        throw new Error('Payment session could not be created.');
      }

      window.location.href = sessionUrl;
    } catch (apiError) {
      setSnackbar({
        open: true,
        message: apiError.message,
        severity: 'error'
      });
      setPaying(false);
    }
  };

  return (
    <>
      <Head>
        <title>Review Details & Pay</title>
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
            <Box>
              <Typography color="primary.main" fontWeight={800} variant="h4">
                Review Details & Pay
              </Typography>
              <Typography color="text.secondary">
                Review the applicant and loan details before payment.
              </Typography>
            </Box>

            {!requestMobileNumber ? (
              <Alert severity="error">
                Mobile number is missing. Please complete OTP verification again.
              </Alert>
            ) : null}

            {loadingUser ? (
              <Paper
                elevation={0}
                sx={{
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  gap: 1,
                  p: { xs: 2, md: 3 }
                }}
              >
                <CircularProgress size={20} />
                <Typography color="text.secondary">
                  Loading review details...
                </Typography>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
                }}
              >
                <DetailSection items={applicantDetails} title="Applicant Details" />
                <DetailSection items={loanDetails} title="Loan Details" />
              </Box>
            )}

            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: { xs: 2, md: 3 }
              }}
            >
              <Stack
                alignItems={{ xs: 'stretch', sm: 'center' }}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="flex-start"
                spacing={2}
              >
                <Typography
                  fontWeight={800}
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    minHeight: 40
                  }}
                >
                  You need to pay first month emi to activate the loan.
                </Typography>

                <Button
                  disabled={paying || !user?.loan_monthly_emi}
                  onClick={handlePay}
                  sx={{ minWidth: 200 }}
                  variant="contained"
                >
                  {paying ? (
                    <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
                  ) : null}
                  Pay {formatCurrency(user?.loan_monthly_emi)}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

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
