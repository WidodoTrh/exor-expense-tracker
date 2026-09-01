import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  Divider,
  MenuItem,
  ListItemIcon,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AppsIcon from '@mui/icons-material/Apps';
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { Link, useLocation } from 'react-router-dom'
import { useColorMode } from '../context/ThemeContext'
import authProfiles from '../store/auth';
import PersonIcon from '@mui/icons-material/Person'


const navItems = [
  { label: 'Home', path: '/home' },
  { label: 'Library', path: '/library' },
  { label: 'My Document', path: '/mydocument' },
  { label: 'Manage Document', path: '/manage' }
]

function Navbar({onToggleSidebar, sidebarOpen}) {
  const myProfile = authProfiles((state) => state.state_AUTH_PROFILE)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { toggleColorMode } = useColorMode()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  const [profileAnchor, setProfileAnchor] = useState(null)
  const openProfileMenu = Boolean(profileAnchor)
  const handleProfileClick = (e) => setProfileAnchor(e.currentTarget)
  const handleProfileClose = () => setProfileAnchor(null)

  return (
    <>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
            eLibrary
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 , marginX: 2}}>
              {navItems.map(item => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`))
                  return (
                    <Button
                      key={item.path}
                      component={Link}
                      to={item.path}
                      color="inherit"
                      sx={{
                        color: isActive ? 'primary.main' : 'text.primary',
                        fontWeight: isActive ? 700 : 400,
                        borderBottom: isActive ? 2 : 0,
                        borderColor: 'primary.main',
                        borderRadius: 0
                      }}
                    >
                      {item.label}
                    </Button>
                  )
              })}
            </Box>
          )}

          <IconButton
              edge="start"
              color="inherit"
              onClick={onToggleSidebar}
              sx={{ mr: 2 }}
            >
              <AppsIcon />
          </IconButton>
          <Divider orientation='vertical' flexItem/>
          <Typography variant="body2" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700, marginX: 3 }}>
              {myProfile?.name}
          </Typography>


          <IconButton onClick={handleProfileClick} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
              {myProfile?.name ? myProfile.name.charAt(0).toUpperCase() : <PersonIcon fontSize="small" />}
            </Avatar>
          </IconButton>

          <Menu anchorEl={profileAnchor}
            open={openProfileMenu}
            onClose={handleProfileClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
                paper: {
                    sx: {
                        minHeight: 350,
                        overflowY: 'auto',
                        width: 400,
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
              iframe di sini
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
