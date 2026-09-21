import { useMemo, useState } from 'react';
import {
    Alert,
    alpha,
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';

// TODO: adjust this path to where your hook lives
import { useMySessionsQuery } from '../hooks/useMySessionOpt';

/* ---------- helpers ---------- */

// Lightweight UA parsing. Order matters (Edge/Opera/Chrome all contain "Safari",
// iPhone contains "Mac OS X", Android contains "Linux").
// For more accurate results, swap this for `ua-parser-js`.
function parseUserAgent(ua = '') {
    let browser = 'Unknown browser';
    if (/Edg(e|A|iOS)?\//.test(ua)) browser = 'Edge';
    else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
    else if (/Firefox\/|FxiOS\//.test(ua)) browser = 'Firefox';
    else if (/Chrome\/|CriOS\//.test(ua)) browser = 'Chrome';
    else if (/Safari\//.test(ua)) browser = 'Safari';

    let os = 'Unknown OS';
    if (/Windows/.test(ua)) os = 'Windows';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
    else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS';
    else if (/CrOS/.test(ua)) os = 'ChromeOS';
    else if (/Linux/.test(ua)) os = 'Linux';

    let device = 'desktop';
    if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) device = 'tablet';
    else if (/Mobi|iPhone|Android/.test(ua)) device = 'mobile';

    return { browser, os, device };
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
];

function timeAgo(iso) {
    const diffSec = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
    const abs = Math.abs(diffSec);
    if (abs < 60) return 'Just now';
    for (const [unit, sec] of UNITS) {
        if (abs >= sec) return rtf.format(Math.round(diffSec / sec), unit);
    }
    return 'Just now';
}

const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const DEVICE_ICON = {
    desktop: ComputerOutlinedIcon,
    mobile: SmartphoneOutlinedIcon,
    tablet: TabletMacOutlinedIcon,
};

/* ---------- single row ---------- */

function SessionItem({ session, onRevoke, revoking }) {
    const { browser, os, device } = parseUserAgent(session.user_agent);
    const DeviceIcon = DEVICE_ICON[device];
    const isCurrent = session.is_current;

    return (
        <Paper
            variant="outlined"
            sx={(theme) => {
                const isDark = theme.palette.mode === 'dark';
                return {
                    p: 2,
                    bgcolor: isCurrent
                        ? alpha(theme.palette.primary.main, isDark ? 0.16 : 0.06)
                        : 'background.paper',
                    borderColor: isCurrent
                        ? 'primary.main'
                        : isDark
                            ? 'divider'
                            : alpha(theme.palette.common.black, 0.16),
                    borderWidth: isCurrent ? 1.5 : 1,
                    boxShadow: isDark ? 'none' : '0 1px 2px rgba(16, 24, 40, 0.06)',
                };
            }}
        >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Avatar
                    sx={{
                        bgcolor: isCurrent ? 'primary.main' : 'action.hover',
                        color: isCurrent ? 'primary.contrastText' : 'text.secondary',
                    }}
                >
                    <DeviceIcon />
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                            {browser} on {os}
                        </Typography>
                        {isCurrent && <Chip label="This device" color="primary" size="small" />}
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                        IP {session.ip || 'unknown'}
                    </Typography>

                    <Tooltip title={session.user_agent || ''} placement="bottom-start">
                        <Typography variant="body2" color="text.secondary">
                            {isCurrent ? 'Active now' : `Last active ${timeAgo(session.updated_at)}`}
                            {' \u2022 '}
                            Signed in {dateTimeFmt.format(new Date(session.created_at))}
                        </Typography>
                    </Tooltip>
                </Box>

                {onRevoke && !isCurrent && (
                    <Button
                        size="small"
                        color="error"
                        onClick={() => onRevoke(session.id)}
                        disabled={revoking}
                    >
                        {revoking ? 'Signing out…' : 'Sign out'}
                    </Button>
                )}
            </Stack>
        </Paper>
    );
}

function SessionSkeleton() {
    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton width="40%" />
                    <Skeleton width="25%" />
                    <Skeleton width="60%" />
                </Box>
            </Stack>
        </Paper>
    );
}

/* ---------- main component ---------- */

/**
 * @param {object}   props
 * @param {() => Promise<void>} [props.onSignOutOthers]
 *        Optional. If provided, shows a "Sign out other sessions" button.
 *        e.g. () => supabase.auth.signOut({ scope: 'others' })
 * @param {(sessionId: string) => Promise<void>} [props.onRevokeSession]
 *        Optional. If provided, each non-current session gets a "Sign out" button.
 */
export default function ActiveSessions({ onSignOutOthers, onRevokeSession }) {
    const {
        mySessions,
        sessionsLoading,
        sessionsValidating,
        sessionsError,
        refreshSessions,
    } = useMySessionsQuery();

    const [signingOut, setSigningOut] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [revokingId, setRevokingId] = useState(null);

    // Current session first, then most recently active
    const sessions = useMemo(
        () =>
            [...(mySessions ?? [])].sort(
                (a, b) =>
                    Number(b.is_current) - Number(a.is_current) ||
                    new Date(b.updated_at) - new Date(a.updated_at)
            ),
        [mySessions]
    );

    const otherCount = sessions.filter((s) => !s.is_current).length;

    const handleSignOutOthers = async () => {
        setActionError(null);
        setSigningOut(true);
        try {
            await onSignOutOthers();
            await refreshSessions();
        } catch (err) {
            setActionError(err?.message || 'Could not sign out other sessions. Try again.');
        } finally {
            setSigningOut(false);
        }
    };

    const handleRevoke = async (sessionId) => {
        setActionError(null);
        setRevokingId(sessionId);
        try {
            await onRevokeSession(sessionId);
            await refreshSessions();
        } catch (err) {
            setActionError(err?.message || 'Could not sign out that session. Try again.');
        } finally {
            setRevokingId(null);
        }
    };

    return (
        <Box>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{
                    mb: 2,
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                }}
            >
                <Box>
                    <Typography variant="h6">Active sessions</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Devices where you're currently signed in.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Tooltip title="Refresh">
                        <span>
                            <IconButton
                                onClick={() => refreshSessions()}
                                disabled={sessionsLoading || sessionsValidating}
                                aria-label="Refresh sessions"
                            >
                                <RefreshIcon />
                            </IconButton>
                        </span>
                    </Tooltip>

                    {onSignOutOthers && otherCount > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={handleSignOutOthers}
                            disabled={signingOut}
                        >
                            {signingOut ? 'Signing out…' : 'Sign out other sessions'}
                        </Button>
                    )}
                </Stack>
            </Stack>

            {actionError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
                    {actionError}
                </Alert>
            )}

            {sessionsError ? (
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => refreshSessions()}>
                            Retry
                        </Button>
                    }
                >
                    Couldn't load your sessions. Check your connection and try again.
                </Alert>
            ) : sessionsLoading ? (
                <Stack spacing={1.5}>
                    <SessionSkeleton />
                    <SessionSkeleton />
                </Stack>
            ) : sessions.length === 0 ? (
                <Typography color="text.secondary">No active sessions found.</Typography>
            ) : (
                <Stack spacing={1.5}>
                    {sessions.map((s) => (
                        <SessionItem
                            key={s.id}
                            session={s}
                            onRevoke={onRevokeSession ? handleRevoke : undefined}
                            revoking={revokingId === s.id}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
}