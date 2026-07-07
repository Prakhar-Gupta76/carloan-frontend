import { Box, Stack, Typography } from '@mui/material';

export default function ConsentText() {
  return (
    <Stack spacing={2}>
      <Typography color="primary.main" fontWeight={800} variant="h6">
        Consent to Verify Financial Information
      </Typography>

      <Typography color="text.secondary" variant="body2">
        To assess your car loan eligibility and provide personalized loan offers,
        we require your consent to securely retrieve and verify certain financial
        information from authorized sources.
      </Typography>

      <Typography color="text.secondary" variant="body2">
        By selecting <strong>&quot;I Agree&quot;</strong>, you authorize us to:
      </Typography>

      <Box
        component="ul"
        sx={{
          color: 'text.secondary',
          m: 0,
          pl: 2.5
        }}
      >
        <Typography component="li" sx={{ mb: 1 }} variant="body2">
          <strong>Verify your monthly salary</strong> by accessing your bank
          account information through an RBI-regulated Account Aggregator, with
          your explicit consent.
        </Typography>
        <Typography component="li" sx={{ mb: 1 }} variant="body2">
          <strong>Verify your employment duration</strong> using your EPFO
          employment records.
        </Typography>
        <Typography component="li" sx={{ mb: 1 }} variant="body2">
          <strong>Retrieve your existing loan obligations (EMIs)</strong> from an
          authorized credit bureau.
        </Typography>
        <Typography component="li" variant="body2">
          <strong>Retrieve your credit score and credit report</strong> from an
          authorized credit bureau for loan eligibility assessment.
        </Typography>
      </Box>

      <Typography color="text.secondary" variant="body2">
        Your information will be accessed only for the purpose of processing your
        loan application and generating loan offers. We will request only the
        data necessary for this purpose and handle it in accordance with
        applicable laws and our Privacy Policy.
      </Typography>

      <Typography color="text.secondary" variant="body2">
        By proceeding, you confirm that:
      </Typography>

      <Box
        component="ul"
        sx={{
          color: 'text.secondary',
          m: 0,
          pl: 2.5
        }}
      >
        <Typography component="li" sx={{ mb: 1 }} variant="body2">
          You have read and understood this consent.
        </Typography>
        <Typography component="li" sx={{ mb: 1 }} variant="body2">
          You authorize us to obtain the above information from the respective
          authorized providers.
        </Typography>
        <Typography component="li" variant="body2">
          You understand that this consent is required to process your loan
          application and generate personalized loan offers.
        </Typography>
      </Box>
    </Stack>
  );
}
