import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack, CircularProgress, Divider, Tab, Tabs, TextField } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import authProfiles from '../store/auth';
import { useSnackbar } from 'notistack'

export default function LoginPage() {
    const APP_VERSION = import.meta.env.VITE_APP_VERSION
    const COMPANY_NAME = import.meta.env.VITE_APP_NAME
    const year = new Date().getFullYear()

    const navigate = useNavigate();
    const act_LOGIN_WITH_GOOGLE = authProfiles((s) => s.act_LOGIN_WITH_GOOGLE);
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [emailMode, setEmailMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { enqueueSnackbar } = useSnackbar()

    // const googleLogin = useGoogleLogin({
    //     flow: 'auth-code',
    //     scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
    //     onSuccess: async (codeResponse) => {
    //         setIsLoggingIn(true)
    //         try {
    //             await act_LOGIN_WITH_GOOGLE(codeResponse.code);
    //             navigate('/');
    //         } catch (err) {
    //             console.error('Login failed:', err);
    //             setIsLoggingIn(false)
    //         }
    //     },
    //     onError: (err) => {
    //         console.error('Login failed:', err),
    //         setIsLoggingIn(false)
    //     } 
    // });

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        setIsSubmittingEmail(true)

        const { data, error } =
            emailMode === 'login'
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password })

        setIsSubmittingEmail(false)

        if (error) {
            enqueueSnackbar(error.message, { variant: 'error' })
            return
        }

        if (emailMode === 'signup' && !data.session) {
            enqueueSnackbar('Cek email lo buat verifikasi akun dulu', { variant: 'info' })
            return
        }

        navigate('/home', { replace: true })
    }

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        })
        if (error) {
            console.error('Login failed:', error)
            setIsLoggingIn(false)
        }
    }

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
                        onClick={() => handleGoogleLogin()}
                        sx={{ mt: 2, textTransform: 'none' }}
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                    </Button>

                    <Divider sx={{ my: 1 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            or
                        </Typography>
                    </Divider>

                    <Box component="form" onSubmit={handleEmailSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField
                            label="Email"
                            type="email"
                            size="small"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.15)' },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                                input: { color: 'white' },
                            }}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            size="small"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                            slotProps={{ minLength: 6 }}
                            sx={{
                                '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.15)' },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                                input: { color: 'white' },
                            }}
                        />
                        <Button
                            type="submit"
                            variant="outlined"
                            disabled={isSubmittingEmail}
                            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', textTransform: 'none' }}
                            fullWidth
                        >
                            {isSubmittingEmail ? <CircularProgress size={16} color="inherit" /> : (emailMode === 'login' ? 'Sign in with Email' : 'Create Account')}
                        </Button>
                        <Typography
                            variant="caption"
                            onClick={() => setEmailMode(emailMode === 'login' ? 'signup' : 'login')}
                            sx={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {emailMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </Typography>
                    </Box>

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
                    </Typography>
                    <Divider sx={{ marginY: 2 }} />
                    <Typography variant="caption" color="text.secondary">© {year} {COMPANY_NAME}. All rights reserved.</Typography>
                    <Typography variant="caption" color="text.secondary">
                        v{APP_VERSION}
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
}