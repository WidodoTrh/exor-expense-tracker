import { useMemo } from 'react';
import { alpha, Box, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import useIsMobile from '../hooks/useIsMobile';
import { CHANGELOG } from '../lib/changelog';

const TYPE_META = {
    added: { label: 'Added', color: 'success' },
    improved: { label: 'Improved', color: 'info' },
    fixed: { label: 'Fixed', color: 'warning' },
    security: { label: 'Security', color: 'error' },
};

const dateFmt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' });

function ChangeRow({ change }) {
    const meta = TYPE_META[change.type] ?? { label: change.type, color: 'default' };

    return (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Chip
                label={meta.label}
                color={meta.color}
                size="small"
                variant="outlined"
                sx={{ width: 84, flexShrink: 0, fontWeight: 600 }}
            />
            <Typography variant="body2" sx={{ lineHeight: '24px' }}>
                {change.text}
            </Typography>
        </Stack>
    );
}

function ReleaseCard({ release, isLatest }) {
    return (
        <Paper
            variant="outlined"
            sx={(theme) => {
                const isDark = theme.palette.mode === 'dark';
                return {
                    p: { xs: 2, sm: 3 },
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '180px 1fr' },
                    gap: { xs: 1.5, md: 3 },
                    bgcolor: 'background.paper',
                    borderColor: isDark ? 'divider' : alpha(theme.palette.common.black, 0.16),
                    boxShadow: isDark ? 'none' : '0 1px 2px rgba(16, 24, 40, 0.06)',
                };
            }}
        >
            <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        v{release.version}
                    </Typography>
                    {isLatest && <Chip label="Latest" color="primary" size="small" />}
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {dateFmt.format(new Date(release.date))}
                </Typography>
            </Box>

            <Box>
                {release.title && (
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                        {release.title}
                    </Typography>
                )}
                <Stack spacing={1.25}>
                    {release.changes.map((change, i) => (
                        <ChangeRow key={`${release.version}-${i}`} change={change} />
                    ))}
                </Stack>
            </Box>
        </Paper>
    );
}

export default function ChangeLog() {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();

    const handleBack = () => {
        if (location.key !== 'default') navigate(-1);
        else navigate('/profile', { replace: true });
    };

    const releases = useMemo(
        () => [...CHANGELOG].sort((a, b) => b.date.localeCompare(a.date)),
        []
    );

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: { xs: 2, sm: 4 }, px: 2, pb: 4 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <IconButton edge="start" onClick={handleBack} aria-label="Go back">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Change log
                </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                New features, improvements and fixes in each release.
            </Typography>

            {releases.length === 0 ? (
                <Typography sx={{ color: 'text.secondary' }}>No releases yet.</Typography>
            ) : (
                <Stack spacing={2}>
                    {releases.map((release, i) => (
                        <ReleaseCard key={release.version} release={release} isLatest={i === 0} />
                    ))}
                </Stack>
            )}
        </Box>
    );
}