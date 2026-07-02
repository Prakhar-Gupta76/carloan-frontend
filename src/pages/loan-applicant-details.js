import { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Alert,
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

import { getUser, saveUser } from '@/api/auth';
import { setUser } from '@/redux/slices/authSlice';
import { validateLoanApplicant } from '@/validations/loanApplicantSchemas';

const initialFormValues = {
  pan: '',
  age: 0,
  permanent_address: '',
  salary: 0,
  current_company_duration: 0,
  loan_amount: 0,
  loan_tenure: 0
};

export default function LoanApplicantDetailsPage() {
  const dispatch = useDispatch();
  const { mobileNumber, user } = useSelector((state) => state.auth);

  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    getUser(mobileNumber)
      .then((response) => {
        const userDetails = response?.data?.[0];

        if (userDetails) {
          dispatch(setUser(userDetails));
        }
      })
      .catch(() => { });
  }, [dispatch, mobileNumber]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      pan: user.pan || '',
      age: user.age ?? 0,
      permanent_address: user.permanent_address || '',
      salary: user.salary ?? 0,
      current_company_duration: user.current_company_duration ?? 0,
      loan_amount: user.loan_amount ?? 0,
      loan_tenure: user.loan_tenure ?? 0
    }));
  }, [user]);

  const setFieldValue = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value
    }));
  };

  const handlePanChange = (event) => {
    const value = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10);

    setFieldValue('pan', value);
  };

  const handleDigitsChange = (field) => (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '');
    setFieldValue(field, digitsOnly === '' ? 0 : Number(digitsOnly));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    const validation = validateLoanApplicant(formValues);
    setErrors(validation.errors);

    if (!validation.data) {
      return;
    }

    if (!mobileNumber) {
      setSnackbar({
        open: true,
        message: 'Mobile number is missing. Please complete OTP verification again.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      await saveUser({
        mobile_number: mobileNumber,
        pan: validation.data.pan,
        permanent_address: validation.data.permanent_address,
        salary: validation.data.salary,
        age: validation.data.age,
        current_company_duration: validation.data.current_company_duration,
        loan_amount: validation.data.loan_amount,
        loan_tenure: validation.data.loan_tenure
      });
      setSnackbar({
        open: true,
        message: 'Applicant details saved.',
        severity: 'success'
      });
    } catch (apiError) {
      setSnackbar({
        open: true,
        message: apiError.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const closeSnackbar = () => {
    setSnackbar((currentSnackbar) => ({
      ...currentSnackbar,
      open: false
    }));
  };

  const getHelperText = (field) => (submitted ? errors[field] || ' ' : ' ');
  const hasError = (field) => submitted && Boolean(errors[field]);
  const getNumberValue = (field) => (formValues[field] === 0 ? '' : formValues[field]);

  return (
    <>
      <Head>
        <title>Loan Applicant Details Page</title>
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
                Loan Applicant Details Page
              </Typography>
            </Box>

            <Paper
              component="form"
              elevation={0}
              onSubmit={handleSubmit}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: { xs: 2, md: 3 }
              }}
            >
              <Stack spacing={4}>
                <Box component="section">
                  <Typography fontWeight={800} gutterBottom variant="h6">
                    Personal Information
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
                    }}
                  >
                    <TextField
                      error={hasError('pan')}
                      fullWidth
                      helperText={getHelperText('pan')}
                      inputProps={{ maxLength: 10 }}
                      label="PAN No."
                      onChange={handlePanChange}
                      placeholder="Eg: ABCDE1234F"
                      required
                      value={formValues.pan}
                    />
                    <TextField
                      error={hasError('age')}
                      fullWidth
                      helperText={getHelperText('age')}
                      inputProps={{ inputMode: 'numeric' }}
                      label="Age of Applicant"
                      onChange={handleDigitsChange('age')}
                      placeholder="0"
                      required
                      type="number"
                      value={getNumberValue('age')}
                    />
                    <TextField
                      error={hasError('permanent_address')}
                      fullWidth
                      helperText={getHelperText('permanent_address')}
                      label="Permanent Address"
                      multiline
                      onChange={(event) =>
                        setFieldValue('permanent_address', event.target.value)
                      }
                      required
                      sx={{ gridColumn: { md: '1 / -1' } }}
                      value={formValues.permanent_address}
                    />
                  </Box>
                </Box>

                <Box component="section">
                  <Typography fontWeight={800} gutterBottom variant="h6">
                    Employment & Income
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
                    }}
                  >
                    <TextField
                      error={hasError('salary')}
                      fullWidth
                      helperText={getHelperText('salary')}
                      inputProps={{ inputMode: 'numeric' }}
                      label="Enter Monthly Salary"
                      onChange={handleDigitsChange('salary')}
                      placeholder="0"
                      required
                      type="number"
                      value={getNumberValue('salary')}
                    />
                    <TextField
                      error={hasError('current_company_duration')}
                      fullWidth
                      helperText={getHelperText('current_company_duration')}
                      inputProps={{ inputMode: 'numeric' }}
                      label="Enter Duration with Current Company (months)"
                      onChange={handleDigitsChange('current_company_duration')}
                      placeholder="0"
                      required
                      type="number"
                      value={getNumberValue('current_company_duration')}
                    />
                  </Box>
                </Box>

                <Box component="section">
                  <Typography fontWeight={800} gutterBottom variant="h6">
                    Loan Requirements
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
                    }}
                  >
                    <TextField
                      error={hasError('loan_amount')}
                      fullWidth
                      helperText={getHelperText('loan_amount')}
                      inputProps={{ inputMode: 'numeric' }}
                      label="Enter Loan Amount"
                      onChange={handleDigitsChange('loan_amount')}
                      placeholder="0"
                      required
                      type="number"
                      value={getNumberValue('loan_amount')}
                    />
                    <TextField
                      error={hasError('loan_tenure')}
                      fullWidth
                      helperText={getHelperText('loan_tenure')}
                      inputProps={{ inputMode: 'numeric' }}
                      label="Enter Loan Tenure (years)"
                      onChange={handleDigitsChange('loan_tenure')}
                      placeholder="0"
                      required
                      type="number"
                      value={getNumberValue('loan_tenure')}
                    />
                  </Box>
                </Box>

                <Button
                  disabled={loading}
                  sx={{ alignSelf: 'center', minWidth: 160 }}
                  type="submit"
                  variant="contained"
                >
                  {loading ? (
                    <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
                  ) : null}
                  Submit
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
