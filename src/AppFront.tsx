import './App.css'
import { RouterProvider } from 'react-router'
import { appRouter } from './router/app.router'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './components/theme-provider'

function AppFront() {

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <RouterProvider router={appRouter} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default AppFront
