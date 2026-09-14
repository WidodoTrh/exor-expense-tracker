import { Container, Typography, Box, Divider } from '@mui/material';

const APP_NAME = import.meta.env.VITE_APP_NAME; // ganti sesuai nama app kamu
const CONTACT_EMAIL = 'widodo.rahadi00@gmail.com'; // ganti email kontak kamu
const LAST_UPDATED = '14 September 2026';

export default function PrivacyPolicyPage() {
    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" gutterBottom>Privacy Policy</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Last updated: {LAST_UPDATED}
            </Typography>
            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>1. Introduction</Typography>
            <Typography variant="body1" paragraph>
                {APP_NAME} ("we", "our", "the app") is a personal finance tracking application.
                This Privacy Policy explains what data we access, how we use it, and how it is protected
                when you use {APP_NAME}.
            </Typography>

            <Typography variant="h6" gutterBottom>2. Data We Access</Typography>
            <Typography variant="body1" paragraph>
                When you sign in with Google, {APP_NAME} requests access to:
            </Typography>
            <Typography variant="body1" component="ul">
                <li>Your basic Google profile information (name, email address) — used to identify your account.</li>
                <li>Google Sheets (via the Sheets API) — used to store and retrieve your personal cashflow records in a spreadsheet created within your own Google account.</li>
                <li>Google Drive, limited to files created by this app (drive.file scope) — used only to create and access the specific spreadsheet {APP_NAME} generates for you. We cannot see or access any other files in your Drive.</li>
            </Typography>

            <Typography variant="h6" gutterBottom>3. How We Use Your Data</Typography>
            <Typography variant="body1" paragraph>
                Your financial data is stored exclusively in a Google Sheets spreadsheet within your own
                Google account. {APP_NAME} does not have a central database and does not store copies of
                your financial data on any server we control. We do not sell, rent, or share your data with
                any third party.
            </Typography>

            <Typography variant="h6" gutterBottom>4. Data Storage & Security</Typography>
            <Typography variant="body1" paragraph>
                Authentication tokens are used solely to read and write to your own Google Sheets/Drive on
                your behalf, and are handled through a secure server-side process. We do not store your
                Google password at any point.
            </Typography>

            <Typography variant="h6" gutterBottom>5. Your Control Over Data</Typography>
            <Typography variant="body1" paragraph>
                You can revoke {APP_NAME}'s access to your Google account at any time via your{' '}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
                    Google Account permissions page
                </a>. You may also delete the spreadsheet directly from your Google Drive at any time.
            </Typography>

            <Typography variant="h6" gutterBottom>6. Google API Services User Data Policy</Typography>
            <Typography variant="body1" paragraph>
                {APP_NAME}'s use and transfer of information received from Google APIs adheres to the{' '}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
                    Google API Services User Data Policy
                </a>, including the Limited Use requirements.
            </Typography>

            <Typography variant="h6" gutterBottom>7. Contact</Typography>
            <Typography variant="body1" paragraph>
                Questions about this policy can be sent to {CONTACT_EMAIL}.
            </Typography>
        </Container>
    );
}