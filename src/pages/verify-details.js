import Head from 'next/head';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';

export default function VerifyDetailsPage() {
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
        <Container maxWidth="md">
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
              <Typography color="primary.main" fontWeight={800} variant="h4">
                Verify Details Page
              </Typography>
              <Typography color="text.secondary">
                Verification details will be shown here.
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
