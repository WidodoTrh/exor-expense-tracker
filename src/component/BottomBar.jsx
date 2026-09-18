import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

const navItems = [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/home' },
        { label: 'Transaction', icon: <ReceiptLongIcon />, path: '/trx' },
        { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
        { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
    ];

export default function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentIndex = navItems.findIndex((item) =>
        location.pathname.startsWith(item.path)
    );

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={currentIndex === -1 ? 0 : currentIndex}
                onChange={(event, newValue) => {
                    navigate(navItems[newValue].path);
                }}
            >
                {navItems.map((item) => (
                    <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
                ))}
            </BottomNavigation>
        </Paper>
    );
}