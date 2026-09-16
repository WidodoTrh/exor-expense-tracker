import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack, CircularProgress, Divider, Tab, Tabs, TextField, InputAdornment, IconButton } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useSnackbar } from 'notistack'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

export default function LoginPage() {
    const APP_VERSION = import.meta.env.VITE_APP_VERSION
    const COMPANY_NAME = import.meta.env.VITE_APP_NAME
    const year = new Date().getFullYear()

    const navigate = useNavigate();
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [emailMode, setEmailMode] = useState('login')
    const [email, setEmail] = useState('')
    const [DisplayName, setDisplayName] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        setIsSubmittingEmail(true)

        const { data, error } =
            emailMode === 'login'
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({
                     email,
                     password,
                     options: { data: { full_name: DisplayName } }
                })

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

    const handleTabChange = (event, newVal) => setEmailMode(newVal)

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                px: 1,
                marginY:3
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: 400,
                    mx: 'auto',
                }}
            >
                <Tabs value={emailMode} onChange={handleTabChange} sx={{ marginY: 2 }} variant='fullWidth'>
                    <Tab label="Sign In" value="login" />
                    <Tab label="Sign Up" value="signup" />
                </Tabs>

                {emailMode === 'login' &&
                    <Stack spacing={2}>
                        <Typography variant="h3" fontWeight={600} color="text.primary">
                            Exordium
                        </Typography>
                        <Typography variant="h6" color="text.primary">
                            Expense Tracker App
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
                            <Typography variant="caption" color="text.secondary">
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
                            />
                            <TextField
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                size="small"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                fullWidth
                                slotProps={{
                                    htmlInput: { minLength: 6 },
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <Button
                                type="submit"
                                variant="outlined"
                                disabled={isSubmittingEmail}
                                sx={{ textTransform: 'none' }}
                                fullWidth
                            >
                                {isSubmittingEmail ? <CircularProgress size={16} color="inherit" /> : (emailMode === 'login' ? 'Sign in with Email' : 'Create Account')}
                            </Button>
                            <Typography
                                variant="caption"
                                onClick={() => setEmailMode(emailMode === 'login' ? 'signup' : 'login')}
                                sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                {emailMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                            </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                            By signing in, you agree to our{' '}
                            <Box component="a" href="/terms-of-service" target="_blank" rel="noreferrer" sx={{ color: 'primary.main' }}>
                                Terms of Service
                            </Box>{' '}
                            and{' '}
                            <Box component="a" href="/privacy-policy" target="_blank" rel="noreferrer" sx={{ color: 'primary.main' }}>
                                Privacy Policy
                            </Box>.
                        </Typography>
                        <Divider sx={{ marginY: 2 }} />
                        <Typography variant="caption" color="text.secondary">© {year} {COMPANY_NAME}. All rights reserved.</Typography>
                        <Typography variant="caption" color="text.secondary">
                            v{APP_VERSION}
                        </Typography>
                    </Stack>
                }
                {emailMode === 'signup' &&
                    <Stack spacing={2}>
                        <Typography variant="h3" fontWeight={600} color="text.primary">
                            Exordium
                        </Typography>
                        <Typography variant="h6" color="text.primary">
                            Expense Tracker App
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Box component="form" onSubmit={handleEmailSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <TextField
                                label="Full Name"
                                value={DisplayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Email"
                                type="email"
                                size="small"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                fullWidth
                            />
                            <TextField
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                size="small"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                fullWidth
                                slotProps={{
                                    htmlInput: { minLength: 6 },
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <Button
                                type="submit"
                                variant="outlined"
                                disabled={isSubmittingEmail}
                                sx={{ textTransform: 'none' }}
                                fullWidth
                            >
                                {isSubmittingEmail ? <CircularProgress size={16} color="inherit" /> : (emailMode === 'login' ? 'Sign in with Email' : 'Create Account')}
                            </Button>
                            <Typography
                                variant="caption"
                                onClick={() => setEmailMode(emailMode === 'login' ? 'signup' : 'login')}
                                sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                {emailMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                            </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                            By signing in, you agree to our{' '}
                            <Box component="a" href="/terms-of-service" target="_blank" rel="noreferrer" sx={{ color: 'primary.main' }}>
                                Terms of Service
                            </Box>{' '}
                            and{' '}
                            <Box component="a" href="/privacy-policy" target="_blank" rel="noreferrer" sx={{ color: 'primary.main' }}>
                                Privacy Policy
                            </Box>.
                        </Typography>
                        <Divider sx={{ marginY: 2 }} />
                        <Typography variant="caption" color="text.secondary">© {year} {COMPANY_NAME}. All rights reserved.</Typography>
                        <Typography variant="caption" color="text.secondary">
                            v{APP_VERSION}
                        </Typography>
                    </Stack>
                }
            </Paper>
        </Box>
    );
}