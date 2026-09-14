import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

const ColorModeContext = createContext({ toggleColorMode: () => {} })

export function useColorMode() {
  return useContext(ColorModeContext)
}

export function CustomThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme-mode', mode)
  }, [mode])

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode(prev => (prev === 'light' ? 'dark' : 'light'))
      },
      mode
    }),
    [mode]
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#6366f1',      // Bootstrap blue
            light: '#818cf8',
            dark: '#4f46e5',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#6c757d',      // Bootstrap gray
            light: '#8a9299',
            dark: '#565e64',
            contrastText: '#ffffff',
          },
          error: {
            main: '#dc3545',      // Bootstrap red (danger)
            light: '#e35d6a',
            dark: '#b02a37',
            contrastText: '#ffffff',
          },
          warning: {
            main: '#ffc107',      // Bootstrap yellow
            light: '#ffcd39',
            dark: '#cc9a06',
            contrastText: '#000000',
          },
          info: {
            main: '#0dcaf0',      // Bootstrap cyan
            light: '#3dd5f3',
            dark: '#0aa2c0',
            contrastText: '#000000',
          },
          success: {
            main: '#198754',      // Bootstrap green
            light: '#479f76',
            dark: '#146c43',
            contrastText: '#ffffff',
          },
          ...(mode === 'light'
            ? {
                background: { default: '#ffffff', paper: '#ffffff' },
                text: { primary: '#08060d', secondary: '#6b6375' }
              }
            : {
                background: { default: '#16171d', paper: '#1f2028' },
                text: { primary: '#f3f4f6', secondary: '#9ca3af' }
              })
        },
        typography: {
          fontFamily: '"DM Sans", sans-serif',
          button: {
            textTransform: 'none'
          }
        }
      }),
    [mode]
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}