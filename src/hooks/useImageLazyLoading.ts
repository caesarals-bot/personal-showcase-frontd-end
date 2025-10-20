/**
 * Hook personalizado para lazy loading de imágenes
 * 
 * Características:
 * - Intersection Observer API
 * - Preload de imágenes críticas
 * - Cache de imágenes cargadas
 * - Soporte para WebP con fallback
 * - Gestión de errores
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseImageLazyLoadingOptions {
  /** Habilitar lazy loading */
  lazy?: boolean
  /** Margen antes de cargar la imagen */
  rootMargin?: string
  /** Threshold para activar la carga */
  threshold?: number
  /** Precargar imagen crítica */
  preload?: boolean
  /** Formato preferido */
  format?: 'webp' | 'auto'
}

interface UseImageLazyLoadingReturn {
  /** Referencia para el elemento */
  ref: React.RefObject<HTMLElement | null>
  /** Si la imagen está en vista */
  isInView: boolean
  /** Si la imagen está cargando */
  isLoading: boolean
  /** Si hubo error al cargar */
  hasError: boolean
  /** URL de la imagen a cargar */
  src: string
  /** Función para forzar la carga */
  load: () => void
  /** Función para reintentar la carga */
  retry: () => void
}

// Cache global de imágenes cargadas
const imageCache = new Set<string>()

// Cache de promesas de carga para evitar duplicados
const loadingPromises = new Map<string, Promise<void>>()

/**
 * Precargar una imagen
 */
function preloadImage(src: string): Promise<void> {
  if (imageCache.has(src)) {
    return Promise.resolve()
  }

  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!
  }

  const promise = new Promise<void>((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      imageCache.add(src)
      loadingPromises.delete(src)
      resolve()
    }
    
    img.onerror = () => {
      loadingPromises.delete(src)
      reject(new Error(`Failed to load image: ${src}`))
    }
    
    img.src = src
  })

  loadingPromises.set(src, promise)
  return promise
}

/**
 * Generar URL WebP si es compatible
 */
function getOptimizedSrc(originalSrc: string, format: 'webp' | 'auto' = 'auto'): string {
  if (format === 'auto') {
    // Detectar soporte WebP
    const supportsWebP = (() => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    })()

    if (supportsWebP && !originalSrc.includes('.webp')) {
      // Intentar generar URL WebP para Firebase Storage
      if (originalSrc.includes('firebasestorage.googleapis.com')) {
        const url = new URL(originalSrc)
        url.searchParams.set('fm', 'webp')
        return url.toString()
      }
      
      // Para otras URLs, intentar reemplazar extensión
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    }
  }

  return originalSrc
}

export function useImageLazyLoading(
  originalSrc: string,
  options: UseImageLazyLoadingOptions = {}
): UseImageLazyLoadingReturn {
  const {
    lazy = true,
    rootMargin = '50px',
    threshold = 0.1,
    preload = false,
    format = 'auto'
  } = options

  const [isInView, setIsInView] = useState(!lazy || preload)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState('')

  const ref = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Generar URL optimizada
  const optimizedSrc = getOptimizedSrc(originalSrc, format)

  // Función para cargar la imagen
  const load = useCallback(async () => {
    if (!optimizedSrc || isLoading || loadedSrc === optimizedSrc) return

    setIsLoading(true)
    setHasError(false)

    try {
      await preloadImage(optimizedSrc)
      setLoadedSrc(optimizedSrc)
    } catch (error) {
      // Si falla la imagen optimizada, intentar con la original
      if (optimizedSrc !== originalSrc) {
        try {
          await preloadImage(originalSrc)
          setLoadedSrc(originalSrc)
        } catch (originalError) {
          setHasError(true)
          console.warn('Failed to load image:', originalError)
        }
      } else {
        setHasError(true)
        console.warn('Failed to load image:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [optimizedSrc, originalSrc, isLoading, loadedSrc])

  // Función para reintentar
  const retry = useCallback(() => {
    setHasError(false)
    setLoadedSrc('')
    load()
  }, [load])

  // Configurar Intersection Observer
  useEffect(() => {
    if (!lazy || preload) {
      setIsInView(true)
      return
    }

    if (!ref.current) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      {
        rootMargin,
        threshold
      }
    )

    observerRef.current.observe(ref.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [lazy, preload, rootMargin, threshold])

  // Cargar imagen cuando esté en vista
  useEffect(() => {
    if (isInView && !loadedSrc && !hasError) {
      load()
    }
  }, [isInView, loadedSrc, hasError, load])

  // Precargar si está marcado como crítico
  useEffect(() => {
    if (preload) {
      load()
    }
  }, [preload, load])

  return {
    ref,
    isInView,
    isLoading,
    hasError,
    src: loadedSrc,
    load,
    retry
  }
}

/**
 * Hook simplificado para lazy loading básico
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [options])

  return { ref, isInView }
}

export default useImageLazyLoading