import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { generateOTP, getUser, saveUser, verifyOTP } from '@/api/auth';
import { setMobileNumber, setUser } from '@/redux/slices/authSlice';
import {
  mobileNumberSchema,
  nameSchema,
  otpSchema
} from '@/validations/authSchemas';

const CARD_TITLES = {
  mobile: 'Enter mobile number',
  otp: 'Enter OTP',
  name: 'Enter name'
};

export default function AuthCard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const savedMobileNumber = useSelector((state) => state.auth.mobileNumber);

  const [step, setStep] = useState('mobile');
  const [mobileNumberInput, setMobileNumberInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mobileNumber = savedMobileNumber || mobileNumberInput;

  const isMobileValid = mobileNumberSchema.safeParse(mobileNumberInput).success
  const isOtpValid = otpSchema.safeParse(otpInput).success
  const isNameValid = nameSchema.safeParse(nameInput).success

  const clearError = () => setError('');

  const handleGenerateOtp = async () => {
    if (!isMobileValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await generateOTP(mobileNumberInput);
      dispatch(setMobileNumber(mobileNumberInput));
      setStep('otp');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const verification = await verifyOTP(mobileNumber, otpInput);

      if (verification?.data[0].status !== "valid") {
        setError('OTP could not be verified.');
        return;
      }

      const userResponse = await getUser(mobileNumber);

      if (userResponse.data.length === 0) {
        setStep('name');
        return;
      }

      dispatch(setUser(userResponse.data[0]));
      router.push('/dashboard');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!isNameValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await saveUser(mobileNumber, nameInput.trim());

      if (response.status !== "ok") {
        setError('User could not be saved.');
        return;
      }

      router.push('/dashboard');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const renderButtonContent = (label) => (
    <>
      {loading ? (
        <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
      ) : null}
      {label}
    </>
  );

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: '0 18px 45px rgba(32, 33, 36, 0.08)'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography
            component="label"
            htmlFor={`${step}-input`}
            sx={{
              color: 'text.primary',
              display: 'block',
              fontWeight: 700,
              mb: 1.5
            }}
            variant="subtitle1"
          >
            {CARD_TITLES[step]}
          </Typography>

          {step === 'mobile' ? (
            <Box>
              <TextField
                autoComplete="tel"
                error={mobileNumberInput.length > 0 && !isMobileValid}
                fullWidth
                helperText={
                  mobileNumberInput.length > 0 && !isMobileValid
                    ? 'Mobile number must be exactly 10 digits.'
                    : ' '
                }
                id="mobile-input"
                inputProps={{
                  inputMode: 'numeric',
                  maxLength: 10,
                  pattern: '[0-9]*'
                }}
                onChange={(event) => setMobileNumberInput(event.target.value)}
                placeholder="10 digit mobile number"
                value={mobileNumberInput}
              />
              <Button
                disabled={!isMobileValid || loading}
                fullWidth
                onClick={handleGenerateOtp}
                sx={{ mt: 1 }}
                variant="contained"
              >
                {renderButtonContent('Generate OTP')}
              </Button>
            </Box>
          ) : null}

          {step === 'otp' ? (
            <Box>
              <TextField
                autoComplete="one-time-code"
                error={otpInput.length > 0 && !isOtpValid}
                fullWidth
                helperText={
                  otpInput.length > 0 && !isOtpValid
                    ? 'OTP must be exactly 4 digits.'
                    : ' '
                }
                id="otp-input"
                inputProps={{
                  inputMode: 'numeric',
                  maxLength: 4,
                  pattern: '[0-9]*'
                }}
                onChange={(event) => setOtpInput(event.target.value)}
                placeholder="4 digit OTP"
                value={otpInput}
              />
              <Button
                disabled={!isOtpValid || loading}
                fullWidth
                onClick={handleVerifyOtp}
                sx={{ mt: 1 }}
                variant="contained"
              >
                {renderButtonContent('Verify OTP')}
              </Button>
            </Box>
          ) : null}

          {step === 'name' ? (
            <Box>
              <TextField
                autoComplete="name"
                error={nameInput.length > 0 && !isNameValid}
                fullWidth
                helperText={
                  nameInput.length > 0 && !isNameValid
                    ? 'Name must include at least one alphabet letter.'
                    : ' '
                }
                id="name-input"
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="Full name"
                value={nameInput}
              />
              <Button
                disabled={!isNameValid || loading}
                fullWidth
                onClick={handleSaveUser}
                sx={{ mt: 1 }}
                variant="contained"
              >
                {renderButtonContent('Continue')}
              </Button>
            </Box>
          ) : null}
        </CardContent>
      </Card>

      <Snackbar
        autoHideDuration={5000}
        onClose={clearError}
        open={Boolean(error)}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
