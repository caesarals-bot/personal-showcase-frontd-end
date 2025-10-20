import { useState, useEffect } from 'react'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types/portfolio'
import type { Project as AdminProject } from '@/types/admin.types'
import { getProjects } from '@/services/projectService'
import { ProjectCardSkeleton } from '@/components/skeletons'

// Función para convertir proyecto de admin a formato portfolio
const convertAdminProjectToPortfolio = (adminProject: AdminProject): Project => {
  const converted = {
    id: adminProject.id,
    slug: adminProject.slug,
    title: adminProject.title,
    description: adminProject.description,
    longDescription: adminProject.fullDescription,
    images: adminProject.images.map((url, index) => ({
      url,
      alt: `${adminProject.title} - Imagen ${index + 1}`,
      title: `Vista ${index + 1}`
    })),
    technologies: adminProject.technologies,
    demoUrl: adminProject.links.demo || adminProject.links.live,
    githubUrl: adminProject.links.github,
    featured: adminProject.featured,
    category: adminProject.category.toLowerCase() as 'web' | 'mobile' | 'desktop' | 'other',
    status: adminProject.status,
    startDate: adminProject.startDate,
    endDate: adminProject.endDate,
    collaborators: adminProject.collaborators
  }
  
  return converted
}

export function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        const allProjects = await getProjects()
        
        // Filtrar solo proyectos completados y convertir al formato portfolio
        const completedProjects = allProjects
          .filter(project => project.status === 'completed')
          .map(convertAdminProjectToPortfolio)
          .sort((a, b) => {
            // Priorizar proyectos destacados
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            return 0
          })
        
        setProjects(completedProjects)
      } catch (err) {
        console.error('Error al cargar proyectos:', err)
        setError('Error al cargar los proyectos')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  if (loading) {
    return (
      <section className="container mx-auto py-12">
        <h2 className="oswald mb-8 text-center text-4xl font-bold tracking-tight">
          Mis Proyectos
        </h2>
        {/* En desktop: un proyecto por pantalla */}
        <div className="hidden md:flex flex-col gap-8">
          <ProjectCardSkeleton count={3} variant="list" />
        </div>
        {/* En móvil: cards verticales */}
        <div className="md:hidden flex flex-col gap-6 px-4">
          <ProjectCardSkeleton count={3} variant="grid" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container mx-auto py-12">
        <h2 className="oswald mb-8 text-center text-4xl font-bold tracking-tight">
          Mis Proyectos
        </h2>
        <div className="text-center py-20">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </section>
    )
  }

  if (projects.length === 0) {
    return (
      <section className="container mx-auto py-12">
        <h2 className="oswald mb-8 text-center text-4xl font-bold tracking-tight">
          Mis Proyectos
        </h2>
        <div className="text-center py-20">
          <p className="text-muted-foreground">No hay proyectos completados para mostrar.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto py-12">
      <h2 className="oswald mb-8 text-center text-4xl font-bold tracking-tight">
        Mis Proyectos
      </h2>
      {/* En desktop: un proyecto por pantalla */}
      <div className="hidden md:flex flex-col gap-8">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project}
            className="w-full max-w-5xl mx-auto flex-row items-stretch overflow-hidden"
          />
        ))}
      </div>
      {/* En móvil: cards verticales con márgenes */}
      <div className="md:hidden flex flex-col gap-6 px-4">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project}
          />
        ))}
      </div>
    </section>
  )
}