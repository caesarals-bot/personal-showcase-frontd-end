/**
 * ProjectMarkdownRenderer - Wrapper específico para documentación de proyectos.
 *
 * Delega en `MarkdownRenderer` con `preset="project"` y agrega el
 * `ProjectMarkdownRendererCompact` para listas densas.
 *
 * Diferencias con el preset `blog`:
 * - Imágenes con `preset="project"` en `OptimizedImage`.
 * - Espaciados más compactos en títulos/párrafos.
 */

import { MarkdownRenderer } from './MarkdownRenderer';

interface ProjectMarkdownRendererProps {
  content: string;
  className?: string;
  compact?: boolean;
}

export function ProjectMarkdownRenderer({
  content,
  className,
  compact = false,
}: ProjectMarkdownRendererProps) {
  return (
    <div className={`project-markdown-content ${className ?? ''}`}>
      <MarkdownRenderer content={content} preset={compact ? 'compact' : 'project'} />
    </div>
  );
}

export function ProjectMarkdownRendererCompact({
  content,
  className,
}: Omit<ProjectMarkdownRendererProps, 'compact'>) {
  return (
    <ProjectMarkdownRenderer
      content={content}
      className={className}
      compact={true}
    />
  );
}
