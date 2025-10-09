
import './App.css'
import { RouterProvider } from 'react-router'
import { appRouter } from './router/app.router'
import { AuthProvider } from './contexts/AuthContext'

function AppFront() {

  return (
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  )
}

export default AppFront
