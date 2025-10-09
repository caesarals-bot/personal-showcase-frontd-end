/**
 * CategoriesOverview - Vista general de categorías en el dashboard
 * 
 * Muestra:
 * - Lista de categorías con su color
 * - Número de posts por categoría
 * - Gráfico visual de distribución
 */

import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderOpen } from 'lucide-react'
import type { DashboardStats } from '@/types/admin.types'

interface CategoriesOverviewProps {
  stats: DashboardStats['categoriesStats']
  isLoading?: boolean
}

export default function CategoriesOverview({ stats, isLoading }: CategoriesOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 w-12 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay categorías aún</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/admin/categories">Crear categoría</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalPosts = stats.reduce((sum, cat) => sum + cat.postsCount, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categorías</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/categories">Gestionar</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.map((category) => {
            const percentage = totalPosts > 0 ? (category.postsCount / totalPosts) * 100 : 0

            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="h-8 w-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                    <span className="font-medium text-sm">{category.name}</span>
                  </div>
                  <Badge variant="secondary">{category.postsCount} posts</Badge>
                </div>
                {/* Barra de progreso */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
