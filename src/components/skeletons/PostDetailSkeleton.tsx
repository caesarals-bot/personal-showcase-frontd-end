/**
 * Skeleton para página de detalle de post
 * Simula la estructura completa de PostDetailPage durante la carga
 */

import { Skeleton } from "@/components/ui/skeleton"

export function PostDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header skeleton */}
        <div className="mb-8 text-center">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center justify-center space-x-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Título */}
          <div className="mb-4 space-y-2">
            <Skeleton className="mx-auto h-8 w-3/4 md:h-10" />
            <Skeleton className="mx-auto h-8 w-1/2 md:h-10" />
          </div>

          {/* Metadatos */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-6 w-18" />
          </div>
        </div>

        {/* Imagen principal skeleton */}
        <div className="mx-auto mb-8 max-w-2xl">
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>

        {/* Contenido principal */}
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Contenido del artículo */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Párrafos de contenido */}
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    {i % 3 === 0 && <Skeleton className="h-32 w-full rounded-lg" />}
                  </div>
                ))}

                {/* Código skeleton */}
                <div className="my-6">
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>

                {/* Más párrafos */}
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Tabla de contenidos */}
                <div className="rounded-lg border border-border/50 bg-card/80 p-4">
                  <Skeleton className="mb-3 h-5 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="ml-4 h-4 w-5/6" />
                    <Skeleton className="ml-8 h-4 w-4/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="ml-4 h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>

                {/* Stats */}
                <div className="rounded-lg border border-border/50 bg-card/80 p-4">
                  <Skeleton className="mb-3 h-5 w-24" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-18" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de comentarios skeleton */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="rounded-lg border border-border/50 bg-card/80 p-6">
            <Skeleton className="mb-6 h-6 w-32" />
            
            {/* Comentarios */}
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="mb-6 border-b border-border/20 pb-6 last:border-b-0">
                <div className="mb-3 flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}