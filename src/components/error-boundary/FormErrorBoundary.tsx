/**
 * FormErrorBoundary - Error Boundary específico para formularios
 * 
 * Características:
 * - Manejo de errores de formularios
 * - Preservación de datos del formulario
 * - UI de recuperación específica
 * - Validación de errores
 * - Logging de errores de formulario
 */

import React from 'react'
import { AlertTriangle, RefreshCw, Save } from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FormErrorBoundaryProps {
  children: React.ReactNode
  /** Nombre del formulario para logging */
  formName?: string
  /** Datos del formulario para preservar */
  formData?: Record<string, any>
  /** Callback para guardar datos del formulario */
  onSaveFormData?: (data: Record<string, any>) => void
  /** Callback para restaurar datos del formulario */
  onRestoreFormData?: () => Record<string, any> | null
}

const FormErrorFallback: React.FC<{
  error: Error
  retry: () => void
  formName?: string
  formData?: Record<string, any>
  onSaveFormData?: (data: Record<string, any>) => void
  onRestoreFormData?: () => Record<string, any> | null
}> = ({ 
  error, 
  retry, 
  formName, 
  formData, 
  onSaveFormData, 
  onRestoreFormData 
}) => {
  const [dataSaved, setDataSaved] = React.useState(false)

  const handleSaveData = () => {
    if (formData && onSaveFormData) {
      try {
        onSaveFormData(formData)
        setDataSaved(true)
        
        // También guardar en localStorage como backup
        localStorage.setItem(`form_backup_${formName || 'unknown'}`, JSON.stringify({
          data: formData,
          timestamp: new Date().toISOString(),
          error: error.message
        }))
      } catch (e) {
        console.error('Failed to save form data:', e)
      }
    }
  }

  const handleRestoreAndRetry = () => {
    if (onRestoreFormData) {
      try {
        const restoredData = onRestoreFormData()
        if (restoredData) {
          console.log('Form data restored:', restoredData)
        }
      } catch (e) {
        console.error('Failed to restore form data:', e)
      }
    }
    retry()
  }

  const hasFormData = formData && Object.keys(formData).length > 0

  return (
    <div className="flex items-center justify-center min-h-[300px] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <CardTitle className="text-lg">Error en Formulario</CardTitle>
              <CardDescription>
                {formName ? `Error en ${formName}` : 'Ha ocurrido un error en el formulario'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Mensaje de error */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>

          {/* Información sobre datos del formulario */}
          {hasFormData && (
            <Alert>
              <AlertDescription>
                Se han detectado datos en el formulario. Puedes guardarlos antes de reintentar.
              </AlertDescription>
            </Alert>
          )}

          {/* Estado de guardado */}
          {dataSaved && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                ✅ Datos del formulario guardados exitosamente
              </AlertDescription>
            </Alert>
          )}

          {/* Acciones */}
          <div className="space-y-2">
            {hasFormData && !dataSaved && (
              <Button 
                onClick={handleSaveData} 
                variant="outline" 
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar Datos del Formulario
              </Button>
            )}

            <Button onClick={handleRestoreAndRetry} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              {onRestoreFormData ? 'Restaurar y Reintentar' : 'Reintentar'}
            </Button>
          </div>

          {/* Información adicional */}
          <div className="text-xs text-muted-foreground text-center">
            <p>Los datos del formulario se guardan automáticamente para evitar pérdidas.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({ 
  children, 
  formName,
  formData,
  onSaveFormData,
  onRestoreFormData
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log específico para errores de formulario
    console.group('📝 Form Error Boundary')
    console.error('Form:', formName || 'Unknown Form')
    console.error('Form Data:', formData)
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.groupEnd()

    // Guardar error de formulario en localStorage
    try {
      const formErrors = JSON.parse(localStorage.getItem('form_errors') || '[]')
      formErrors.push({
        formName: formName || 'unknown',
        formData: formData || {},
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
      
      // Mantener solo los últimos 10 errores de formulario
      if (formErrors.length > 10) {
        formErrors.splice(0, formErrors.length - 10)
      }
      
      localStorage.setItem('form_errors', JSON.stringify(formErrors))
    } catch (e) {
      console.warn('Failed to save form error to localStorage:', e)
    }

    // Auto-guardar datos del formulario si están disponibles
    if (formData && Object.keys(formData).length > 0) {
      try {
        localStorage.setItem(`form_backup_${formName || 'unknown'}`, JSON.stringify({
          data: formData,
          timestamp: new Date().toISOString(),
          error: error.message
        }))
      } catch (e) {
        console.warn('Failed to auto-save form data:', e)
      }
    }
  }

  return (
    <ErrorBoundary
      level="component"
      name={formName ? `Form: ${formName}` : 'Form Component'}
      onError={handleError}
      fallback={(error, _errorInfo, retry) => (
        <FormErrorFallback 
          error={error} 
          retry={retry}
          formName={formName}
          formData={formData}
          onSaveFormData={onSaveFormData}
          onRestoreFormData={onRestoreFormData}
        />
      )}
      enableRetry={true}
      maxRetries={3}
    >
      {children}
    </ErrorBoundary>
  )
}

export default FormErrorBoundary