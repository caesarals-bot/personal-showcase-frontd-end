/**
 * Skeleton para tarjetas de blog
 * Simula la estructura de BlogCard durante la carga
 */

import { Skeleton } from "@/components/ui/skeleton"

interface BlogCardSkeletonProps {
  /** Número de tarjetas skeleton a mostrar */
  count?: number
  /** Mostrar imagen skeleton */
  showImage?: boolean
}

export function BlogCardSkeleton({ 
  count = 1, 
  showImage = true 
}: BlogCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-md transition-all duration-300 hover:shadow-lg"
        >
          {/* Imagen skeleton */}
          {showImage && (
            <div className="relative aspect-video overflow-hidden">
              <Skeleton className="h-full w-full" />
            </div>
          )}

          {/* Contenido skeleton */}
          <div className="p-6">
            {/* Categoría y fecha */}
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Título */}
            <div className="mb-3 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>

            {/* Descripción */}
            <div className="mb-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Tags */}
            <div className="mb-4 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>

            {/* Footer con stats */}
            <div className="flex items-center justify-between border-t border-border/20 pt-4">
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
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Overlay de carga */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      ))}
    </>
  )
}