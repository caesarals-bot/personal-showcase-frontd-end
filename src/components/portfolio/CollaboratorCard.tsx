import { motion } from 'framer-motion'
import { ExternalLink, Github, Linkedin, Mail } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CollaboratorCardProps } from '@/types/portfolio'

export default function CollaboratorCard({ collaborator }: CollaboratorCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <Github className="h-4 w-4" />
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  const getSocialUrl = (platform: string, username: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return `https://github.com/${username}`
      case 'linkedin':
        return `https://linkedin.com/in/${username}`
      case 'email':
        return `mailto:${username}`
      default:
        return username.startsWith('http') ? username : `https://${username}`
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full border-border/50 bg-card/50 hover:bg-card/70 transition-colors duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Avatar className="h-12 w-12 border-2 border-border/50">
              <AvatarImage 
                src={collaborator.avatar} 
                alt={collaborator.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(collaborator.name)}
              </AvatarFallback>
            </Avatar>

            {/* Información */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                {/* Nombre y rol */}
                <div>
                  <h4 className="font-semibold text-sm leading-tight truncate">
                    {collaborator.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {collaborator.role}
                  </p>
                </div>

                {/* Especialidades */}
                {collaborator.specialties && collaborator.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {collaborator.specialties.slice(0, 3).map((specialty) => (
                      <Badge 
                        key={specialty} 
                        variant="secondary" 
                        className="text-xs px-2 py-0.5 h-auto"
                      >
                        {specialty}
                      </Badge>
                    ))}
                    {collaborator.specialties.length > 3 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-2 py-0.5 h-auto"
                      >
                        +{collaborator.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Enlaces sociales */}
                {collaborator.socialLinks && collaborator.socialLinks.length > 0 && (
                  <div className="flex gap-1">
                    {collaborator.socialLinks.slice(0, 3).map((link, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                        asChild
                      >
                        <a
                          href={getSocialUrl(link.platform, link.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${collaborator.name} en ${link.platform}`}
                        >
                          {getSocialIcon(link.platform)}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Descripción (si existe) */}
          {collaborator.bio && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {collaborator.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}