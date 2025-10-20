import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { useUpdateNotification } from '@/hooks/useServiceWorker';
import { Button } from './button';

/**
 * Componente de notificación para actualizaciones de la aplicación
 * Se muestra cuando hay una nueva versión disponible
 */
export const UpdateNotification = () => {
  const { showNotification, acceptUpdate, dismissUpdate } = useUpdateNotification();

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-background border border-border rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">
                  Actualización disponible
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Una nueva versión de la aplicación está lista. Actualiza para obtener las últimas mejoras.
                </p>
                
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={acceptUpdate}
                    className="text-xs"
                  >
                    Actualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={dismissUpdate}
                    className="text-xs"
                  >
                    Más tarde
                  </Button>
                </div>
              </div>
              
              <button
                onClick={dismissUpdate}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};