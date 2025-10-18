```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@theme inline {
  --font-sans: "Geist", "Geist Fallback";
  --font-mono: "Geist Mono", "Geist Mono Fallback";
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Agregando animaciones personalizadas para efectos únicos */
@keyframes gradient-rotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes scan-line {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.animate-gradient-rotate {
  background-size: 200% 200%;
  animation: gradient-rotate 3s ease infinite;
}

.animate-scan-line {
  animation: scan-line 2s ease-in-out infinite;
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}

.delay-300 {
  animation-delay: 300ms;
}

```
```tsx page
import { ProjectCard } from "@/components/project-card"

export default function Home() {
  const projects = [
    {
      title: "E-Commerce Platform",
      description:
        "Una plataforma de comercio electrónico completa con carrito de compras, procesamiento de pagos y panel de administración. Construida con las últimas tecnologías web para ofrecer una experiencia de usuario excepcional.",
      images: ["/modern-ecommerce-homepage.jpg", "/ecommerce-product-page.png", "/shopping-cart-interface.jpg"],
      tags: ["Next.js", "TypeScript", "Stripe", "Tailwind CSS"],
      githubUrl: "https://github.com/usuario/ecommerce",
      liveUrl: "https://ecommerce-demo.vercel.app",
    },
    {
      title: "Dashboard Analytics",
      description:
        "Dashboard interactivo para visualización de datos en tiempo real con gráficos dinámicos, métricas clave y reportes personalizables. Diseñado para ayudar a tomar decisiones basadas en datos.",
      images: ["/analytics-dashboard.png", "/data-visualization-graphs.jpg", "/metrics-dashboard-dark-mode.jpg"],
      tags: ["React", "D3.js", "Node.js", "PostgreSQL"],
      githubUrl: "https://github.com/usuario/dashboard",
      liveUrl: "https://dashboard-demo.vercel.app",
    },
    {
      title: "Social Media App",
      description:
        "Aplicación de redes sociales con funcionalidades de publicación, comentarios, likes y mensajería en tiempo real. Incluye autenticación segura y perfiles de usuario personalizables.",
      images: ["/social-media-feed-interface.jpg", "/user-profile-page.png", "/messaging-chat-interface.jpg"],
      tags: ["Next.js", "Supabase", "WebSocket", "shadcn/ui"],
      githubUrl: "https://github.com/usuario/social-app",
      liveUrl: "https://social-demo.vercel.app",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">Mis Proyectos</h1>
          <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
            Una colección de proyectos en los que he trabajado, desde aplicaciones web hasta dashboards interactivos.
          </p>
        </div>

        {/* Grid de proyectos */}
        <div className="space-y-8">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>
      </div>
    </main>
  )
}

```

```tsx card
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ExternalLink, Github } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  title: string
  description: string
  images: string[]
  tags?: string[]
  githubUrl?: string
  liveUrl?: string
  className?: string
}

export function ProjectCard({
  title,
  description,
  images,
  tags = [],
  githubUrl,
  liveUrl,
  className,
}: ProjectCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / 20
    const y = (e.clientY - rect.top - rect.height / 2) / 20
    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition({ x: 0, y: 0 })
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale(1.02)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
        transition: "transform 0.3s ease-out",
      }}
    >
      <div
        className={cn(
          "absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg opacity-0 blur-sm transition-opacity duration-500",
          isHovered && "opacity-75 animate-gradient-rotate",
        )}
      />

      <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-2xl", className)}>
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
                src={images[currentImageIndex] || "/placeholder.svg"}
                alt={`${title} - imagen ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-700"
                style={{
                  transform: isHovered
                    ? `scale(1.15) translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
                    : "scale(1)",
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000",
                  isHovered && "opacity-100 animate-scan-line",
                )}
              />
            </div>

            {isHovered && (
              <>
                <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-100" />
                <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200" />
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300" />
              </>
            )}

            {/* Controles del carousel */}
            {images.length > 1 && (
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
                  {images.map((_, index) => (
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
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
              style={{
                background: isHovered
                  ? `radial-gradient(600px circle at ${mousePosition.x * 10 + 50}% ${mousePosition.y * 10 + 50}%, rgba(139, 92, 246, 0.1), transparent 40%)`
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
                {title}
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
                {description}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      style={{
                        transform: isHovered ? "translateY(0)" : "translateY(2px)",
                        transition: `transform 0.3s ease-out ${index * 0.05}s`,
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 relative z-10">
              {liveUrl && (
                <Button
                  asChild
                  className="flex-1 relative overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-primary/50"
                >
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                    Ver Proyecto
                  </a>
                </Button>
              )}
              {githubUrl && (
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 bg-transparent relative overflow-hidden group/btn transition-all duration-300 hover:shadow-lg"
                >
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <Github className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                    Código
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

```