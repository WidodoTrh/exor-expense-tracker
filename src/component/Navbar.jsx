import { useState, useEffect } from 'react'
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme, Avatar, Menu, Divider, MenuItem, ListItemIcon } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import { useColorMode } from '../context/ThemeContext'
import { useMyProfileQuery } from '../hooks/useMyProfilesOpt';


import MenuIcon from '@mui/icons-material/Menu'
import AppsIcon from '@mui/icons-material/Apps';
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import PersonIcon from '@mui/icons-material/Person'
import authProfiles from '../store/auth';
import useIsMobile from '../hooks/useIsMobile';

const navItems = [
  { label: 'Home', path: '/home' },
]

function Navbar({onToggleSidebar, sidebarOpen}) {
  const logoText = import.meta.env.VITE_APP_NAME
  const { myProfile } = useMyProfileQuery()
  const logoutBtn = authProfiles((s) => s.act_LOGOUT)
  const theme = useTheme()
  const isMobile = useIsMobile()
  const { toggleColorMode } = useColorMode()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

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

  return (
    <>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
            {logoText}
          </Typography>
          {!isMobile && (
            <IconButton
                edge="start"
                color="inherit"
                onClick={onToggleSidebar}
                sx={{ mx: 2 }}
              >
                <MenuIcon />
            </IconButton>
          )}
          
          {!isMobile && (  
            <Box sx={{display: 'flex', flexGrow: 1, justifyContent: 'end', alignItems: 'center'}}>
              <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'end' }}>
                <IconButton onClick={toggleColorMode} color="inherit" sx={{ ml: 1 }}>
                  {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700, marginX: 3 }}>
                  {myProfile?.display_name}
              </Typography>
              <IconButton onClick={handleProfileClick}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }} src={myProfile?.user?.picture}>
                  {myProfile?.display_name ? myProfile?.display_name.charAt(0).toUpperCase() : <PersonIcon fontSize="small" />}
                </Avatar>
              </IconButton>
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
                        minHeight: 300,
                        overflowY: 'auto',
                        width: 400,
                        display: 'flex',
                        flexDirection: 'column'
                    }
                },
                list: {
                  sx : {
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1
                  }
                }
            }}
          >
            <MenuItem sx={{marginTop: 'auto'}}>
              <Button fullWidth color="inherit" onClick={handle_logOut}>Logout</Button>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {navItems.map(item => {
              const isActive = item.path === '/' ? location.pathname === '/' : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
              return (
                  <ListItem key={item.path} disablePadding>
                      <ListItemButton component={Link} to={item.path} selected={isActive}>
                          <ListItemText primary={item.label} />
                      </ListItemButton>
                  </ListItem>
                )
            })}
          </List>
        </Box>
      </Drawer>
    </>
  )
}

export default Navbar
