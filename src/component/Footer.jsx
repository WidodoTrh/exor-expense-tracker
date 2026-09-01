import { Box, Typography, Container } from '@mui/material'

const APP_VERSION = import.meta.env.VITE_APP_VERSION
const COMPANY_NAME = import.meta.env.VITE_APP_NAME

function Footer() {
    const year = new Date().getFullYear()

    return (
        <Box component="footer" sx={{borderTop: 1, borderColor: 'divider', py: 2, mt: 'auto'}}>
            <Box sx={{display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1, px: 5}}>
                <Typography variant="body2" color="text.secondary">© {year} eLibrary. All rights reserved.</Typography>
                <Typography variant="body2" color="text.secondary">
                    v{APP_VERSION} — {COMPANY_NAME}
                </Typography>
            </Box>
        </Box>
    )
}

export default Footer