import { Backdrop, CircularProgress, Typography, Box } from '@mui/material'

function FullScreenLoading({ open, message = 'Loading...' }) {
    return (
        <Backdrop
            open={open}
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 999,
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <CircularProgress color="inherit" />
            <Typography variant="body1">{message}</Typography>
        </Backdrop>
    )
}

export default FullScreenLoading