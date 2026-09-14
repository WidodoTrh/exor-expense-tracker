import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Navbar from './component/Navbar';
import Sidebar from './component/Sidebar';
import Footer from './component/Footer';
import { useState } from 'react';


const DRAWER_WIDTH = 340;
const MINI_WIDTH = 72;

export default function AppLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                <Toolbar />
                <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: 0,
                            marginLeft: isMobile
                                ? 0
                                : `${sidebarOpen ? DRAWER_WIDTH : MINI_WIDTH}px`,
                            transition: (theme) =>
                                theme.transitions.create('margin-left', {
                                    easing: theme.transitions.easing.sharp,
                                    duration: theme.transitions.duration.enteringScreen,
                                }),
                        }}
                    >
                        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Outlet />
                        </Box>
                        <Footer />
                    </Box>
                    <Sidebar
                        open={sidebarOpen}
                        width={DRAWER_WIDTH}
                        onClose={() => setSidebarOpen(false)}
                    />
                </Box>
            </Box>
        </LocalizationProvider>
    );
}