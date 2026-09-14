import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import authProfiles from '../store/auth';

export function ProtectedRoute({ children }) {
    // const { accessToken, loading } = useAuth();
    const state_AUTH_PROFILE = authProfiles((s) => s.state_AUTH_PROFILE);
    const loading = authProfiles((s) => s.loading)

    if (loading) {
        return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <CircularProgress />
        </Box>
        );
    }

    if (!state_AUTH_PROFILE) {
        return <Navigate to="/login" replace />;
    }

    return children;
}