import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Avatar, Typography, TextField, Button, Divider, CircularProgress, Alert } from '@mui/material';
import { useMyProfileQuery } from '../hooks/useMyProfilesOpt';
import authProfiles from '../store/auth';
import useIsMobile from '../hooks/useIsMobile'


export default function Profile() {
    const { myProfile, profileLoading } = useMyProfileQuery()
    const logoutBtn = authProfiles((s) => s.act_LOGOUT)
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const [message, setMessage] = useState(null);

    const avatarUrl = myProfile?.user_metadata?.avatar_url;
    

    useEffect(() => {
        if (!isMobile) {
            navigate('/home', {replace: true})
        }
    },[isMobile, navigate])

    if (!isMobile) { 
        return null;
    }

    if (profileLoading) {
        return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
        </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 480, mx: 'auto', mt: { xs: 2, sm: 4 }, px: 2 }}>
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar src={avatarUrl} sx={{ width: 80, height: 80, fontSize: 32, mb: 1 }}>
                    {!avatarUrl && myProfile?.display_name}
                </Avatar>
                <Typography variant="h6">{myProfile?.display_name || 'Unnamed User'}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {myProfile?.household_name}
                </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {message && (
                    <Alert severity={message.type} sx={{ mb: 2 }}>
                        {message.text}
                    </Alert>
                )}

                <TextField
                    label="Email"
                    fullWidth
                    value={myProfile?.email}
                    // onChange={(e) => setDisplayName(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled
                />

                {/* <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ mb: 1 }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button> */}

                <Button variant="outlined" color="error" fullWidth onClick={logoutBtn}>Log Out</Button>
            </Paper>
        </Box>
    );
}