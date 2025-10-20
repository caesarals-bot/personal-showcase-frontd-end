import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { usePreloadRoute } from '@/hooks/usePreloadRoutes';
import type { ReactNode } from 'react';

interface PreloadLinkProps extends LinkProps {
  children: ReactNode;
  routeImporter?: () => Promise<any>;
  preloadDelay?: number;
}

/**
 * Componente de enlace que precarga la ruta al hacer hover
 * Mejora la experiencia del usuario precargando contenido antes del clic
 */
export const PreloadLink = ({ 
  children, 
  routeImporter, 
  preloadDelay = 200,
  ...linkProps 
}: PreloadLinkProps) => {
  const { preloadRoute } = usePreloadRoute(routeImporter || (() => Promise.resolve()));

  const handleMouseEnter = () => {
    if (routeImporter) {
      setTimeout(preloadRoute, preloadDelay);
    }
  };

  return (
    <Link 
      {...linkProps}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Link>
  );
};

// Mapeo de rutas a sus importadores para facilitar el uso
export const routeImporters = {
  blog: () => import("../../pages/blog/BlogPage"),
  portfolio: () => import("../../pages/portfolio/PortfolioPage"),
  about: () => import("../../pages/about/AboutPage"),
  contact: () => import("../../pages/contactme/ContactMePage"),
  login: () => import("../../auth/pages/LoginPage"),
  register: () => import("../../auth/pages/RegisterPage"),
  admin: () => import("../../admin/pages/AdminPage"),
} as const;

export type RouteKey = keyof typeof routeImporters;