import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types/portfolio'

// Datos de ejemplo para pruebas
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Portfolio Personal',
    description: 'Portfolio personal con efectos 3D y animaciones avanzadas. Construido con React, TypeScript y Tailwind CSS.',
    images: [
      {
        url: 'https://picsum.photos/800/600?random=1',
        alt: 'Vista previa del portfolio',
        title: 'Página principal'
      },
      {
        url: 'https://picsum.photos/800/600?random=2',
        alt: 'Sección de proyectos',
        title: 'Proyectos'
      },
      {
        url: 'https://picsum.photos/800/600?random=3',
        alt: 'Detalle de proyecto',
        title: 'Detalle'
      }
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Shadcn UI'],
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/portfolio',
    featured: true,
    category: 'web'
  },
  {
    id: '2',
    title: 'App de Gestión',
    description: 'Aplicación web para gestión de proyectos y tareas con sincronización en tiempo real.',
    images: [
      {
        url: 'https://picsum.photos/800/600?random=4',
        alt: 'Dashboard de la aplicación',
        title: 'Dashboard'
      },
      {
        url: 'https://picsum.photos/800/600?random=5',
        alt: 'Lista de tareas',
        title: 'Tareas'
      }
    ],
    technologies: ['Next.js', 'Firebase', 'Material UI', 'Redux'],
    demoUrl: 'https://app.example.com',
    githubUrl: 'https://github.com/example/app',
    category: 'web'
  }
]

export function Portfolio() {
  return (
    <section className="container mx-auto py-12">
      <h2 className="oswald mb-8 text-center text-4xl font-bold tracking-tight">
        Mis Proyectos
      </h2>
      {/* En desktop: un proyecto por pantalla */}
      <div className="hidden md:flex flex-col gap-8">
        {MOCK_PROJECTS.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project}
            className="w-full max-w-5xl mx-auto flex-row items-stretch overflow-hidden"
          />
        ))}
      </div>
      {/* En móvil: cards verticales con márgenes */}
      <div className="md:hidden flex flex-col gap-6 px-4">
        {MOCK_PROJECTS.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project}
          />
        ))}
      </div>
    </section>
  )
}