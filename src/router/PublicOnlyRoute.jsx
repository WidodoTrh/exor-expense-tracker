import authProfiles from "../store/auth";
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';


export function PublicOnlyRoute({ children }) {
    const state_AUTH_PROFILE = authProfiles((s) => s.state_AUTH_PROFILE);
    const loading = authProfiles((s) => s.loading);
    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (state_AUTH_PROFILE) {
        return <Navigate to="/" replace />;
    }

    return children;
}