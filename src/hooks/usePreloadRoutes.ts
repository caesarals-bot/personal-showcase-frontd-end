import { useEffect } from 'react';

/**
 * Hook para precargar rutas importantes
 * Mejora la experiencia del usuario precargando componentes que probablemente visitará
 */
export const usePreloadRoutes = () => {
  useEffect(() => {
    // Precargar rutas principales después de que la página inicial haya cargado
    const preloadRoutes = async () => {
      try {
        // Esperar un poco para no interferir con la carga inicial
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Precargar las rutas más visitadas
        const routesToPreload = [
          () => import("../pages/blog/BlogPage"),
          () => import("../pages/portfolio/PortfolioPage"),
          () => import("../pages/about/AboutPage"),
          () => import("../pages/contactme/ContactMePage"),
        ];

        // Precargar de forma secuencial para no sobrecargar la red
        for (const loadRoute of routesToPreload) {
          try {
            await loadRoute();
            // Pequeña pausa entre precargas
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.warn('Error precargando ruta:', error);
          }
        }
      } catch (error) {
        console.warn('Error en precarga de rutas:', error);
      }
    };

    // Solo precargar en navegadores que soporten requestIdleCallback
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadRoutes);
    } else {
      // Fallback para navegadores que no soporten requestIdleCallback
      setTimeout(preloadRoutes, 3000);
    }
  }, []);
};

/**
 * Hook para precargar rutas específicas bajo demanda
 */
export const usePreloadRoute = (routeImporter: () => Promise<any>) => {
  const preloadRoute = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        routeImporter().catch(error => 
          console.warn('Error precargando ruta específica:', error)
        );
      });
    } else {
      setTimeout(() => {
        routeImporter().catch(error => 
          console.warn('Error precargando ruta específica:', error)
        );
      }, 100);
    }
  };

  return { preloadRoute };
};