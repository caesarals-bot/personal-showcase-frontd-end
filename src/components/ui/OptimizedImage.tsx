/**
 * OptimizedImage - Componente de imagen optimizada
 * 
 * Características:
 * - Lazy loading automático
 * - Soporte WebP con fallback
 * - Placeholder mientras carga
 * - Manejo de errores
 * - Responsive automático
 * - Presets de optimización
 */

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> {
  /** URL de la imagen */
  src: string
  /** Texto alternativo */
  alt: string
  /** Ancho de la imagen */
  width?: number
  /** Alto de la imagen */
  height?: number
  /** Preset de optimización */
  preset?: 'avatar' | 'project' | 'blog' | 'thumbnail' | 'gallery'
  /** Habilitar lazy loading */
  lazy?: boolean
  /** Mostrar skeleton mientras carga */
  showSkeleton?: boolean
  /** Clase CSS personalizada */
  className?: string
  /** Callback cuando la imagen se carga */
  onLoad?: () => void
  /** Callback cuando hay error */
  onError?: () => void
  /** Placeholder personalizado */
  placeholder?: React.ReactNode
  /** Calidad de la imagen (0.1 - 1.0) */
  quality?: number
}

/**
 * Genera URL optimizada basada en el preset
 */
function getOptimizedUrl(src: string, preset?: string, quality?: number): string {
  // Si la imagen ya es WebP, la devolvemos tal como está
  if (src.includes('.webp')) {
    return src
  }

  // Para imágenes de Firebase Storage, podemos agregar parámetros de optimización
  if (src.includes('firebasestorage.googleapis.com')) {
    const url = new URL(src)
    
    // Agregar parámetros de optimización según el preset
    const presetConfig = {
      avatar: { w: 400, h: 400, q: quality || 80 },
      project: { w: 1200, h: 800, q: quality || 85 },
      blog: { w: 1000, h: 600, q: quality || 80 },
      thumbnail: { w: 300, h: 200, q: quality || 75 },
      gallery: { w: 1200, h: 800, q: quality || 85 }
    }

    const config = preset ? presetConfig[preset as keyof typeof presetConfig] : null
    
    if (config) {
      url.searchParams.set('w', config.w.toString())
      url.searchParams.set('h', config.h.toString())
      url.searchParams.set('q', config.q.toString())
      url.searchParams.set('fm', 'webp') // Forzar formato WebP
    }
    
    return url.toString()
  }

  // Para URLs de Unsplash, usar parámetros de optimización nativos
  if (src.includes('images.unsplash.com')) {
    const url = new URL(src)
    
    // Configurar parámetros según el preset
    const presetConfig = {
      avatar: { w: 400, h: 400, q: quality || 80 },
      project: { w: 1200, h: 800, q: quality || 85 },
      blog: { w: 1000, h: 600, q: quality || 80 },
      thumbnail: { w: 300, h: 200, q: quality || 75 },
      gallery: { w: 1200, h: 800, q: quality || 85 }
    }

    const config = preset ? presetConfig[preset as keyof typeof presetConfig] : null
    
    if (config) {
      url.searchParams.set('w', config.w.toString())
      url.searchParams.set('h', config.h.toString())
      url.searchParams.set('q', config.q.toString())
      url.searchParams.set('fm', 'webp') // Unsplash soporta WebP
      url.searchParams.set('fit', 'crop')
    }
    
    return url.toString()
  }

  // Para otras URLs externas, no intentar convertir a WebP
  // Solo devolver la URL original
  return src
}

/**
 * Hook para lazy loading
 */
function useLazyLoading(lazy: boolean = true) {
  const [isInView, setIsInView] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!lazy || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px' // Cargar 50px antes de que sea visible
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, isInView])

  return { isInView, imgRef }
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  preset = 'project',
  lazy = true,
  showSkeleton = true,
  className,
  onLoad,
  onError,
  placeholder,
  quality,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { isInView, imgRef } = useLazyLoading(lazy)

  // Generar URLs optimizadas
  const optimizedSrc = getOptimizedUrl(src, preset, quality)
  const fallbackSrc = src // URL original como fallback
  const [currentSrc, setCurrentSrc] = useState<string>(lazy ? '' : optimizedSrc)

  useEffect(() => {
    if (isInView && !currentSrc) {
      setCurrentSrc(optimizedSrc)
    }
  }, [isInView, optimizedSrc, currentSrc, lazy, alt])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    // Si falla la imagen WebP, intentar con la original
    if (currentSrc === optimizedSrc && optimizedSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      return
    }
    
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Calcular aspect ratio si se proporcionan width y height
  const aspectRatio = width && height ? `${width}/${height}` : undefined

  return (
    <div 
      className="relative overflow-hidden"
      style={{
        aspectRatio,
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined
      }}
    >
      {/* Skeleton/Placeholder mientras carga */}
      {(isLoading || !isInView) && showSkeleton && (
        <div className="absolute inset-0">
          {placeholder || (
            <Skeleton className="h-full w-full" />
          )}
        </div>
      )}

      {/* Imagen principal - SIEMPRE renderizada para que IntersectionObserver funcione */}
      <img
        ref={imgRef}
        src={currentSrc || optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError && 'hidden',
          className
        )}
        {...props}
      />

      {/* Estado de error */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
            {/* SVG Icon for No Image */}
            <svg
              className="mx-auto h-16 w-16 mb-3 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <p className="text-sm font-medium mb-1">Sin Imagen</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Próximamente</p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Componente de imagen con soporte para múltiples fuentes (WebP + fallback)
 */
export function PictureOptimized({
  src,
  alt,
  width,
  height,
  preset = 'project',
  lazy = true,
  className,
  quality,
  ...props
}: OptimizedImageProps) {
  const { isInView, imgRef } = useLazyLoading(lazy)
  const [isLoading, setIsLoading] = useState(true)

  const webpSrc = getOptimizedUrl(src, preset, quality)
  const fallbackSrc = src

  const handleLoad = () => {
    setIsLoading(false)
  }

  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={cn('relative overflow-hidden', className)}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined,
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined
        }}
      >
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
      
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          ref={imgRef}
          src={fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          {...props}
        />
      </picture>
    </div>
  )
}

export default OptimizedImage