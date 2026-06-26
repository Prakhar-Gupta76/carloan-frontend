import Head from 'next/head';
import { Box, Container } from '@mui/material';

import AuthCard from '@/components/AuthCard';
import LeadTable from '@/components/LeadTable';

export default function Home() {
  return (
    <>
      <Head>
        <title>Car Loan</title>
        <meta name="description" content="Car loan frontend" />
      </Head>

      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100vh',
          py: { xs: 2, md: 4 }
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              alignItems: 'start',
              display: 'grid',
              gap: { xs: 2, md: 3 },
              gridTemplateColumns: {
                xs: '1fr',
                md: '7fr 3fr'
              }
            }}
          >
            <LeadTable />
            <AuthCard />
          </Box>
        </Container>
      </Box>
    </>
  );
}
