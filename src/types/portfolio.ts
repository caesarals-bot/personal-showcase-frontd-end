export interface ProjectImage {
  url: string
  alt: string
  title?: string
}

export interface ProjectCollaborator {
  id: string
  name: string
  role: string
  avatar?: string
  bio?: string
  specialties?: string[]
  socialLinks?: {
    platform: string
    url: string
  }[]
  contribution?: string
}

export interface Project {
  id: string
  slug: string
  title: string
  description: string
  longDescription?: string
  images: ProjectImage[]
  technologies: string[]
  demoUrl?: string
  githubUrl?: string
  featured?: boolean
  category: 'web' | 'mobile' | 'desktop' | 'other'
  // Información adicional para el modal detallado
  features?: string[]
  challenges?: string[]
  learnings?: string[]
  duration?: string
  status?: 'completed' | 'in-progress' | 'planned'
  collaborators?: ProjectCollaborator[]
  myRole?: string
  startDate?: string
  endDate?: string
  client?: string
  budget?: string
}

export interface ProjectCardProps {
  project: Project
  className?: string
}

export interface ProjectDetailModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export interface CollaboratorCardProps {
  collaborator: ProjectCollaborator
  className?: string
}

export interface ProjectCarouselProps {
  images: ProjectImage[]
  className?: string
  showThumbnails?: boolean
  autoPlay?: boolean
  isPaused?: boolean
}