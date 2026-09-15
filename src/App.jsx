
import { useState, useEffect } from 'react'
import AppRouter from './router'
import authProfiles from './store/auth.js'
import { SWRConfig } from 'swr'

import './App.css'

function App() {
  const act_INIT_AUTH = authProfiles((s) => s.act_INIT_AUTH);
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  useEffect(() => {
    act_INIT_AUTH();
    const handlePageShow = (event) => {
        if (event.persisted) {
            act_INIT_AUTH();
        }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return (
    <SWRConfig value={{focusThrottleInterval: 30000}}>
      <AppRouter
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        DRAWER_WIDTH={280}
      />
    </SWRConfig>
  )
}

export default App