/**
 * Skeleton para tarjetas de proyecto
 * Simula la estructura de ProjectCard durante la carga
 */

import { Skeleton } from "@/components/ui/skeleton"

interface ProjectCardSkeletonProps {
  /** Número de tarjetas skeleton a mostrar */
  count?: number
  /** Variante del layout */
  variant?: 'grid' | 'list'
}

export function ProjectCardSkeleton({ 
  count = 1, 
  variant = 'grid' 
}: ProjectCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`group relative overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-md transition-all duration-300 hover:shadow-lg ${
            variant === 'list' ? 'flex' : ''
          }`}
        >
          {/* Imagen skeleton */}
          <div className={`relative overflow-hidden ${
            variant === 'list' ? 'w-1/3' : 'aspect-video'
          }`}>
            <Skeleton className="h-full w-full" />
            
            {/* Badge de estado */}
            <div className="absolute right-3 top-3">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>

          {/* Contenido skeleton */}
          <div className={`p-6 ${variant === 'list' ? 'flex-1' : ''}`}>
            {/* Header con título y tipo */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>

            {/* Descripción */}
            <div className="mb-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Tecnologías */}
            <div className="mb-4">
              <Skeleton className="mb-2 h-4 w-24" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
                <Skeleton className="h-6 w-18" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>

            {/* Características */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>

            {/* Footer con botones y stats */}
            <div className="flex items-center justify-between border-t border-border/20 pt-4">
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-16" />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Overlay de carga animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
      ))}
    </>
  )
}