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

function getNestedValue(data, keys) {
  for (const key of keys) {
    const value = key.split('.').reduce((current, segment) => current?.[segment], data);
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function isOtpVerified(data) {
  const status = getNestedValue(data, ['status', 'data.status', 'result.status']);
  return String(status).toLowerCase() === 'verified';
}

function isNewUserResponse(data) {
  const explicitFlag = getNestedValue(data, [
    'is_new_user',
    'isNewUser',
    'new_user',
    'data.is_new_user',
    'data.isNewUser',
    'data.new_user'
  ]);

  if (typeof explicitFlag === 'boolean') {
    return explicitFlag;
  }

  const userExists = getNestedValue(data, [
    'user_exists',
    'userExists',
    'data.user_exists',
    'data.userExists'
  ]);

  if (typeof userExists === 'boolean') {
    return !userExists;
  }

  const status = String(
    getNestedValue(data, ['status', 'data.status', 'result.status']) || ''
  ).toLowerCase();

  if (['new', 'new_user', 'not_found'].includes(status)) {
    return true;
  }

  if (getNestedValue(data, ['user', 'data.user', 'result.user'])) {
    return false;
  }

  return false;
}

function isOkResponse(data) {
  const status = getNestedValue(data, ['status', 'data.status', 'result.status']);

  if (!status) {
    return true;
  }

  return ['ok', 'success', 'saved'].includes(String(status).toLowerCase());
}

function normalizeUser(data, fallbackMobile, fallbackName = '') {
  const user = getNestedValue(data, ['user', 'data.user', 'result.user']) || data || {};

  return {
    ...user,
    mobile_number: user.mobile_number || user.mobileNumber || fallbackMobile,
    name: user.name || fallbackName
  };
}

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

      if (!isOtpVerified(verification)) {
        setError('OTP could not be verified.');
        return;
      }

      const userResponse = await getUser(mobileNumber);

      if (isNewUserResponse(userResponse)) {
        setStep('name');
        return;
      }

      dispatch(setUser(normalizeUser(userResponse, mobileNumber)));
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

      if (!isOkResponse(response)) {
        setError('User could not be saved.');
        return;
      }

      dispatch(setUser(normalizeUser(response, mobileNumber, nameInput.trim())));
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
