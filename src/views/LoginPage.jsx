import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import authProfiles from '../store/auth';

export default function LoginPage() {
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
                // background: 'linear-gradient(-45deg, #667eea, #764ba2, #11998e, #38ef7d)',
                background: '#667eea',
                backgroundSize: '400% 400%',
                // animation: 'gradientShift 15s ease infinite',
                // '@keyframes gradientShift': {
                //     '0%': { backgroundPosition: '0% 50%' },
                //     '50%': { backgroundPosition: '100% 50%' },
                //     '100%': { backgroundPosition: '0% 50%' },
                // },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    borderRadius: 3,
                    textAlign: 'center',
                    maxWidth: 400,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
            >
                <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={600} color="white">
                        Cashflow Tracker
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                        Login dengan akun Google buat mulai catat cashflow lo
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={isLoggingIn ? <CircularProgress size={16} color="inherit" /> : <GoogleIcon />}
                        onClick={() => googleLogin()}
                        sx={{ mt: 2, textTransform: 'none' }}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? 'Signing in...' : 'Login with Google'}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}