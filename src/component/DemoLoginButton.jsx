// components/DemoLoginButton.jsx
import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useDemoUserOpt } from '../hooks/useDemoUserOpt';
import { useSnackbar } from 'notistack';

export default function DemoLoginButton() {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { postSeed } = useDemoUserOpt()

    const handleDemoLogin = async () => {
        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInAnonymously();
            if (authError) throw authError;
            await postSeed()
            navigate('/home');
        } catch (err) {
            enqueueSnackbar(`Demo login failed: ${err}`, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outlined" onClick={handleDemoLogin} disabled={loading}>
            {loading ? <CircularProgress size={28} /> : 'Try Demo'}
        </Button>
    );
}