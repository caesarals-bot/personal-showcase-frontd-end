export interface ProjectImage {
  url: string
  alt: string
  title?: string
}

export interface Project {
  id: string
  title: string
  description: string
  images: ProjectImage[]
  technologies: string[]
  demoUrl?: string
  githubUrl?: string
  featured?: boolean
  category: 'web' | 'mobile' | 'desktop' | 'other'
}

export interface ProjectCardProps {
  project: Project
  className?: string
}