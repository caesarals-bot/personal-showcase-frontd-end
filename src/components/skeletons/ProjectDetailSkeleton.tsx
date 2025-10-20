/**
 * Skeleton para página de detalle de proyecto
 * Simula la estructura completa de ProjectDetailPage durante la carga
 */

import { Skeleton } from "@/components/ui/skeleton"

export function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Botón volver */}
        <div className="mb-8">
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Header del proyecto */}
        <div className="mb-12 text-center">
          {/* Título */}
          <div className="mb-4 space-y-2">
            <Skeleton className="mx-auto h-10 w-3/4 md:h-12" />
            <Skeleton className="mx-auto h-10 w-1/2 md:h-12" />
          </div>

          {/* Descripción */}
          <div className="mb-6 space-y-2">
            <Skeleton className="mx-auto h-5 w-5/6" />
            <Skeleton className="mx-auto h-5 w-4/6" />
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
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mb-8 flex justify-center gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>

          {/* Estado y categoría */}
          <div className="flex justify-center gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        {/* Carousel de imágenes */}
        <div className="mb-12">
          <Skeleton className="aspect-video w-full rounded-lg" />
          
          {/* Thumbnails */}
          <div className="mt-4 flex justify-center gap-2">
            <Skeleton className="h-16 w-16 rounded" />
            <Skeleton className="h-16 w-16 rounded" />
            <Skeleton className="h-16 w-16 rounded" />
            <Skeleton className="h-16 w-16 rounded" />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="mb-6 flex justify-center">
            <div className="flex space-x-1 rounded-lg bg-muted p-1">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>

          {/* Contenido de tabs */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Contenido principal */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Descripción detallada */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>

                {/* Características */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-36" />
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-52" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-44" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-56" />
                    </div>
                  </div>
                </div>

                {/* Desafíos */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-28" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Información del proyecto */}
                <div className="rounded-lg border border-border/50 bg-card/80 p-6">
                  <Skeleton className="mb-4 h-5 w-32" />
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-18" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </div>

                {/* Tecnologías */}
                <div className="rounded-lg border border-border/50 bg-card/80 p-6">
                  <Skeleton className="mb-4 h-5 w-28" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                    <Skeleton className="h-6 w-18" />
                    <Skeleton className="h-6 w-22" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>

                {/* Colaboradores */}
                <div className="rounded-lg border border-border/50 bg-card/80 p-6">
                  <Skeleton className="mb-4 h-5 w-32" />
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}