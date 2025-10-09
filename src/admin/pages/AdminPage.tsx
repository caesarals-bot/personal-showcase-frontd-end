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
import type { DashboardStats as DashboardStatsType } from '@/types/admin.types'
import type { BlogPost } from '@/types/blog.types'

// Mock data temporal (luego conectaremos con Firebase)
const mockStats: DashboardStatsType = {
  totalPosts: 12,
  publishedPosts: 8,
  draftPosts: 4,
  totalViews: 1250,
  totalLikes: 145,
  totalComments: 32,
  totalUsers: 5,
  activeUsers: 3,
  recentPosts: [],
  topPosts: [],
  categoriesStats: [
    { id: '1', name: 'React', postsCount: 5, color: '#06B6D4' },
    { id: '2', name: 'JavaScript', postsCount: 3, color: '#F59E0B' },
    { id: '3', name: 'TypeScript', postsCount: 2, color: '#3178C6' },
    { id: '4', name: 'Firebase', postsCount: 2, color: '#FFCA28' }
  ],
  tagsStats: []
}

const mockRecentPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Introducción a React 19',
    slug: 'introduccion-react-19',
    excerpt: 'Descubre las nuevas características...',
    content: '',
    author: { id: '1', name: 'Admin' },
    publishedAt: new Date().toISOString(),
    readingTime: 5,
    category: { id: '1', name: 'React', slug: 'react', color: '#06B6D4' },
    tags: [],
    isPublished: true,
    isFeatured: true,
    likes: 45,
    views: 320,
    commentsCount: 8
  },
  {
    id: '2',
    title: 'TypeScript Tips & Tricks',
    slug: 'typescript-tips-tricks',
    excerpt: 'Mejora tu código TypeScript...',
    content: '',
    author: { id: '1', name: 'Admin' },
    publishedAt: new Date().toISOString(),
    readingTime: 7,
    category: { id: '3', name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
    tags: [],
    isPublished: true,
    isFeatured: false,
    likes: 32,
    views: 210,
    commentsCount: 5
  }
]

const AdminPage = () => {
  const [stats, setStats] = useState<DashboardStatsType>(mockStats)
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>(mockRecentPosts)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // TODO: Cargar datos reales desde Firebase
    // Por ahora usamos mock data
  }, [])

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
