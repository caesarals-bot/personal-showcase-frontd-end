/**
 * SocialShareButtons - Componente para compartir artículos en redes sociales
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SocialShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  hashtags?: string[];
  className?: string;
}

export function SocialShareButtons({ 
  title, 
  url, 
  description = '', 
  hashtags = [],
  className = '' 
}: SocialShareButtonsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // URLs de compartir para cada red social
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.join(',')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
  };

  // Función para abrir ventana de compartir
  const openShareWindow = (shareUrl: string) => {
    window.open(
      shareUrl,
      'share-dialog',
      'width=600,height=400,resizable=yes,scrollbars=yes'
    );
  };

  // Función para copiar URL al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar URL:', err);
    }
  };

  // Configuración de botones de redes sociales
  const socialButtons = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-blue-500 hover:text-white',
      action: () => openShareWindow(shareUrls.twitter)
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-600 hover:text-white',
      action: () => openShareWindow(shareUrls.facebook)
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-700 hover:text-white',
      action: () => openShareWindow(shareUrls.linkedin)
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-green-500 hover:text-white',
      action: () => openShareWindow(shareUrls.whatsapp)
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Botón principal de compartir */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 transition-all duration-200"
        title="Compartir artículo"
      >
        <Share2 className="h-4 w-4" />
        Compartir
      </Button>

        {/* Panel expandible con opciones de compartir */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 z-50"
          >
            <Card className="shadow-lg border-border bg-card">
              <CardContent className="p-3">
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    Compartir en:
                  </p>
                  
                  {/* Botones de redes sociales */}
                  <div className="grid grid-cols-2 gap-2">
                    {socialButtons.map((social) => (
                      <Button
                        key={social.name}
                        variant="ghost"
                        size="sm"
                        onClick={social.action}
                        className={`flex items-center gap-2 justify-start transition-all duration-200 ${social.color}`}
                        title={`Compartir en ${social.name}`}
                      >
                        <social.icon className="h-4 w-4" />
                        <span className="text-xs">{social.name}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Separador */}
                  <div className="border-t border-border my-2" />

                  {/* Botón para copiar URL */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 justify-start transition-all duration-200 hover:bg-muted"
                    title={copied ? 'Enlace copiado al portapapeles' : 'Copiar enlace del artículo'}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="text-xs">
                      {copied ? 'Copiado!' : 'Copiar enlace'}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      {/* Overlay para cerrar al hacer clic fuera */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}