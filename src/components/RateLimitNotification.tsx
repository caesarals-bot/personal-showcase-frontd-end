/**
 * Componente para mostrar notificaciones de rate limiting
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';

interface RateLimitNotificationProps {
  /** Si el usuario está bloqueado */
  isBlocked: boolean;
  /** Intentos restantes */
  attemptsRemaining: number;
  /** Tiempo restante en segundos */
  timeRemaining: number;
  /** Número máximo de intentos */
  maxAttempts: number;
}

/**
 * Formatea el tiempo restante en un formato legible
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function RateLimitNotification({
  isBlocked,
  attemptsRemaining,
  timeRemaining,
  maxAttempts,
}: RateLimitNotificationProps) {
  // No mostrar nada si no hay restricciones activas
  if (!isBlocked && attemptsRemaining === maxAttempts) {
    return null;
  }

  return (
    <AnimatePresence>
      {(isBlocked || attemptsRemaining < maxAttempts) && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`
            p-4 rounded-lg border-l-4 mb-4
            ${isBlocked 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-500' 
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-500'
            }
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isBlocked ? (
                <AlertTriangle 
                  className="h-5 w-5 text-red-400 dark:text-red-500" 
                  aria-hidden="true" 
                />
              ) : (
                <Clock 
                  className="h-5 w-5 text-yellow-400 dark:text-yellow-500" 
                  aria-hidden="true" 
                />
              )}
            </div>
            
            <div className="ml-3 flex-1">
              {isBlocked ? (
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Demasiados intentos
                  </h3>
                  <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                    <p>
                      Has excedido el límite de envíos. Por favor, espera{' '}
                      <span className="font-semibold">
                        {formatTimeRemaining(timeRemaining)}
                      </span>{' '}
                      antes de intentar nuevamente.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Límite de envíos
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      Te quedan{' '}
                      <span className="font-semibold">
                        {attemptsRemaining} de {maxAttempts}
                      </span>{' '}
                      intentos disponibles.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Barra de progreso para tiempo restante */}
          {isBlocked && timeRemaining > 0 && (
            <div className="mt-3">
              <div className="bg-red-200 dark:bg-red-800 rounded-full h-2">
                <motion.div
                  className="bg-red-500 dark:bg-red-400 h-2 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeRemaining / (30 * 60)) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          )}
          
          {/* Indicador visual de intentos restantes */}
          {!isBlocked && attemptsRemaining < maxAttempts && (
            <div className="mt-3 flex space-x-1">
              {Array.from({ length: maxAttempts }, (_, i) => (
                <div
                  key={i}
                  className={`
                    h-2 w-8 rounded-full
                    ${i < maxAttempts - attemptsRemaining
                      ? 'bg-yellow-400 dark:bg-yellow-500'
                      : 'bg-yellow-200 dark:bg-yellow-700'
                    }
                  `}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}