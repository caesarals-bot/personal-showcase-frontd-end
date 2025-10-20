/**
 * ErrorBoundary - Componente para capturar y manejar errores de React
 * 
 * Características:
 * - Captura errores en componentes hijos
 * - UI de fallback personalizable
 * - Logging de errores
 * - Botón de recuperación
 * - Diferentes niveles de error
 * - Integración con servicios de monitoreo
 */

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface ErrorBoundaryProps {
  /** Componentes hijos */
  children: ReactNode
  /** UI de fallback personalizada */
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode
  /** Nivel de error */
  level?: 'page' | 'section' | 'component'
  /** Nombre del componente para logging */
  name?: string
  /** Callback cuando ocurre un error */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Mostrar detalles técnicos */
  showDetails?: boolean
  /** Habilitar auto-retry */
  enableRetry?: boolean
  /** Número máximo de reintentos */
  maxRetries?: number
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  showDetails: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, name = 'Unknown Component' } = this.props

    // Actualizar estado con información del error
    this.setState({
      error,
      errorInfo
    })

    // Log del error
    this.logError(error, errorInfo, name)

    // Callback personalizado
    onError?.(error, errorInfo)

    // Enviar a servicio de monitoreo (ej: Sentry)
    this.reportError(error, errorInfo, name)
  }

  private logError = (error: Error, errorInfo: ErrorInfo, componentName: string) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      component: componentName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Error Boundary Triggered - logging essential info only
    console.error(`Error in ${componentName}:`, error.message)

    // Guardar en localStorage para debugging
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      errors.push(errorData)
      // Mantener solo los últimos 10 errores
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10)
      }
      localStorage.setItem('app_errors', JSON.stringify(errors))
    } catch (e) {
      console.warn('Failed to save error to localStorage:', e)
    }
  }

  private reportError = (_error: Error, _errorInfo: ErrorInfo, _componentName: string) => {
    // Aquí se integraría con servicios como Sentry, LogRocket, etc.
    // Por ahora solo enviamos a console en desarrollo
    if (process.env.NODE_ENV === 'development') {
      // Error reportado en desarrollo
    }
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      console.warn('Max retries reached for error boundary')
      return
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }))
  }

  private getErrorLevel = () => {
    const { level = 'component' } = this.props
    
    const levels = {
      page: { color: 'destructive', icon: AlertTriangle, title: 'Error de Página' },
      section: { color: 'warning', icon: Bug, title: 'Error de Sección' },
      component: { color: 'secondary', icon: AlertTriangle, title: 'Error de Componente' }
    }

    return levels[level] || levels.component
  }

  render() {
    const { children, fallback, level = 'component', name, enableRetry = true, showDetails = false } = this.props
    const { hasError, error, errorInfo, retryCount, showDetails: stateShowDetails } = this.state

    if (hasError && error) {
      // Si hay un fallback personalizado, usarlo
      if (fallback) {
        return fallback(error, errorInfo!, this.handleRetry)
      }

      const errorLevel = this.getErrorLevel()
      const Icon = errorLevel.icon
      const canRetry = enableRetry && retryCount < (this.props.maxRetries || 3)

      return (
        <div className="flex items-center justify-center min-h-[200px] p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-destructive" />
                <div className="flex-1">
                  <CardTitle className="text-lg">{errorLevel.title}</CardTitle>
                  <CardDescription>
                    {name ? `Error en ${name}` : 'Ha ocurrido un error inesperado'}
                  </CardDescription>
                </div>
                <Badge variant={errorLevel.color as any}>
                  {level.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Mensaje de error */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error.message || 'Error desconocido'}
                </AlertDescription>
              </Alert>

              {/* Información adicional */}
              {retryCount > 0 && (
                <Alert>
                  <AlertDescription>
                    Intentos de recuperación: {retryCount}/{this.props.maxRetries || 3}
                  </AlertDescription>
                </Alert>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </Button>
                )}
                
                <Button variant="outline" onClick={this.handleReload} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Recargar Página
                </Button>

                {level === 'page' && (
                  <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                    <Home className="h-4 w-4" />
                    Ir al Inicio
                  </Button>
                )}

                {(showDetails || process.env.NODE_ENV === 'development') && (
                  <Button 
                    variant="ghost" 
                    onClick={this.toggleDetails}
                    className="gap-2"
                  >
                    {stateShowDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {stateShowDetails ? 'Ocultar' : 'Mostrar'} Detalles
                  </Button>
                )}
              </div>

              {/* Detalles técnicos */}
              {stateShowDetails && errorInfo && (
                <div className="space-y-3">
                  <div className="border rounded-lg p-3 bg-muted/50">
                    <h4 className="font-medium text-sm mb-2">Stack Trace:</h4>
                    <pre className="text-xs overflow-auto max-h-32 text-muted-foreground">
                      {error.stack}
                    </pre>
                  </div>

                  <div className="border rounded-lg p-3 bg-muted/50">
                    <h4 className="font-medium text-sm mb-2">Component Stack:</h4>
                    <pre className="text-xs overflow-auto max-h-32 text-muted-foreground">
                      {errorInfo.componentStack}
                    </pre>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p><strong>URL:</strong> {window.location.href}</p>
                    <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                    <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary