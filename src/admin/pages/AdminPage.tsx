/**
 * AdminPage - Dashboard principal del panel de administración
 * 
 * Muestra:
 * - Estadísticas generales
 * - Posts recientes
 * - Categorías con distribución
 * - Tags populares
 */

import { useState, useEffect } from 'react'
import DashboardStats from '../components/DashboardStats'
import RecentPosts from '../components/RecentPosts'
import CategoriesOverview from '../components/CategoriesOverview'
import PendingApproval from '../components/PendingApproval'
import type { DashboardStats as DashboardStatsType } from '@/types/admin.types'
import type { BlogPost } from '@/types/blog.types'
import { getPosts } from '@/services/postService'
import { getCategories } from '@/services/categoryService'
import { getUsers } from '@/services/userService'

// Stats iniciales vacíos
const initialStats: DashboardStatsType = {
  totalPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  totalUsers: 0,
  activeUsers: 0,
  recentPosts: [],
  topPosts: [],
  categoriesStats: [],
  tagsStats: []
}

const AdminPage = () => {
  const [stats, setStats] = useState<DashboardStatsType>(initialStats)
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Cargar datos en paralelo
      const [posts, categories, users] = await Promise.all([
        getPosts(),
        getCategories(),
        getUsers()
      ])

      // Calcular estadísticas
      const publishedPosts = posts.filter(p => p.status === 'published')
      const draftPosts = posts.filter(p => p.status === 'draft')
      const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0)
      const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0)
      const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0)
      const activeUsers = users.filter(u => u.isActive).length

      // Posts recientes (últimos 5)
      const recent = [...posts]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 5)

      // Estadísticas de categorías
      const categoriesStats = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        postsCount: posts.filter(p => p.category.id === cat.id).length,
        color: cat.color
      })).filter(stat => stat.postsCount > 0)

      setStats({
        totalPosts: posts.length,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalViews,
        totalLikes,
        totalComments,
        totalUsers: users.length,
        activeUsers,
        recentPosts: recent,
        topPosts: [],
        categoriesStats,
        tagsStats: []
      })

      setRecentPosts(recent)
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bienvenido al panel de administración. Aquí puedes gestionar todo tu contenido.
        </p>
      </div>

      {/* Estadísticas */}
      <DashboardStats stats={stats} isLoading={isLoading} />

      {/* Posts Pendientes de Aprobación */}
      <PendingApproval />

      {/* Grid de contenido */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Posts recientes */}
        <RecentPosts posts={recentPosts} isLoading={isLoading} />

        {/* Categorías */}
        <CategoriesOverview stats={stats.categoriesStats} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default AdminPage
