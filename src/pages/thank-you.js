import Head from 'next/head';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';

export default function ThankYouPage() {
  return (
    <>
      <Head>
        <title>Thank You</title>
      </Head>

      <Box
        component="main"
        sx={{
          alignItems: 'center',
          backgroundColor: 'background.default',
          display: 'flex',
          minHeight: '100vh',
          py: { xs: 2, md: 4 }
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: { xs: 3, md: 4 },
              textAlign: 'center'
            }}
          >
            <Stack spacing={2}>
              <Typography color="primary.main" fontWeight={800} variant="h4">
                Thank you for placing order.
              </Typography>
              <Typography color="text.secondary" variant="h6">
                Your loan amount will be credited in your bank account shortly.
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
