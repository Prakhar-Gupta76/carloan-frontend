import Head from 'next/head';
import Link from 'next/link';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

export default function Dashboard() {
  const { mobileNumber, user } = useSelector((state) => state.auth);
  const displayName = user?.name || 'User';
  const displayMobile = user?.mobile_number || user?.mobileNumber || mobileNumber;

  return (
    <>
      <Head>
        <title>Car Loan | Dashboard</title>
      </Head>

      <Box
        component="main"
        sx={{
          alignItems: 'center',
          backgroundColor: 'background.default',
          display: 'flex',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: { xs: 3, md: 4 }
            }}
          >
            <Stack spacing={2}>
              <Typography color="primary.main" fontWeight={800} variant="h4">
                Welcome, {displayName}
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Your account flow is complete.
              </Typography>
              {displayMobile ? (
                <Typography color="text.primary" variant="body2">
                  Mobile number: {displayMobile}
                </Typography>
              ) : null}
              <Button
                LinkComponent={Link}
                href="/"
                sx={{ alignSelf: 'flex-start', mt: 1 }}
                variant="outlined"
              >
                Back to home
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
