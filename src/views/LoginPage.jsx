import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack, CircularProgress, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import authProfiles from '../store/auth';

export default function LoginPage() {
    const APP_VERSION = import.meta.env.VITE_APP_VERSION
    const COMPANY_NAME = import.meta.env.VITE_APP_NAME
    const year = new Date().getFullYear()

    const navigate = useNavigate();
    const act_LOGIN_WITH_GOOGLE = authProfiles((s) => s.act_LOGIN_WITH_GOOGLE);
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const googleLogin = useGoogleLogin({
        flow: 'auth-code',
        scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        onSuccess: async (codeResponse) => {
            setIsLoggingIn(true)
            try {
                await act_LOGIN_WITH_GOOGLE(codeResponse.code);
                navigate('/');
            } catch (err) {
                console.error('Login failed:', err);
                setIsLoggingIn(false)
            }
        },
        onError: (err) => {
            console.error('Login failed:', err),
            setIsLoggingIn(false)
        } 
    });

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#667eea',
                backgroundSize: '400% 400%',
                px: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, sm: 5 },
                    borderRadius: 3,
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: 400,
                    mx: 'auto',
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
            >
                <Stack spacing={2}>
                    <Typography variant="h3" fontWeight={600} color="white">
                        Exordium
                    </Typography>
                    <Typography variant="h6">
                        Expense Tracker App
                    </Typography>
                    <Typography variant="body2">
                        Sign in with your Google account to start tracking your cashflow
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={isLoggingIn ? <CircularProgress size={16} color="inherit" /> : <GoogleIcon />}
                        onClick={() => googleLogin()}
                        sx={{ mt: 2, textTransform: 'none' }}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                    </Button>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mt: 2 }}>
                        By signing in, you agree to our{' '}
                        <Box
                            component="a"
                            href="/terms-of-service"
                            target="_blank"
                            rel="noreferrer"
                            sx={{ color: 'white', textDecoration: 'underline' }}
                        >
                            Terms of Service
                        </Box>{' '}
                        and{' '}
                        <Box
                            component="a"
                            href="/privacy-policy"
                            target="_blank"
                            rel="noreferrer"
                            sx={{ color: 'white', textDecoration: 'underline' }}
                        >
                            Privacy Policy
                        </Box>.
                    <Divider sx={{marginY: 2}} />
                    <Typography variant="caption" color="text.secondary">© {year} {COMPANY_NAME}. All rights reserved.</Typography>
                    <Typography variant="caption" color="text.secondary">
                        v{APP_VERSION}
                    </Typography>
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
}