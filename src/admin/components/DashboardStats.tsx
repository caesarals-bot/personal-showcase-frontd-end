/**
 * DashboardStats - Tarjetas de estadísticas del dashboard
 * 
 * Muestra métricas clave del blog:
 * - Total de posts
 * - Vistas totales
 * - Likes totales
 * - Usuarios activos
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Eye, Heart, Users, TrendingUp, TrendingDown, Briefcase, Star, CheckCircle, Code } from 'lucide-react'
import type { DashboardStats as DashboardStatsType } from '@/types/admin.types'

interface DashboardStatsProps {
  stats: DashboardStatsType
  isLoading?: boolean
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

function StatCard({ title, value, icon, trend, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
              {trend.value}%
            </span>
            <span>vs mes anterior</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Blog */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">📝 Blog</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={<FileText className="h-4 w-4" />}
            description={`${stats.publishedPosts} publicados, ${stats.draftPosts} borradores`}
          />
          <StatCard
            title="Vistas Totales"
            value={stats.totalViews}
            icon={<Eye className="h-4 w-4" />}
          />
          <StatCard
            title="Likes Totales"
            value={stats.totalLikes}
            icon={<Heart className="h-4 w-4" />}
          />
          <StatCard
            title="Usuarios Activos"
            value={stats.activeUsers}
            icon={<Users className="h-4 w-4" />}
            description={`${stats.totalUsers} usuarios totales`}
          />
        </div>
      </div>

      {/* Métricas de Proyectos */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">💼 Proyectos</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Proyectos"
            value={stats.totalProjects || 0}
            icon={<Briefcase className="h-4 w-4" />}
            description={`${stats.completedProjects || 0} completados, ${stats.inProgressProjects || 0} en progreso`}
          />
          <StatCard
            title="Proyectos Destacados"
            value={stats.featuredProjects || 0}
            icon={<Star className="h-4 w-4" />}
            description={`${stats.plannedProjects || 0} planeados`}
          />
          <StatCard
            title="Completados"
            value={stats.completedProjects || 0}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatCard
            title="Tecnologías"
            value={stats.totalTechnologies || 0}
            icon={<Code className="h-4 w-4" />}
            description="Tecnologías diferentes"
          />
        </div>
      </div>
    </div>
  )
}
