/**
 * Error Boundary Components
 * 
 * Sistema completo de manejo de errores para React
 */

export { default as ErrorBoundary } from './ErrorBoundary'
export { default as RouteErrorBoundary } from './RouteErrorBoundary'
export { default as FormErrorBoundary } from './FormErrorBoundary'

// Re-export hooks relacionados
export { 
  useErrorHandler, 
  useApiErrorHandler, 
  useFormErrorHandler, 
  useDataErrorHandler 
} from '@/hooks/useErrorHandler'

// Tipos
export type { ErrorInfo, ErrorHandlerOptions, UseErrorHandlerReturn } from '@/hooks/useErrorHandler'