/**
 * ProjectsOverview - Lista de proyectos recientes en el dashboard
 * 
 * Muestra los últimos proyectos creados con:
 * - Título y estado
 * - Fecha de actualización
 * - Tecnologías principales
 * - Acciones rápidas
 */

import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, ExternalLink, Briefcase, Star, CheckCircle, Clock, Zap } from 'lucide-react'
import type { Project } from '@/types/admin.types'

interface ProjectsOverviewProps {
    projects: Project[]
    isLoading?: boolean
}

function ProjectRow({ project }: { project: Project }) {
    const statusConfig = {
        completed: {
            color: 'bg-green-500/10 text-green-500 border-green-500/20',
            label: 'Completado',
            icon: <CheckCircle className="h-3 w-3" />
        },
        'in-progress': {
            color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            label: 'En Progreso',
            icon: <Clock className="h-3 w-3" />
        },
        planned: {
            color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            label: 'Planeado',
            icon: <Zap className="h-3 w-3" />
        }
    }

    const status = statusConfig[project.status] || statusConfig.planned

    return (
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{project.title}</h4>
                    <Badge variant="outline" className={status.color}>
                        <span className="flex items-center gap-1">
                            {status.icon}
                            {status.label}
                        </span>
                    </Badge>
                    {project.featured && (
                        <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Destacado
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
                    {project.technologies && project.technologies.length > 0 && (
                        <span className="flex items-center gap-1">
                            <span>🔧</span>
                            {project.technologies.slice(0, 3).join(', ')}
                            {project.technologies.length > 3 && ` +${project.technologies.length - 3}`}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link to={`/admin/projects/${project.id}/edit`}>
                        <Edit className="h-4 w-4" />
                    </Link>
                </Button>
                {project.links?.demo && (
                    <Button variant="ghost" size="sm" asChild>
                        <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}
            </div>
        </div>
    )
}

export default function ProjectsOverview({ projects, isLoading }: ProjectsOverviewProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Proyectos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-3">
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                                </div>
                                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (projects.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Proyectos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay proyectos aún</p>
                        <Button variant="link" asChild className="mt-2">
                            <Link to="/admin/projects/new">Crear primer proyecto</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Proyectos Recientes</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/projects">Ver todos</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-0">
                    {projects.map((project) => (
                        <ProjectRow key={project.id} project={project} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}