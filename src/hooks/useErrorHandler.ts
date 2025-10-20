/**
 * useErrorHandler - Hook para manejo de errores asíncronos y de estado
 * 
 * Características:
 * - Captura errores asíncronos
 * - Manejo de errores de API
 * - Retry automático
 * - Notificaciones de error
 * - Logging centralizado
 * - Recovery strategies
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'

export interface ErrorInfo {
  message: string
  code?: string | number
  stack?: string
  context?: Record<string, any>
  timestamp: Date
  retryCount: number
}

export interface ErrorHandlerOptions {
  /** Mostrar toast de error automáticamente */
  showToast?: boolean
  /** Mensaje personalizado para el toast */
  toastMessage?: string
  /** Habilitar retry automático */
  enableRetry?: boolean
  /** Número máximo de reintentos */
  maxRetries?: number
  /** Delay entre reintentos (ms) */
  retryDelay?: number
  /** Función de retry personalizada */
  onRetry?: () => Promise<void> | void
  /** Callback cuando ocurre un error */
  onError?: (error: ErrorInfo) => void
  /** Contexto adicional para logging */
  context?: Record<string, any>
}

export interface UseErrorHandlerReturn {
  /** Error actual */
  error: ErrorInfo | null
  /** Si hay un error activo */
  hasError: boolean
  /** Si está en proceso de retry */
  isRetrying: boolean
  /** Limpiar error */
  clearError: () => void
  /** Manejar error */
  handleError: (error: Error | string, options?: Partial<ErrorHandlerOptions>) => void
  /** Wrapper para funciones asíncronas */
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options?: Partial<ErrorHandlerOptions>
  ) => (...args: T) => Promise<R | null>
  /** Reintentar última operación */
  retry: () => Promise<void>
  /** Historial de errores */
  errorHistory: ErrorInfo[]
}

export const useErrorHandler = (
  defaultOptions: ErrorHandlerOptions = {}
): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [errorHistory, setErrorHistory] = useState<ErrorInfo[]>([])
  
  const retryFunctionRef = useRef<(() => Promise<void>) | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  const logError = useCallback((errorInfo: ErrorInfo) => {
    // Error Handler - logging essential info only
    console.error(`Error Handler: ${errorInfo.message}`)

    // Guardar en localStorage para debugging
    try {
      const errors = JSON.parse(localStorage.getItem('async_errors') || '[]')
      errors.push(errorInfo)
      // Mantener solo los últimos 20 errores
      if (errors.length > 20) {
        errors.splice(0, errors.length - 20)
      }
      localStorage.setItem('async_errors', JSON.stringify(errors))
    } catch (e) {
      console.warn('Failed to save error to localStorage:', e)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
    setIsRetrying(false)
    retryFunctionRef.current = null
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  const createErrorInfo = useCallback((
    error: Error | string,
    options: Partial<ErrorHandlerOptions> = {},
    retryCount = 0
  ): ErrorInfo => {
    const message = typeof error === 'string' ? error : error.message
    const stack = typeof error === 'object' ? error.stack : undefined
    
    return {
      message,
      stack,
      context: { ...defaultOptions.context, ...options.context },
      timestamp: new Date(),
      retryCount
    }
  }, [defaultOptions.context])

  const showErrorToast = useCallback((errorInfo: ErrorInfo, customMessage?: string) => {
    const message = customMessage || errorInfo.message || 'Ha ocurrido un error'
    
    toast.error(message, {
      description: errorInfo.retryCount > 0 
        ? `Intento ${errorInfo.retryCount + 1}` 
        : undefined,
      action: errorInfo.retryCount < (defaultOptions.maxRetries || 3) ? {
        label: 'Reintentar',
        onClick: () => retry()
      } : undefined
    })
  }, [defaultOptions.maxRetries])

  const handleError = useCallback((
    error: Error | string,
    options: Partial<ErrorHandlerOptions> = {}
  ) => {
    const mergedOptions = { ...defaultOptions, ...options }
    const currentError = error instanceof Error ? error : new Error(error)
    const errorInfo = createErrorInfo(currentError, mergedOptions)

    setError(errorInfo)
    setErrorHistory(prev => [...prev, errorInfo])
    
    // Log del error
    logError(errorInfo)

    // Mostrar toast si está habilitado
    if (mergedOptions.showToast !== false) {
      showErrorToast(errorInfo, mergedOptions.toastMessage)
    }

    // Callback personalizado
    mergedOptions.onError?.(errorInfo)

    // Configurar retry si está habilitado
    if (mergedOptions.enableRetry && mergedOptions.onRetry) {
      retryFunctionRef.current = async () => {
        const result = mergedOptions.onRetry!()
        if (result instanceof Promise) {
          await result
        }
      }
    }
  }, [defaultOptions, createErrorInfo, logError, showErrorToast])

  const retry = useCallback(async () => {
    if (!retryFunctionRef.current || !error) return

    const maxRetries = defaultOptions.maxRetries || 3
    if (error.retryCount >= maxRetries) {
      toast.error('Máximo número de reintentos alcanzado')
      return
    }

    setIsRetrying(true)

    try {
      const delay = defaultOptions.retryDelay || 1000 * Math.pow(2, error.retryCount) // Exponential backoff
      
      await new Promise(resolve => {
        retryTimeoutRef.current = setTimeout(resolve, delay)
      })

      await retryFunctionRef.current()
      
      // Si llegamos aquí, el retry fue exitoso
      clearError()
      toast.success('Operación completada exitosamente')
      
    } catch (retryError) {
      const newErrorInfo = createErrorInfo(
        retryError as Error,
        defaultOptions,
        error.retryCount + 1
      )
      
      setError(newErrorInfo)
      setErrorHistory(prev => [...prev, newErrorInfo])
      logError(newErrorInfo)
      
      if (newErrorInfo.retryCount < maxRetries) {
        showErrorToast(newErrorInfo, 'Error en reintento')
      } else {
        toast.error('No se pudo completar la operación después de varios intentos')
      }
    } finally {
      setIsRetrying(false)
    }
  }, [error, defaultOptions, createErrorInfo, logError, showErrorToast, clearError])

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: Partial<ErrorHandlerOptions> = {}
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        const result = await fn(...args)
        // Limpiar error si la operación fue exitosa
        if (error) {
          clearError()
        }
        return result
      } catch (err) {
        const mergedOptions = { 
          ...defaultOptions, 
          ...options,
          onRetry: async () => {
            await fn(...args)
          }
        }
        
        handleError(err as Error, mergedOptions)
        return null
      }
    }
  }, [error, defaultOptions, handleError, clearError])

  return {
    error,
    hasError: !!error,
    isRetrying,
    clearError,
    handleError,
    withErrorHandling,
    retry,
    errorHistory
  }
}

// Hook específico para errores de API
export const useApiErrorHandler = (baseUrl?: string) => {
  return useErrorHandler({
    showToast: true,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    context: { type: 'api', baseUrl }
  })
}

// Hook específico para errores de formularios
export const useFormErrorHandler = () => {
  return useErrorHandler({
    showToast: true,
    enableRetry: false,
    context: { type: 'form' }
  })
}

// Hook específico para errores de carga de datos
export const useDataErrorHandler = () => {
  return useErrorHandler({
    showToast: true,
    enableRetry: true,
    maxRetries: 2,
    retryDelay: 2000,
    context: { type: 'data' }
  })
}