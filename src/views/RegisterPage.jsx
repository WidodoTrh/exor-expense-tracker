import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack, CircularProgress, Divider, TextField, InputAdornment, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function RegisterPage() {
    const APP_VERSION = import.meta.env.VITE_APP_VERSION;
    const COMPANY_NAME = import.meta.env.VITE_APP_NAME;
    const year = new Date().getFullYear();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        setIsSubmitting(false);
        if (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
            return;
        }
        if (!data.session) {
            enqueueSnackbar('Check your email inbox to verify your account', { variant: 'info' });
            navigate('/login', { replace: true });
            return;
        }
        navigate('/home', { replace: true });
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 1, marginX: 2 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, textAlign: 'center', width: '100%', maxWidth: 600, mx: 'auto' }}>
                <Stack spacing={2}>
                    <Typography variant="h3" fontWeight={600} color="text.primary">Exordium</Typography>
                    <Typography variant="h6" color="text.primary">Expense Tracker App</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField label="Full Name" value={fullName} onChange={(event) => setFullName(event.target.value)} required fullWidth size="small" />
                        <TextField label="Email" type="email" size="small" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth />
                        <TextField label="Password" type={showPassword ? 'text' : 'password'} size="small" value={password} onChange={(event) => setPassword(event.target.value)} required fullWidth slotProps={{ htmlInput: { minLength: 6 }, input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword((previous) => !previous)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
                        <Button type="submit" variant="outlined" disabled={isSubmitting} sx={{ textTransform: 'none' }} fullWidth>{isSubmitting ? <CircularProgress size={16} color="inherit" /> : 'Create Account'}</Button>
                        <Typography component={Link} to="/login" variant="caption" sx={{ color: 'primary.main', textDecoration: 'underline' }}>Already have an account? Sign in</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>By signing up, you agree to our <Box component="a" href="/terms-of-service" target="_blank" rel="noreferrer" sx={{ color: 'primary.main' }}>Terms of Service</Box> and <Box component="a" href="/privacy-policy" target="_blank" rel="noreferrer" sx={{ color: 'primary.main' }}>Privacy Policy</Box>.</Typography>
                    <Divider sx={{ marginY: 2 }} />
                    <Typography variant="caption" color="text.secondary">© {year} {COMPANY_NAME}. All rights reserved.</Typography>
                    <Typography variant="caption" color="text.secondary">v{APP_VERSION}</Typography>
                </Stack>
            </Paper>
        </Box>
    );
}
