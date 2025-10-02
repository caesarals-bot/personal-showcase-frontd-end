
import './App.css'
import { RouterProvider } from 'react-router'
import { appRouter } from './router/app.router'

function App() {

  return (
    <RouterProvider router={appRouter} />
  )
}

export default App
