import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Paper, Stack, CircularProgress, TextField, InputAdornment, IconButton } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useSnackbar } from 'notistack'
import { supabase } from '../lib/supabaseClient'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const { enqueueSnackbar } = useSnackbar()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            enqueueSnackbar('Password tidak sama', { variant: 'warning' })
            return
        }

        setSubmitting(true)
        const { error } = await supabase.auth.updateUser({ password })
        setSubmitting(false)

        if (error) {
            enqueueSnackbar(error.message, { variant: 'error' })
            return
        }

        enqueueSnackbar('Password berhasil diubah, silakan login', { variant: 'success' })
        navigate('/login', { replace: true })
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
                        Set New Password
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField
                            label="New Password"
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
                                            <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            label="Confirm New Password"
                            type={showPassword ? 'text' : 'password'}
                            size="small"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            fullWidth
                        />
                        <Button type="submit" variant="contained" disabled={submitting} fullWidth sx={{ textTransform: 'none' }}>
                            {submitting ? <CircularProgress size={16} color="inherit" /> : 'Update Password'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}