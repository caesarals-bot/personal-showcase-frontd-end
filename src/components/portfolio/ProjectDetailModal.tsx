import { motion } from 'framer-motion'
import { X, ExternalLink, Github, Calendar, Clock, Users, Target, Lightbulb, Zap } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectMarkdownRenderer } from '@/components/ProjectMarkdownRenderer'

import type { ProjectDetailModalProps } from '@/types/portfolio'
import ProjectCarousel from './ProjectCarousel'
import CollaboratorCard from './CollaboratorCard'

export default function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30'
      case 'planned': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed': return 'Completado'
      case 'in-progress': return 'En Progreso'
      case 'planned': return 'Planificado'
      default: return 'Estado Desconocido'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 bg-background/95 backdrop-blur-sm border-border/50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="relative p-6 pb-4 border-b border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <DialogTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {project.title}
                  </DialogTitle>
                  {project.status && (
                    <Badge className={`${getStatusColor(project.status)} font-medium`}>
                      {getStatusText(project.status)}
                    </Badge>
                  )}
                  {project.featured && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Destacado
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {project.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{project.duration}</span>
                    </div>
                  )}
                  {project.startDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(project.startDate).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}</span>
                    </div>
                  )}
                  {project.collaborators && project.collaborators.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.collaborators.length + 1} colaboradores</span>
                    </div>
                  )}
                </div>

                {/* Tecnologías principales */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 6).map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 6 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.technologies.length - 6} más
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Carrusel de imágenes */}
              <div className="lg:col-span-1">
                <ProjectCarousel 
                  images={project.images} 
                  showThumbnails={true}
                  className="rounded-lg overflow-hidden"
                />
              </div>

              {/* Enlaces y acciones */}
              <div className="space-y-4">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Enlaces del Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.demoUrl && (
                      <Button asChild className="w-full">
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver Demo
                        </a>
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button asChild variant="outline" className="w-full">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          Ver Código
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Información adicional */}
                {(project.client || project.myRole) && (
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Detalles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {project.client && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                          <p className="text-sm">{project.client}</p>
                        </div>
                      )}
                      {project.myRole && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Mi Rol</p>
                          <p className="text-sm">{project.myRole}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Tabs con información detallada */}
            <div className="px-6 pb-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                  <TabsTrigger value="overview">Descripción</TabsTrigger>
                  {project.features && project.features.length > 0 && (
                    <TabsTrigger value="features">Características</TabsTrigger>
                  )}
                  {project.challenges && project.challenges.length > 0 && (
                    <TabsTrigger value="challenges">Desafíos</TabsTrigger>
                  )}
                  {project.learnings && project.learnings.length > 0 && (
                    <TabsTrigger value="learnings">Aprendizajes</TabsTrigger>
                  )}
                  {project.collaborators && project.collaborators.length > 0 && (
                    <TabsTrigger value="team">Equipo</TabsTrigger>
                  )}
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="overview" className="space-y-4">
                    <Card className="border-border/50 bg-card/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Descripción del Proyecto
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ProjectMarkdownRenderer 
                          content={project.longDescription || project.description} 
                          compact={true}
                        />
                      </CardContent>
                    </Card>

                    {/* Todas las tecnologías */}
                    <Card className="border-border/50 bg-card/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Tecnologías Utilizadas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-sm">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {project.features && project.features.length > 0 && (
                    <TabsContent value="features">
                      <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Características Principales
                          </CardTitle>
                          <CardDescription>
                            Funcionalidades y características destacadas del proyecto
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {project.features.map((feature, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                              >
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                <span className="text-sm leading-relaxed">{feature}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {project.challenges && project.challenges.length > 0 && (
                    <TabsContent value="challenges">
                      <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Desafíos Técnicos
                          </CardTitle>
                          <CardDescription>
                            Principales retos y cómo fueron resueltos
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {project.challenges.map((challenge, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                              >
                                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                                <span className="text-sm leading-relaxed">{challenge}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {project.learnings && project.learnings.length > 0 && (
                    <TabsContent value="learnings">
                      <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            Aprendizajes
                          </CardTitle>
                          <CardDescription>
                            Conocimientos y experiencias adquiridas
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {project.learnings.map((learning, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                              >
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                                <span className="text-sm leading-relaxed">{learning}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {project.collaborators && project.collaborators.length > 0 && (
                    <TabsContent value="team">
                      <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Equipo de Trabajo
                          </CardTitle>
                          <CardDescription>
                            Colaboradores que participaron en este proyecto
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.collaborators.map((collaborator, index) => (
                              <motion.div
                                key={collaborator.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <CollaboratorCard collaborator={collaborator} />
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}