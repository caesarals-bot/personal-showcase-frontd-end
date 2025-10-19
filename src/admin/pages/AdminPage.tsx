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
import ProjectsOverview from '../components/ProjectsOverview'
import type { DashboardStats as DashboardStatsType, Project } from '@/types/admin.types'
import type { BlogPost } from '@/types/blog.types'
import { getPosts } from '@/services/postService'
import { getCategories } from '@/services/categoryService'
import { getUsers } from '@/services/userService'
import { getProjects } from '@/services/projectService'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'

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
  tagsStats: [],
  // Métricas de proyectos
  totalProjects: 0,
  featuredProjects: 0,
  completedProjects: 0,
  inProgressProjects: 0,
  plannedProjects: 0,
  totalTechnologies: 0,
  recentProjects: [],
  technologiesStats: []
}

const AdminPage = () => {
  const [stats, setStats] = useState<DashboardStatsType>(initialStats)
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Cargar datos en paralelo
      const [posts, categories, users, projects] = await Promise.all([
        getPosts(),
        getCategories(),
        getUsers(),
        getProjects()
      ])

      // Calcular estadísticas básicas
      const publishedPosts = posts.filter(p => p.status === 'published')
      const draftPosts = posts.filter(p => p.status === 'draft')
      const activeUsers = users.filter(u => u.isActive).length

      // Calcular vistas totales desde los posts
      const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0)

      // Calcular likes totales desde Firestore interactions
      let totalLikes = 0
      let totalComments = 0
      
      const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true'
      
      if (USE_FIREBASE) {
        try {
          // Contar likes desde interactions
          const likesQuery = query(
            collection(db, 'interactions'),
            where('type', '==', 'like')
          )
          const likesSnapshot = await getDocs(likesQuery)
          totalLikes = likesSnapshot.size

          // Contar comentarios desde interactions
          const commentsQuery = query(
            collection(db, 'interactions'),
            where('type', '==', 'comment')
          )
          const commentsSnapshot = await getDocs(commentsQuery)
          totalComments = commentsSnapshot.size
        } catch (error) {
          console.error('Error al obtener estadísticas de Firestore:', error)
          // Fallback: usar datos de los posts
          totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0)
          totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0)
        }
      } else {
        // Modo local: usar datos de los posts
        totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0)
        totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0)
      }

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

      // Calcular métricas de proyectos
      const completedProjects = projects.filter(p => p.status === 'completed')
      const inProgressProjects = projects.filter(p => p.status === 'in-progress')
      const plannedProjects = projects.filter(p => p.status === 'planned')
      const featuredProjects = projects.filter(p => p.featured)

      // Proyectos recientes (últimos 5)
      const recentProjectsList = [...projects]
        .sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
          return dateB - dateA
        })
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          technologies: p.technologies || [],
          featured: p.featured,
          updatedAt: p.updatedAt || new Date().toISOString()
        }))

      // Estadísticas de tecnologías
      const allTechnologies = projects.flatMap(p => p.technologies || [])
      const technologiesCount = new Map<string, number>()
      allTechnologies.forEach(tech => {
        technologiesCount.set(tech, (technologiesCount.get(tech) || 0) + 1)
      })
      
      const technologiesStats = Array.from(technologiesCount.entries())
        .map(([name, projectsCount]) => ({ name, projectsCount }))
        .sort((a, b) => b.projectsCount - a.projectsCount)

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
        tagsStats: [],
        // Métricas de proyectos
        totalProjects: projects.length,
        featuredProjects: featuredProjects.length,
        completedProjects: completedProjects.length,
        inProgressProjects: inProgressProjects.length,
        plannedProjects: plannedProjects.length,
        totalTechnologies: technologiesCount.size,
        recentProjects: recentProjectsList,
        technologiesStats
      })

      setRecentPosts(recent)
      setRecentProjects(projects.slice(0, 5))
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Posts recientes */}
        <RecentPosts posts={recentPosts} isLoading={isLoading} />

        {/* Proyectos recientes */}
        <ProjectsOverview projects={recentProjects} isLoading={isLoading} />

        {/* Categorías */}
        <CategoriesOverview stats={stats.categoriesStats} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default AdminPage
