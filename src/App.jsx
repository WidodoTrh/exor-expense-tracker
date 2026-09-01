import { useState, useEffect } from 'react'
import AppRouter from './router'
import Navbar from './component/Navbar'
import Footer from './component/Footer'
import Sidebar from './component/Sidebar'
import authProfiles from './store/auth.js'
import { useSnackbar } from 'notistack'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import './App.css'
import { Box, Toolbar } from '@mui/material'

const DRAWER_WIDTH = 340;
const COLLAPSED_WIDTH = 64;

function App() {
  const { enqueueSnackbar } = useSnackbar()
  const fetchMyProfile = authProfiles((state) => state.act_AUTH_PROFILE);
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  useEffect(() => {
    async function fetchP() { 
      try {
        await fetchMyProfile();
      } catch (error) {
        enqueueSnackbar(`${error?.data}`, { variant: 'error' })
      }
    }
    fetchP()
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <Toolbar />
        <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            <AppRouter />
          </Box>
          <Sidebar open={sidebarOpen} width={DRAWER_WIDTH} />
        </Box>

        <Footer />
      </Box>
    </LocalizationProvider>
  )
}

export default App