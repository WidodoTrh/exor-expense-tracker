import { useState, useEffect } from 'react'
import { useTheme, Drawer, Box, Button, Tooltip,Typography, Divider, useMediaQuery, IconButton, Avatar, Menu, MenuItem  } from '@mui/material';
import { Link, useLocation } from 'react-router-dom'
import { useColorMode } from '../context/ThemeContext'
import { useMyProfileQuery } from '../hooks/useMyProfilesOpt';
import { NAVBAR_HEIGHT } from '../AppLayout';

import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import authProfiles from '../store/auth';
import PersonIcon from '@mui/icons-material/Person';
import useIsMobile from '../hooks/useIsMobile';

const navItems = [
  { label: 'Dashboard', path: '/home', menuIcon: <HomeIcon fontSize='small' />  },
  { label: 'Transaction', path: '/trx', menuIcon: <ReceiptLongIcon fontSize='small'/> },
  { label: 'Settings', path: '/settings', menuIcon: <SettingsIcon fontSize='small' /> },
]

const MINI_WIDTH = 72;

function Sidebar({ open, width, onClose }) {
    const { myProfile } = useMyProfileQuery()
    const logoutBtn = authProfiles((s) => s.act_LOGOUT)
    const theme = useTheme()
    const isMobile = useIsMobile()
    const location = useLocation();
    const { toggleColorMode } = useColorMode()
    const currentWidth = open ? width : MINI_WIDTH;

    const [profileAnchor, setProfileAnchor] = useState(null)
    const openProfileMenu = Boolean(profileAnchor)
    const handleProfileClick = (e) => setProfileAnchor(e.currentTarget)
    const handleProfileClose = () => setProfileAnchor(null)

    const handle_logOut = async () => {
        try {
            await logoutBtn()
        } catch (error) {
            console.error('error' , error)
        }
    }

    const handleMenuClick = () => {
        if (isMobile) {
            onClose();
        }
    };

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            anchor="left"
            open={isMobile ? open : true}
            onClose={onClose}
            ModalProps={{
                keepMounted: true,
            }}
            sx={{
                width: isMobile ? 0 : 0,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    position: isMobile ? 'fixed' : 'fixed',
                    top: isMobile ? 0 :NAVBAR_HEIGHT,
                    width: currentWidth,
                    height: isMobile ? '100%' : `calc(100% - 60px)`,
                    overflowX: 'hidden',
                    transition: (theme) =>
                        theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    boxSizing: 'border-box',
                    borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                    borderLeft: 'none',
                    zIndex: (theme) => isMobile ? theme.zIndex.drawer : theme.zIndex.appBar - 1,
                },
            }}
        >   
            <Box sx={{display: 'flex', justifyContent: 'center', height: 40}}>
                
            </Box>
            {/* <Divider /> */}
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', paddingY: 3 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));
                    return (
                        <Tooltip key={item.path} title={!open ? item.label : ''} placement="right">
                            <Button
                                size="large"
                                startIcon={open ? item.menuIcon : null}
                                component={Link}
                                to={item.path}
                                color="inherit"
                                onClick={handleMenuClick}
                                sx={{
                                    justifyContent: open ? 'flex-start' : 'center',
                                    minWidth: 0,
                                    color: isActive ? 'primary.contrastText' : 'text.primary',
                                    bgcolor: isActive ? 'secondary.main' : '',
                                    fontWeight: isActive ? 700 : 400,
                                    borderRadius: 2,
                                    px: open ? 2 : 0,
                                    marginX: 2
                                }}
                            >
                                {open ? item.label : item.menuIcon}
                            </Button>
                        </Tooltip>
                    );
                })}

                {!open && isMobile && (
                    <Box>
                        <Divider sx={{marginY: 3}} />
                        <IconButton onClick={handleProfileClick} sx={{marginX: 1}}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }} src={myProfile?.user?.picture}>
                                {myProfile?.display_name ? myProfile?.display_name.charAt(0).toUpperCase() : <PersonIcon fontSize="small" />}
                            </Avatar>
                        </IconButton>
                    </Box>
                )}

                <Divider sx={{ marginY: 2}} />
                {isMobile && open && (
                    <Box
                        onClick={handleProfileClick}
                        sx={{
                            display: 'flex',
                            flexGrow: 1,
                            justifyContent: 'end',
                            alignItems: 'center',
                            marginX: 1,
                            cursor: 'pointer',
                        }}
                    >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }} src={myProfile?.user?.picture}>
                            {myProfile?.display_name ? myProfile?.display_name.charAt(0).toUpperCase() : <PersonIcon fontSize="small" />}
                        </Avatar>
                        <Typography variant="body2" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700, marginX: 1 }}>
                            {myProfile?.display_name}
                        </Typography>
                    </Box>
                )}
                <Menu anchorEl={profileAnchor}
                    open={openProfileMenu}
                    onClose={handleProfileClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{
                        paper: {
                            sx: {
                                minHeight: 'auto',
                                overflowY: 'auto',
                                width: 300,
                            }
                        }
                    }}
                >
                    <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'end' }}>
                        <IconButton onClick={toggleColorMode} color="inherit" sx={{ ml: 1 }}>
                            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Box>
                    <Divider />
                    <MenuItem>
                        <Button color="inherit" onClick={handle_logOut}>Logout</Button>
                    </MenuItem>
                </Menu>
            </Box>
        </Drawer>
    );
}

export default Sidebar;