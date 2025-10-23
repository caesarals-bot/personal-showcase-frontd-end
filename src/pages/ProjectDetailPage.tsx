/**
 * ProjectDetailPage - Página de detalle de un proyecto individual
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, ExternalLink, Github, User, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectCarousel from '@/components/portfolio/ProjectCarousel'
import CollaboratorCard from '@/components/portfolio/CollaboratorCard';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { getProjectBySlug } from '@/services/projectService';
import type { Project } from '@/types/portfolio';
import type { Project as AdminProject } from '@/types/admin.types';
import { ProjectDetailSkeleton } from '@/components/skeletons';

// Función para convertir proyecto de admin a formato portfolio
const convertAdminProjectToPortfolio = (adminProject: AdminProject): Project => {
  return {
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
};

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!slug) {
        setError('Slug del proyecto no encontrado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const adminProject = await getProjectBySlug(slug);
        
        if (adminProject) {
          const portfolioProject = convertAdminProjectToPortfolio(adminProject);
          setProject(portfolioProject);
        } else {
          setError('Proyecto no encontrado');
        }
      } catch (err) {
        console.error('Error al cargar proyecto:', err);
        setError('Error al cargar el proyecto');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [slug]);

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Proyecto no encontrado</h1>
            <p className="text-muted-foreground mb-8">{error || 'El proyecto que buscas no existe.'}</p>
            <Button asChild>
              <Link to="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Portfolio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-8 md:px-12 lg:px-16 py-8">
          {/* Botón Volver */}
          <Button
            variant="ghost"
            onClick={() => navigate('/portfolio')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Portfolio
          </Button>

          {/* Categoría y Estado */}
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="capitalize">
              {project.category}
            </Badge>
            {project.status && (
              <Badge 
                variant={project.status === 'completed' ? 'default' : 'secondary'}
              >
                {project.status === 'completed' ? 'Completado' : 
                 project.status === 'in-progress' ? 'En Progreso' : 
                 'En Desarrollo'}
              </Badge>
            )}
          </div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 max-w-4xl"
          >
            {project.title}
          </motion.h1>

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-6 max-w-3xl"
          >
            {project.description}
          </motion.p>

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6"
          >
            {/* Duración */}
            {project.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {project.duration}
              </div>
            )}

            {/* Fechas */}
            {project.startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(project.startDate).toLocaleDateString('es-ES', {
                  month: 'long',
                  year: 'numeric',
                })}
                {project.endDate && (
                  <span> - {new Date(project.endDate).toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric',
                  })}</span>
                )}
              </div>
            )}

            {/* Mi Rol */}
            {project.myRole && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {project.myRole}
              </div>
            )}

            {/* Cliente */}
            {project.client && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {project.client}
              </div>
            )}

            {/* Presupuesto */}
            {project.budget && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {project.budget}
              </div>
            )}
          </motion.div>

          {/* Botones de Acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3"
          >
            {project.demoUrl && (
              <Button asChild>
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Demo
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  Ver Código
                </a>
              </Button>
            )}
          </motion.div>

          {/* Botones de Compartir */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <SocialShareButtons
              url={window.location.href}
              title={project.title}
              description={project.description}
            />
          </motion.div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Galería de Imágenes */}
          {project.images && project.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <div className="flex justify-center">
                <ProjectCarousel 
                  images={project.images}
                  autoPlay={true}
                  className="h-[300px] md:h-[400px] lg:h-[450px] max-w-2xl w-full"
                />
              </div>
            </motion.div>
          )}

          {/* Tecnologías */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold mb-3">Tecnologías Utilizadas</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <Badge key={index} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Contenido con Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                {project.features && project.features.length > 0 && (
                  <TabsTrigger value="features">Características</TabsTrigger>
                )}
                {project.challenges && project.challenges.length > 0 && (
                  <TabsTrigger value="challenges">Desafíos</TabsTrigger>
                )}
                {project.learnings && project.learnings.length > 0 && (
                  <TabsTrigger value="learnings">Aprendizajes</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Descripción del Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <MarkdownRenderer content={project.longDescription || project.description} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {project.features && project.features.length > 0 && (
                <TabsContent value="features" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Características Principales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {project.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {project.challenges && project.challenges.length > 0 && (
                <TabsContent value="challenges" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Desafíos Enfrentados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {project.challenges.map((challenge, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {project.learnings && project.learnings.length > 0 && (
                <TabsContent value="learnings" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aprendizajes Obtenidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {project.learnings.map((learning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{learning}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>

          {/* Colaboradores */}
          {project.collaborators && project.collaborators.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-12"
            >
              <h3 className="text-2xl font-bold mb-6">Equipo de Trabajo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.collaborators.map((collaborator) => (
                  <CollaboratorCard
                    key={collaborator.id}
                    collaborator={collaborator}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Más Proyectos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 pt-8 border-t"
          >
            <h3 className="text-2xl font-bold mb-6">Más Proyectos</h3>
            <div className="flex justify-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/portfolio">Ver todos los proyectos</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}