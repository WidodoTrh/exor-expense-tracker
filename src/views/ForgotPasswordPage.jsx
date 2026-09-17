import { useState } from 'react'
import { Box, Typography, Button, Paper, Stack, CircularProgress, TextField } from '@mui/material'
import { Link } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { supabase } from '../lib/supabaseClient'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [sent, setSent] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        setSubmitting(false)

        if (error) {
            enqueueSnackbar(error.message, { variant: 'error' })
            return
        }

        setSent(true)
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                px: 1,
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
                <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={600} color="text.primary">
                        Forgot Password
                    </Typography>

                    {sent ? (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                Kalau email <strong>{email}</strong> terdaftar, kami udah kirim link buat reset password. Cek inbox (atau folder spam) email lo.
                            </Typography>
                            <Button component={Link} to="/login" variant="outlined" sx={{ textTransform: 'none' }}>
                                Back to Login
                            </Button>
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                Masukkan email yang terdaftar, kami akan kirim link buat reset password.
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <TextField
                                    label="Email"
                                    type="email"
                                    size="small"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    fullWidth
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={submitting}
                                    sx={{ textTransform: 'none' }}
                                    fullWidth
                                >
                                    {submitting ? <CircularProgress size={16} color="inherit" /> : 'Send Reset Link'}
                                </Button>
                                <Typography
                                    component={Link}
                                    to="/login"
                                    variant="caption"
                                    sx={{ color: 'primary.main', textDecoration: 'underline' }}
                                >
                                    Back to Login
                                </Typography>
                            </Box>
                        </>
                    )}
                </Stack>
            </Paper>
        </Box>
    )
}