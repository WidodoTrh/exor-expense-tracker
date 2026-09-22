import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, ListItemButton, ListItemIcon, ListItemText, Box, Paper, Avatar, Typography, TextField, Button, Divider, CircularProgress, Alert } from '@mui/material';
import { useMyProfileQuery } from '../hooks/useMyProfilesOpt';
import { useMySessionsQuery } from '../hooks/useMySessionOpt';
import { CHANGELOG } from '../lib/changelog';
import { Link } from 'react-router-dom'
import { useColorMode } from '../context/ThemeContext'
import { useHouseholdMembersQuery } from '../hooks/useHouseholdOpt';
import { useSnackbar } from 'notistack';
import { SlideDownTransition, GrowTransition, ZoomTransition } from '../component/TransitionEffect';

import DataTable from '../component/BaseDataTable'
import HistoryIcon from '@mui/icons-material/History'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import authProfiles from '../store/auth';
import useIsMobile from '../hooks/useIsMobile'
import ActiveSessions from '../component/ActiveSession';
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'


export default function Profile() {
    const { myProfile, profileLoading, createOwnHousehold, dropOwnHousehold } = useMyProfileQuery()
    const { members, memberOnLoad } = useHouseholdMembersQuery()
    const { revokeSession, signOutOthers } = useMySessionsQuery()
    const logoutBtn = authProfiles((s) => s.act_LOGOUT)
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const [message, setMessage] = useState(null);
    const { toggleColorMode } = useColorMode()
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar();

    const [ HouseholdDialogOpen, setHouseholdDialogOpen ] = useState(false)
    const [ dropHouseholdDialog, setDropHouseholdDialog ] = useState(false)
    const [ householdName, setHouseholdName ] = useState('')
    const [ submitting, setSubmitting ] = useState(false)

    const avatarUrl = myProfile?.user_metadata?.avatar_url;

    if (profileLoading) {
        return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
        </Box>
        );
    }

    const handleCreateHousehold = async(householdName) => {
        setSubmitting(true)
        try {
            await createOwnHousehold(householdName)
            enqueueSnackbar(`Household successfuly created`, { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(`Failed to Create Household`, { variant: 'error' });
        } finally { 
            setSubmitting(false)
            setHouseholdName('')
            setHouseholdDialogOpen(false)
        }
    }
    
    const handleDropHousehold = async(householdId) => {
        setSubmitting(true)
        try {
            const res = await dropOwnHousehold(householdId)
            enqueueSnackbar(`Household successfuly deleted`, { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(`failed to delete household`, { variant: 'error' });
        } finally { 
            setSubmitting(false)
            setDropHouseholdDialog(false)
        }
    }

    const dt_housholdMember = [
        {
            id: 'name',
            label: 'Member Name',
            render: (row) => row.profiles.display_name,
            noWrap: false
        },
        {
            id: 'role',
            label: 'Role',
            noWrap: true,
            render: (row) => {
                return ( 
                    <Chip label={row.role} />
                )
            }
        }
    ]

    
    return (
        <Box sx={{ mx: 'auto', mt: { xs: 2, sm: 4 }, px: 2, marginY : 2, }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Avatar src={avatarUrl} sx={{ width: 80, height: 80, fontSize: 32, mb: 1 }}>
                        {!avatarUrl && myProfile?.display_name}
                    </Avatar>
                    <Typography variant="h6">{myProfile?.display_name || 'Unnamed User'}</Typography>
                    {!myProfile?.household_id && (
                        <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:Hover' : {textDecoration: 'underline'}}}>
                            <Button variant='outlined' onClick={() => setHouseholdDialogOpen(true)}>Create your Household</Button>
                        </Typography>
                    )}
                    {myProfile?.household_id &&(
                        <Typography variant="body2" color="text.secondary" onClick={() => setDropHouseholdDialog(true)} sx={{ cursor: 'pointer', '&:Hover' : {textDecoration: 'underline'}}}>
                            {myProfile?.household_name}
                        </Typography>
                    )}
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

            {/* create household dialog */}
            <Dialog 
                open={HouseholdDialogOpen} 
                onClose={() => setHouseholdDialogOpen(false)}
                fullWidth
                maxWidth="sm"
                slots={{transition: GrowTransition}} 
                slotProps={{
                    transition: {
                        timeout: 650,
                    }
                }}
            >
                <DialogTitle>Create your own Household</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            size="small"
                            label="Household Name"
                            value={householdName}
                            onChange={(e) => setHouseholdName(e.target.value)}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHouseholdDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => handleCreateHousehold(householdName)} disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* list household and delete dialog */}
            <Dialog 
                open={dropHouseholdDialog} 
                onClose={() => setDropHouseholdDialog(false)}
                fullWidth
                maxWidth="sm"
                slots={{transition: GrowTransition}} 
                slotProps={{
                    transition: {
                        timeout: 650,
                    }
                }}
            >
                <DialogTitle>Your Household Detail</DialogTitle>
                <DialogContent>
                    <DataTable dense minTableWidth={0} loading={memberOnLoad} columns={dt_housholdMember} data={members} rowKey={(row) => row.user_id} defaultOrderBy="name" defaultOrder="asc" />
                </DialogContent>
                <DialogActions>
                    <Button sx={{mx: 2, mb:2}} fullWidth color="error" variant="outlined" onClick={() => handleDropHousehold(myProfile?.household_id)} disabled={submitting}>
                        {submitting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}