import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, ListItemButton, ListItemIcon, ListItemText, Box, Paper, Avatar, Typography, TextField, Button, Divider, CircularProgress, Alert } from '@mui/material';
import { useMyProfileQuery } from '../hooks/useMyProfilesOpt';
import { useMySessionsQuery } from '../hooks/useMySessionOpt';
import { CHANGELOG } from '../lib/changelog';
import { Link } from 'react-router-dom'
import { useColorMode } from '../context/ThemeContext'

import HistoryIcon from '@mui/icons-material/History'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import authProfiles from '../store/auth';
import useIsMobile from '../hooks/useIsMobile'
import ActiveSessions from '../component/ActiveSession';
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'


export default function Profile() {
    const { myProfile, profileLoading } = useMyProfileQuery()
    const { revokeSession, signOutOthers } = useMySessionsQuery()
    const logoutBtn = authProfiles((s) => s.act_LOGOUT)
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const [message, setMessage] = useState(null);
    const { toggleColorMode } = useColorMode()
    const theme = useTheme()

    const avatarUrl = myProfile?.user_metadata?.avatar_url;

    if (profileLoading) {
        return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
        </Box>
        );
    }

    return (
        <Box sx={{ mx: 'auto', mt: { xs: 2, sm: 4 }, px: 2, marginY : 2, }}>
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

                {message && (
                    <Alert severity={message.type} sx={{ mb: 2 }}>
                        {message.text}
                    </Alert>
                )}

                <TextField
                    variant='standard'
                    label="Email"
                    fullWidth
                    value={myProfile?.email}
                    sx={{ mb: 2 }}
                    disabled
                />
                
                <Box sx={{marginY: 2}}>
                    <ActiveSessions onSignOutOthers={signOutOthers} onRevokeSession={revokeSession} />
                </Box>
                <Divider sx={{ my: 2 }} />
                {isMobile &&
                <Box>
                    <ListItemButton onClick={toggleColorMode} sx={{ borderRadius: 2, mb: 2 }}>
                        <ListItemIcon><HistoryIcon /></ListItemIcon>
                        <ListItemText primary="Theme" secondary={`${theme.palette.mode}`} />
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </ListItemButton>
                    <ListItemButton component={Link} to="/changelog" sx={{ borderRadius: 2, mb: 2 }}>
                        <ListItemIcon><HistoryIcon /></ListItemIcon>
                        <ListItemText primary="Change log" secondary={`Version ${CHANGELOG[0].version}`} />
                        <ChevronRightIcon />
                    </ListItemButton>
                </Box>
                }
                <Button variant="outlined" color="error" fullWidth onClick={logoutBtn}>Log Out</Button>
            </Paper>
        </Box>
    );
}