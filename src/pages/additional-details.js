import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Typography
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { getUser, saveDrivingLicense, verifyDOB } from '@/api/auth';
import { DOCUMENT_TYPES } from '@/constants/documentTypes';
import { setUser } from '@/redux/slices/authSlice';

function UploadField({ accept = 'image/*', capture, file, inputRef, label, onChange }) {
  return (
    <Box
      sx={{
        alignItems: { xs: 'stretch', sm: 'center' },
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        justifyContent: 'space-between',
        p: 2
      }}
    >
      <Typography color={file ? 'text.primary' : 'text.secondary'} noWrap>
        {file?.name || label}
      </Typography>

      <Button onClick={() => inputRef.current?.click()} variant="outlined">
        Choose Photo
      </Button>

      <input
        accept={accept}
        capture={capture}
        hidden
        onChange={onChange}
        ref={inputRef}
        type="file"
      />
    </Box>
  );
}

export default function AdditionalDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { mobileNumber, user } = useSelector((state) => state.auth);

  const requestMobileNumber = mobileNumber || user?.mobile_number || '';
  const identityInputRef = useRef(null);
  const drivingLicenseInputRef = useRef(null);

  const [documentType, setDocumentType] = useState('AADHAR_CARD');
  const [identityProofFile, setIdentityProofFile] = useState(null);
  const [drivingLicenseFile, setDrivingLicenseFile] = useState(null);
  const [identityProofAlert, setIdentityProofAlert] = useState(null);
  const [uploadingIdentityProof, setUploadingIdentityProof] = useState(false);
  const [savingDrivingLicense, setSavingDrivingLicense] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (!requestMobileNumber) {
      return;
    }

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
      });
  }, [dispatch, requestMobileNumber]);

  const handleIdentityProofUpload = async () => {
    setIdentityProofAlert(null);

    if (!requestMobileNumber) {
      setSnackbar({
        open: true,
        message: 'Mobile number is missing. Please complete OTP verification again.',
        severity: 'error'
      });
      return;
    }

    if (!identityProofFile) {
      setIdentityProofAlert({
        message: 'Identity proof photo is required.',
        severity: 'error'
      });
      return;
    }

    setUploadingIdentityProof(true);

    try {
      const response = await verifyDOB({
        mobileNumber: requestMobileNumber,
        documentType,
        documentFile: identityProofFile
      });

      const dobVerificationResult = response?.data?.[0];

      if (dobVerificationResult?.errCode === 'AGE01') {
        setIdentityProofAlert({
          message: 'Provided Age is incorrect',
          severity: 'error'
        });
        return;
      }

      if (dobVerificationResult?.status?.toLowerCase() === 'validated') {
        setIdentityProofAlert({
          message: 'Age is Validated',
          severity: 'success'
        });
      }
    } catch (apiError) {
      setSnackbar({
        open: true,
        message: apiError.message,
        severity: 'error'
      });
    } finally {
      setUploadingIdentityProof(false);
    }
  };

  const handleContinue = async () => {
    if (!requestMobileNumber) {
      setSnackbar({
        open: true,
        message: 'Mobile number is missing. Please complete OTP verification again.',
        severity: 'error'
      });
      return;
    }

    if (!drivingLicenseFile) {
      setSnackbar({
        open: true,
        message: 'Driving license photo is required.',
        severity: 'error'
      });
      return;
    }

    if (!identityProofAlert || identityProofAlert.severity !== "success") {
      setSnackbar({
        open: true,
        message: 'Age is not validated yet.',
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();

    formData.append('mobile_number', requestMobileNumber);
    formData.append('driving_license_file', drivingLicenseFile);

    setSavingDrivingLicense(true);

    try {
      const response = await saveDrivingLicense(formData);

      if (response?.status === 'ok') {
        router.push('/verify-details');
      }
    } catch (apiError) {
      setSnackbar({
        open: true,
        message: apiError.message,
        severity: 'error'
      });
    } finally {
      setSavingDrivingLicense(false);
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
        <title>Additional Details Page</title>
      </Head>

      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100vh',
          py: { xs: 2, md: 4 }
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Typography color="primary.main" fontWeight={800} variant="h4">
              Additional Details Page
            </Typography>

            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: { xs: 2, md: 3 }
              }}
            >
              <Stack spacing={3}>
                <Box component="section">
                  <Stack spacing={2}>
                    <Box>
                      <Typography fontWeight={800} variant="h6">
                        Identity Proof
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Upload any of the documents: Aadhar Card/ PAN Card/ Voter Id Card
                      </Typography>
                    </Box>

                    <FormControl fullWidth>
                      <InputLabel id="identity-proof-type-label">
                        Identity Proof Type
                      </InputLabel>
                      <Select
                        label="Identity Proof Type"
                        labelId="identity-proof-type-label"
                        onChange={(event) => {
                          setDocumentType(event.target.value);
                          setIdentityProofAlert(null);
                        }}
                        value={documentType}
                      >
                        {DOCUMENT_TYPES.map((documentOption) => (
                          <MenuItem
                            key={documentOption.value}
                            value={documentOption.value}
                          >
                            {documentOption.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <UploadField
                      file={identityProofFile}
                      inputRef={identityInputRef}
                      label="No identity proof photo selected"
                      onChange={(event) => {
                        setIdentityProofFile(event.target.files?.[0] || null);
                        setIdentityProofAlert(null);
                      }}
                    />

                    {identityProofAlert ? (
                      <Alert severity={identityProofAlert.severity}>
                        {identityProofAlert.message}
                      </Alert>
                    ) : null}

                    <Button
                      disabled={uploadingIdentityProof}
                      onClick={handleIdentityProofUpload}
                      sx={{ alignSelf: 'flex-end', minWidth: 140 }}
                      variant="contained"
                    >
                      {uploadingIdentityProof ? (
                        <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
                      ) : null}
                      Upload
                    </Button>
                  </Stack>
                </Box>

                <Box component="section">
                  <Stack spacing={2}>
                    <Typography fontWeight={800} variant="h6">
                      Upload Driving License
                    </Typography>

                    <UploadField
                      capture="environment"
                      file={drivingLicenseFile}
                      inputRef={drivingLicenseInputRef}
                      label="No driving license photo selected"
                      onChange={(event) =>
                        setDrivingLicenseFile(event.target.files?.[0] || null)
                      }
                    />
                  </Stack>
                </Box>

                <Button
                  disabled={savingDrivingLicense}
                  onClick={handleContinue}
                  sx={{ alignSelf: 'center', minWidth: 160 }}
                  variant="contained"
                >
                  {savingDrivingLicense ? (
                    <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
                  ) : null}
                  Continue
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
