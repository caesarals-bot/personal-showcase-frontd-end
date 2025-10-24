import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

/**
 * Hook para manejar el Service Worker
 * Registra el SW, maneja actualizaciones y proporciona estado
 */
export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    // Verificar soporte para Service Workers
    if (!('serviceWorker' in navigator)) {
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    // Registrar Service Worker
    const registerSW = async () => {
      try {
        // Esperar a que el documento esté completamente cargado
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            const handleLoad = () => {
              window.removeEventListener('load', handleLoad);
              resolve(void 0);
            };
            window.addEventListener('load', handleLoad);
          });
        }

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none', // Evitar problemas de cache
        });

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Escuchar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nueva versión disponible
                setState(prev => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });

        // Escuchar cambios en el controlador
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

      } catch (error) {
        console.warn('Service Worker registration failed:', error);
        // Error silencioso en producción pero con log para debugging
      }
    };

    // Usar setTimeout para asegurar que el registro ocurra después del render inicial
    const timeoutId = setTimeout(registerSW, 100);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Función para actualizar el Service Worker
  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  // Función para limpiar cache
  const clearCache = () => {
    if (state.registration?.active) {
      state.registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  };

  // Función para verificar actualizaciones manualmente
  const checkForUpdates = async () => {
    if (state.registration) {
      try {
        await state.registration.update();
        // Verificación de actualizaciones completada
      } catch (error) {
        // Error verificando actualizaciones
      }
    }
  };

  return {
    ...state,
    updateServiceWorker,
    clearCache,
    checkForUpdates,
  };
};

/**
 * Hook simplificado para mostrar notificación de actualización
 */
export const useUpdateNotification = () => {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowNotification(true);
    }
  }, [isUpdateAvailable]);

  const acceptUpdate = () => {
    updateServiceWorker();
    setShowNotification(false);
  };

  const dismissUpdate = () => {
    setShowNotification(false);
  };

  return {
    showNotification,
    acceptUpdate,
    dismissUpdate,
  };
};