import { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { getUser } from '@/api/auth';
import { setUser } from '@/redux/slices/authSlice';
import { formatCurrency } from '@/utils/formatters';
import { getVerifyDetailsChecks } from '@/utils/verifyDetailsChecks';

const formatUnit = (value, unit) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return '-';
  }

  return `${numericValue} ${unit}`;
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

export default function VerifyDetailsPage() {
  const dispatch = useDispatch();
  const { mobileNumber, user } = useSelector((state) => state.auth);
  const requestMobileNumber = mobileNumber || user?.mobile_number || '';
  const [loadingUser, setLoadingUser] = useState(false);
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

  const verificationResult = getVerifyDetailsChecks(user);
  const failedChecks = verificationResult.failedChecks ?? [];

  useEffect(() => {
    if (loadingUser || !user || failedChecks.length === 0) {
      return;
    }

    setSnackbar({
      open: true,
      message: failedChecks[0].message,
      severity: 'error'
    });
  }, [failedChecks, loadingUser, user]);

  const detailItems = [
    {
      label: 'Mobile Number',
      value: user?.mobile_number
    },
    {
      label: 'PAN',
      value: user?.pan
    },
    {
      label: 'Age',
      value: verificationResult.summary?.age
    },
    {
      label: 'Current Company Duration',
      value: formatUnit(
        verificationResult.summary?.currentCompanyDuration,
        'months',
      )
    },
    {
      label: 'Monthly Salary',
      value: formatCurrency(verificationResult.summary?.salary)
    },
    {
      label: 'Credit Score',
      value: verificationResult.summary?.creditScore
    },
    {
      label: 'Existing EMIs',
      value: formatCurrency(verificationResult.summary?.existingEmis)
    },
    {
      label: 'Loan Amount',
      value: formatCurrency(verificationResult.summary?.loanAmount)
    },
    {
      label: 'Loan Tenure',
      value: formatUnit(verificationResult.summary?.loanTenure, 'years')
    },
    {
      label: 'Loan Monthly EMI',
      value: formatCurrency(verificationResult.summary?.loanMonthlyEmi)
    }
  ];

  const closeSnackbar = () => {
    setSnackbar((currentSnackbar) => ({
      ...currentSnackbar,
      open: false
    }));
  };

  return (
    <>
      <Head>
        <title>Verify Details Page</title>
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
                Verify Details Page
              </Typography>
              <Typography color="text.secondary">
                Review the applicant details and eligibility checks.
              </Typography>
            </Box>

            {!requestMobileNumber ? (
              <Alert severity="error">
                Mobile number is missing. Please complete OTP verification again.
              </Alert>
            ) : null}

            <Box
              sx={{
                alignItems: 'flex-start',
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' }
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: { xs: 2, md: 3 },
                  width: '100%'
                }}
              >
                <Stack spacing={1}>
                  <Typography fontWeight={800} variant="h6">
                    User Details
                  </Typography>

                  {loadingUser ? (
                    <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography color="text.secondary">
                        Loading user details...
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {detailItems.map((detailItem, index) => (
                        <Box key={detailItem.label}>
                          <DetailRow
                            label={detailItem.label}
                            value={detailItem.value}
                          />
                          {index < detailItems.length - 1 ? <Divider /> : null}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: { xs: 2, md: 3 },
                  width: '100%'
                }}
              >
                <Stack spacing={2}>
                  <Box>
                    <Typography fontWeight={800} variant="h6">
                      Verification Checks
                    </Typography>
                  </Box>

                  {verificationResult.checks.map((check) => (
                    <Box
                      key={check.key}
                      sx={{
                        border: '1px solid',
                        borderColor: check.passed ? 'success.light' : 'error.light',
                        borderRadius: 1,
                        p: 2
                      }}
                    >
                      <Stack
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box>
                          <Typography fontWeight={800}>{check.label}</Typography>
                          <Typography color="text.secondary" variant="body2">
                            {check.message}
                          </Typography>
                        </Box>
                        <Chip
                          color={check.passed ? 'success' : 'error'}
                          label={check.passed ? 'Passed' : 'Failed'}
                          size="small"
                        />
                      </Stack>
                    </Box>
                  ))}

                  {failedChecks.length > 0 ? (
                    <Alert severity="error">
                      You cannot continue as some check(s) fail. Apply again with
                      correct data and eligible choice.
                    </Alert>
                  ) : null}

                  <Button
                    disabled={
                      loadingUser ||
                      !requestMobileNumber ||
                      !verificationResult.allChecksPassed
                    }
                    sx={{ alignSelf: 'center', minWidth: 240 }}
                    variant="contained"
                  >
                    Continue to Review & Pay
                  </Button>
                </Stack>
              </Paper>
            </Box>
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
