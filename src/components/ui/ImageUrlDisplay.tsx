/**
 * ImageUrlDisplay - Componente para mostrar URLs de imágenes con funcionalidad de copia
 * 
 * Muestra las URLs de las imágenes en un formato fácil de copiar,
 * similar a como se hace en los posts del blog.
 */

import { useCallback } from 'react';
import { Link, Copy } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

export interface ImageUrlDisplayProps {
  urls: string[];
  title?: string;
  description?: string;
  className?: string;
}

export function ImageUrlDisplay({ 
  urls, 
  title = "URLs para usar en Markdown",
  description = "Copia estas URLs para usar en tu contenido con formato: ![alt text](URL)",
  className = ""
}: ImageUrlDisplayProps) {
  
  // Función para copiar al portapapeles
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías agregar una notificación de éxito si tienes un sistema de notificaciones
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, []);

  // Si no hay URLs, no mostrar nada
  if (!urls || urls.length === 0) {
    return null;
  }

  return (
    <Card className={`mx-auto max-w-md w-full ${className}`}>
      <CardContent className="p-3">
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">{title}</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          
          <div className="space-y-1">
            {urls.map((url, index) => (
              <div key={index} className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md">
                <code className="flex-1 text-xs font-mono bg-background px-1.5 py-0.5 rounded border truncate">
                  {url}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(url)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                  title="Copiar URL"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          
          {urls.length > 1 && (
            <div className="pt-1.5 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const allUrlsText = urls.join('\n');
                  copyToClipboard(allUrlsText);
                }}
                className="w-full"
              >
                <Copy className="h-3 w-3 mr-2" />
                Copiar todas las URLs
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ImageUrlDisplay;