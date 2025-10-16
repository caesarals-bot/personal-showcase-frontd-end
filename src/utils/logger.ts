/**
 * Sistema de logging centralizado
 * En producción, los logs se desactivan automáticamente
 */

const IS_PRODUCTION = import.meta.env.PROD;
const IS_DEV = import.meta.env.DEV;

export const logger = {
  /**
   * Log informativo (solo en desarrollo)
   */
  log: (...args: any[]) => {
    if (IS_DEV) {
      console.log(...args);
    }
  },

  /**
   * Log de advertencia (solo en desarrollo)
   */
  warn: (...args: any[]) => {
    if (IS_DEV) {
      console.warn(...args);
    }
  },

  /**
   * Log de error (siempre se muestra, pero sin detalles sensibles en producción)
   */
  error: (message: string, error?: any) => {
    if (IS_PRODUCTION) {
      // En producción, solo mostrar mensaje genérico
      console.error(message);
    } else {
      // En desarrollo, mostrar todo
      console.error(message, error);
    }
  },

  /**
   * Log de tiempo (solo en desarrollo)
   */
  time: (label: string) => {
    if (IS_DEV) {
      console.time(label);
    }
  },

  /**
   * Fin de log de tiempo (solo en desarrollo)
   */
  timeEnd: (label: string) => {
    if (IS_DEV) {
      console.timeEnd(label);
    }
  },

  /**
   * Log de información (solo en desarrollo)
   */
  info: (...args: any[]) => {
    if (IS_DEV) {
      console.info(...args);
    }
  }
};
