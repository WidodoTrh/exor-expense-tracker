import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack, CircularProgress, Divider, TextField, InputAdornment, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';

import DemoLoginButton from '../component/DemoLoginButton';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function LoginPage() {
    const APP_VERSION = import.meta.env.VITE_APP_VERSION;
    const COMPANY_NAME = import.meta.env.VITE_APP_NAME;
    const year = new Date().getFullYear();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailSubmit = async (event) => {
        event.preventDefault();
        setIsSubmittingEmail(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setIsSubmittingEmail(false);
        if (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
            return;
        }
        navigate('/home', { replace: true });
    };

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
        if (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
            setIsLoggingIn(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 1, marginX: 2 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, textAlign: 'center', width: '100%', maxWidth: 600, mx: 'auto' }}>
                <Stack spacing={2}>
                    <Typography variant="h3" fontWeight={600} color="text.primary">Exordium</Typography>
                    <Typography variant="h6" color="text.primary">Expense Tracker App</Typography>
                    {/* <Typography variant="body2" color="text.secondary">Sign in with your Google account to start tracking your cashflow</Typography> */}
                    {/* <Button variant="contained" startIcon={isLoggingIn ? <CircularProgress size={16} color="inherit" /> : <GoogleIcon />} onClick={handleGoogleLogin} sx={{ marginY: 2, textTransform: 'none' }} disabled={isLoggingIn}>{isLoggingIn ? 'Signing in...' : 'Sign in with Google'}</Button> */}
                    {/* <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">or</Typography></Divider> */}
                    <Box component="form" onSubmit={handleEmailSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField label="Email" type="email" size="small" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth />
                        <TextField label="Password" type={showPassword ? 'text' : 'password'} size="small" value={password} onChange={(event) => setPassword(event.target.value)} required fullWidth slotProps={{ htmlInput: { minLength: 6 }, input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword((previous) => !previous)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
                        <Button type="submit" variant="outlined" disabled={isSubmittingEmail} sx={{ textTransform: 'none' }} fullWidth>{isSubmittingEmail ? <CircularProgress size={27} color="inherit" /> : 'Sign in with Email'}</Button>
                        {/* <DemoLoginButton /> */}
                        <Typography component={Link} to="/register" variant="caption" sx={{ color: 'primary.main', textDecoration: 'underline' }}>Don't have an account? Sign up</Typography>
                        <Typography component={Link} to="/forgot-password" variant="caption" sx={{ color: 'primary.main', textDecoration: 'underline', display: 'block', textAlign: 'center' }}>Forgot password?</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>By signing in, you agree to our <Box component="a" href="/terms-of-service" target="_blank" rel="noreferrer" sx={{ color: 'primary.main' }}>Terms of Service</Box> and <Box component="a" href="/privacy-policy" target="_blank" rel="noreferrer" sx={{ color: 'primary.main' }}>Privacy Policy</Box>.</Typography>
                    <Divider sx={{ marginY: 2 }} />
                    <Typography variant="caption" color="text.secondary">© {year} {COMPANY_NAME}. All rights reserved.</Typography>
                    <Typography variant="caption" color="text.secondary">v{APP_VERSION}</Typography>
                </Stack>
            </Paper>
        </Box>
    );
}
