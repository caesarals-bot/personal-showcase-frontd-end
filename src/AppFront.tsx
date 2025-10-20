import './App.css'
import { RouterProvider } from 'react-router'
import { appRouter } from './router/app.router'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './components/theme-provider'
import { ErrorBoundary } from './components/error-boundary'
import { UpdateNotification } from './components/ui/UpdateNotification'

function AppFront() {

  return (
    <ErrorBoundary
      level="page"
      name="Application Root"
      showDetails={process.env.NODE_ENV === 'development'}
      enableRetry={true}
      maxRetries={2}
    >
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <RouterProvider router={appRouter} />
          <UpdateNotification />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default AppFront
