/**
 * RouteErrorBoundary - Error Boundary específico para rutas y páginas
 * 
 * Características:
 * - Manejo de errores de navegación
 * - Fallback UI específico para páginas
 * - Integración con React Router
 * - Logging de errores de ruta
 * - Navegación de recuperación
 */

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RouteErrorBoundaryProps {
  children: React.ReactNode
  /** Nombre de la ruta para logging */
  routeName?: string
}

const RouteErrorFallback: React.FC<{
  error: Error
  retry: () => void
}> = ({ error, retry }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Error de Página</CardTitle>
          <CardDescription className="text-base">
            Ha ocurrido un error al cargar esta página
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información del error */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-medium text-sm mb-2">Detalles del Error:</h4>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Ruta:</strong> {location.pathname}
            </p>
          </div>

          {/* Acciones de recuperación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={retry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
            
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Recargar Página
            </Button>
            
            <Button variant="outline" onClick={handleGoBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver Atrás
            </Button>
            
            <Button variant="outline" onClick={handleGoHome} className="gap-2">
              <Home className="h-4 w-4" />
              Ir al Inicio
            </Button>
          </div>

          {/* Información adicional */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Si el problema persiste, por favor contacta al soporte técnico.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ 
  children, 
  routeName 
}) => {
  const location = useLocation()

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log específico para errores de ruta
    console.group('🛣️ Route Error Boundary')
    console.error('Route:', routeName || location.pathname)
    console.error('Location:', location)
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.groupEnd()

    // Guardar error de ruta en localStorage
    try {
      const routeErrors = JSON.parse(localStorage.getItem('route_errors') || '[]')
      routeErrors.push({
        route: routeName || location.pathname,
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
      
      // Mantener solo los últimos 5 errores de ruta
      if (routeErrors.length > 5) {
        routeErrors.splice(0, routeErrors.length - 5)
      }
      
      localStorage.setItem('route_errors', JSON.stringify(routeErrors))
    } catch (e) {
      console.warn('Failed to save route error to localStorage:', e)
    }
  }

  return (
    <ErrorBoundary
      level="page"
      name={routeName || `Route: ${location.pathname}`}
      onError={handleError}
      fallback={(error, _errorInfo, retry) => (
        <RouteErrorFallback error={error} retry={retry} />
      )}
      enableRetry={true}
      maxRetries={2}
    >
      {children}
    </ErrorBoundary>
  )
}

export default RouteErrorBoundary