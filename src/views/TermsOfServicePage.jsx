import { Container, Typography, Box, Divider } from '@mui/material';

const APP_NAME = import.meta.env.VITE_APP_NAME; // ganti sesuai nama app kamu
const CONTACT_EMAIL = 'widodo.rahadi00@gmail.com'; // ganti email kontak kamu
const LAST_UPDATED = '14 September 2026';

export default function TermsOfServicePage() {
    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" gutterBottom>Terms of Service</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Last updated: {LAST_UPDATED}
            </Typography>
            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>1. Acceptance of Terms</Typography>
            <Typography variant="body1" paragraph>
                By accessing or using {APP_NAME}, you agree to be bound by these Terms of Service. If you
                do not agree, please do not use the app.
            </Typography>

            <Typography variant="h6" gutterBottom>2. Description of Service</Typography>
            <Typography variant="body1" paragraph>
                {APP_NAME} is a personal cashflow tracking tool that uses your Google account to store
                transaction data in a Google Sheets spreadsheet under your own Google Drive.
            </Typography>

            <Typography variant="h6" gutterBottom>3. User Responsibilities</Typography>
            <Typography variant="body1" component="ul">
                <li>You are responsible for maintaining the confidentiality of your Google account credentials.</li>
                <li>You are responsible for the accuracy of the financial data you enter into the app.</li>
                <li>You agree not to use {APP_NAME} for any unlawful purpose.</li>
            </Typography>

            <Typography variant="h6" gutterBottom>4. No Warranty</Typography>
            <Typography variant="body1" paragraph>
                {APP_NAME} is provided "as is" without warranties of any kind. We do not guarantee the
                service will be uninterrupted, error-free, or free from data loss. You are encouraged to
                keep your own backups of your Google Sheets data.
            </Typography>

            <Typography variant="h6" gutterBottom>5. Limitation of Liability</Typography>
            <Typography variant="body1" paragraph>
                To the maximum extent permitted by law, {APP_NAME} and its developer shall not be liable
                for any indirect, incidental, or consequential damages arising from your use of the app,
                including but not limited to loss of data or financial miscalculations.
            </Typography>

            <Typography variant="h6" gutterBottom>6. Changes to the Service</Typography>
            <Typography variant="body1" paragraph>
                We may modify, suspend, or discontinue the app at any time without prior notice.
            </Typography>

            <Typography variant="h6" gutterBottom>7. Termination</Typography>
            <Typography variant="body1" paragraph>
                You may stop using {APP_NAME} at any time by revoking access via your Google Account
                permissions page and/or deleting your associated spreadsheet.
            </Typography>

            <Typography variant="h6" gutterBottom>8. Contact</Typography>
            <Typography variant="body1" paragraph>
                Questions about these Terms can be sent to {CONTACT_EMAIL}.
            </Typography>
        </Container>
    );
}