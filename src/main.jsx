import React from 'react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { CustomThemeProvider } from './context/ThemeContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import './index.css'
import { SnackbarProvider } from 'notistack'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomThemeProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={3000}
      >
        <BrowserRouter basename="/">
          <App /> 
        </BrowserRouter>
      </SnackbarProvider>
    </CustomThemeProvider>
  </React.StrictMode>
)