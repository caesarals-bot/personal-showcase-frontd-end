import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ExternalLink, Github } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProjectCardProps } from "@/types/portfolio"

export function ProjectCard({ project, className }: ProjectCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)

  // Auto-play del carrusel
  useEffect(() => {
    if (!isAutoPlaying || project.images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length)
    }, 3000) // Cambiar imagen cada 3 segundos

    return () => clearInterval(interval)
  }, [isAutoPlaying, project.images.length])

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
    setIsAutoPlaying(false); // Pausar auto-play en hover
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
    setSpotlight({ x: 50, y: 50 });
    // Reanudar auto-play después de salir del hover
    setTimeout(() => setIsAutoPlaying(true), 1000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % project.images.length)
    // Pausar auto-play temporalmente cuando el usuario navega manualmente
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000) // Reanudar después de 5 segundos
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length)
    // Pausar auto-play temporalmente cuando el usuario navega manualmente
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000) // Reanudar después de 5 segundos
  }

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
      <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-2xl", className)}>
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
                <img
                  src={project.images[currentImageIndex]?.url || "/placeholder.svg"}
                  alt={project.images[currentImageIndex]?.alt || project.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-110"
                  style={{
                    transform: isHovered
                      ? `scale(1.1) translate(${mousePosition.x * 1.5}px, ${mousePosition.y * 1.5}px)`
                      : "scale(1)",
                  }}
                />

                {/* Scan line effect */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000",
                    isHovered && "opacity-100 animate-scan-line",
                  )}
                />
              </div>

              {/* LEDs pulsantes en las esquinas */}
              {isHovered && (
                <>
                  <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-400 rounded-full led-pulse" />
                  <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400 rounded-full led-pulse delay-100" />
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-400 rounded-full led-pulse delay-200" />
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-cyan-400 rounded-full led-pulse delay-300" />
                </>
              )}

              {/* Controles del carousel */}
              {project.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={previousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {project.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          index === currentImageIndex ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75",
                        )}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
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
                        key={index}
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

              <div className="flex gap-3 mt-6 relative z-10">
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
        </Card>
    </div>
  )
}