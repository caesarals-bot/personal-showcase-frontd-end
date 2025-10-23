import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import ProjectCarousel from "@/components/portfolio/ProjectCarousel"
import type { ProjectCardProps } from "@/types/portfolio"

export function ProjectCard({ project, className }: ProjectCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Reducir la intensidad del movimiento para mayor fluidez
    const rotateX = (y - centerY) / 20; // Más suave
    const rotateY = (centerX - x) / 20; // Más suave
    
    // Actualizar posición del mouse para efectos internos
    setMousePosition({ x: rotateY, y: rotateX });
    
    // Spotlight effect más suave
    setSpotlight({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
    setSpotlight({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative transition-all duration-300 ease-out max-w-2xl mx-auto"
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale(1.02)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
      }}
    >
      <Card className={cn("group relative overflow-hidden transition-all duration-300 hover:shadow-2xl", className)}>
         {/* Neon border effect - contenido dentro de la tarjeta */}
         {isHovered && (
           <div 
             className="absolute -inset-[2px] rounded-xl opacity-80 transition-all duration-500 animate-gradient-rotate pointer-events-none"
             style={{ 
               zIndex: 1,
               background: "linear-gradient(45deg, #ff0080, #7928ca, #ff0080, #00d4ff, #ff0080)",
               backgroundSize: "300% 300%",
               filter: "blur(2px)"
             }}
           />
         )}
         {/* Contenido de la tarjeta con fondo para cubrir el neon */}
         <div className="relative bg-background rounded-xl z-10">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Sección de Imágenes - Izquierda */}
            <div className="relative aspect-video md:aspect-square overflow-hidden bg-muted">
              <div
                className="relative w-full h-full"
                style={{
                  clipPath: isHovered
                    ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                    : "polygon(5% 5%, 95% 0%, 100% 100%, 0% 95%)",
                  transition: "clip-path 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <ProjectCarousel 
                  images={project.images}
                  autoPlay={!isHovered}
                  className="w-full h-full"
                />

                {/* Scan line effect */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 pointer-events-none",
                    isHovered && "opacity-100 animate-scan-line",
                  )}
                />
              </div>

              {/* LEDs pulsantes en las esquinas */}
              {isHovered && (
                <>
                  <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-400 rounded-full led-pulse z-30" />
                  <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400 rounded-full led-pulse delay-100 z-30" />
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-400 rounded-full led-pulse delay-200 z-30" />
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-cyan-400 rounded-full led-pulse delay-300 z-30" />
                </>
              )}
            </div>

            {/* Sección de Contenido - Derecha */}
            <div className="flex flex-col justify-between p-6 md:p-8 relative">
              {/* Spotlight radial que sigue al mouse */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: isHovered
                    ? `radial-gradient(400px circle at ${spotlight.x}% ${spotlight.y}%, rgba(139, 92, 246, 0.1), transparent 40%)`
                    : "none",
                  opacity: isHovered ? 1 : 0,
                }}
              />

              <div className="space-y-4 relative z-10">
                <h3
                  className="text-2xl font-bold tracking-tight text-balance relative overflow-hidden"
                  style={{
                    transform: isHovered ? "translateX(0)" : "translateX(-5px)",
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  {project.title}
                  <span
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 transition-all duration-500"
                    style={{
                      width: isHovered ? "100%" : "0%",
                    }}
                  />
                </h3>

                <p
                  className="text-muted-foreground leading-relaxed text-pretty"
                  style={{
                    transform: isHovered ? "translateX(0)" : "translateX(-3px)",
                    transition: "transform 0.3s ease-out 0.1s",
                  }}
                >
                  {project.description}
                </p>

                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <Badge
                        key={`${project.id}-tech-${index}-${tech}`}
                        variant="secondary"
                        className="text-xs font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        style={{
                          transform: isHovered ? "translateY(0)" : "translateY(2px)",
                          transition: `transform 0.3s ease-out ${index * 0.05}s`,
                        }}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-6 relative z-10">
                {/* Botón Leer más */}
                <Button
                  asChild
                  variant="ghost"
                  className="w-full group/read-more bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  <Link to={`/portfolio/${project.slug}`}>
                    <span className="flex items-center gap-2 text-primary">
                      Leer más
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/read-more:translate-x-1" />
                    </span>
                  </Link>
                </Button>

                {/* Botones de enlaces */}
                <div className="flex gap-3">
                  {project.demoUrl && (
                    <Button
                      asChild
                      className="flex-1 relative overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 shine"
                    >
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                        Ver Proyecto
                      </a>
                    </Button>
                  )}
                  {project.githubUrl && (
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 bg-transparent relative overflow-hidden group/btn transition-all duration-300 hover:shadow-lg"
                    >
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <Github className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                        Código
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        </Card>


    </div>
  )
}