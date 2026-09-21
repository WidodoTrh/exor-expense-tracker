import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState } from 'react';

import Navbar from './component/Navbar';
import Sidebar from './component/Sidebar';
import Footer from './component/Footer';
import MobileBottomNav from './component/BottomBar';
import useIsMobile from './hooks/useIsMobile';



export const NAVBAR_HEIGHT = 64;
const DRAWER_WIDTH = 340;
const MINI_WIDTH = 72;

export default function AppLayout() {
    const isMobile = useIsMobile()
    const [sidebarOpen, setSidebarOpen] = useState(true);
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
                            paddingBottom: isMobile ? '56px' : 0,
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
                    {isMobile &&
                        <MobileBottomNav />
                    }
                    {!isMobile &&    
                        <Sidebar
                            open={sidebarOpen}
                            width={DRAWER_WIDTH}
                            onClose={() => setSidebarOpen(false)}
                        />
                    }
                </Box>
            </Box>
        </LocalizationProvider>
    );
}