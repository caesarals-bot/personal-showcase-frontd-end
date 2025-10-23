/**
 * ProjectMarkdownRenderer - Renderizador de markdown específico para proyectos
 * 
 * Basado en MarkdownRenderer.optimized pero con estilos y componentes
 * específicos para la documentación de proyectos:
 * - Imágenes optimizadas con preset 'project'
 * - Estilos más compactos para descripciones
 * - Soporte para enlaces de tecnologías
 * - Componentes específicos para proyectos
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { lazy, Suspense, useState, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import { OptimizedImage } from './ui/OptimizedImage';
import { cn } from '@/lib/utils';

// Lazy loading del syntax highlighter
const SyntaxHighlighter = lazy(() => 
  import('react-syntax-highlighter').then(module => ({
    default: module.Prism
  }))
);

// Lazy loading de los temas
const loadThemes = () => 
  import('react-syntax-highlighter/dist/esm/styles/prism').then(module => ({
    oneDark: module.oneDark,
    oneLight: module.oneLight
  }));

interface ProjectMarkdownRendererProps {
  content: string;
  className?: string;
  compact?: boolean; // Para versiones más compactas en listas
}

// Componente de loading para el syntax highlighter
const CodeLoader = () => (
  <div className="bg-muted rounded-lg p-3 my-4 animate-pulse">
    <div className="h-3 bg-muted-foreground/20 rounded mb-2"></div>
    <div className="h-3 bg-muted-foreground/20 rounded mb-2 w-3/4"></div>
    <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
  </div>
);

// Componente de código optimizado para proyectos
const ProjectCodeBlock = ({ language, children, theme, compact }: { 
  language: string; 
  children: string; 
  theme: string;
  compact?: boolean;
}) => {
  const [themes, setThemes] = useState<any>(null);

  useEffect(() => {
    loadThemes().then(setThemes);
  }, []);

  if (!themes) {
    return <CodeLoader />;
  }

  const syntaxTheme = theme === 'dark' ? themes.oneDark : themes.oneLight;

  return (
    <div className={cn("relative", compact ? "my-3" : "my-4")}>
      {/* Etiqueta del lenguaje */}
      <div className="absolute top-0 left-3 -translate-y-1/2 z-10">
        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-mono">
          {language}
        </span>
      </div>
      
      {/* Bloque de código */}
      <Suspense fallback={<CodeLoader />}>
        <SyntaxHighlighter
          style={syntaxTheme}
          language={language}
          PreTag="div"
          className="rounded-lg border"
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: compact ? '0.8rem' : '0.875rem',
            lineHeight: '1.4',
            padding: compact ? '0.75rem' : '1rem',
          }}
        >
          {children}
        </SyntaxHighlighter>
      </Suspense>
    </div>
  );
};

export function ProjectMarkdownRenderer({ content, className, compact = false }: ProjectMarkdownRendererProps) {
  const { theme } = useTheme();

  return (
    <div className={cn("project-markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Renderizar bloques de código con syntax highlighting optimizado
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <ProjectCodeBlock 
                language={language} 
                theme={theme || 'light'}
                compact={compact}
                children={String(children).replace(/\n$/, '')}
              />
            ) : (
              <code 
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border" 
                {...props}
              >
                {children}
              </code>
            );
          },

          // Títulos más compactos para proyectos
          h1: ({ children }) => (
            <h1 className={cn(
              "font-bold border-b pb-2 first:mt-0",
              compact ? "text-xl mt-4 mb-2" : "text-2xl mt-6 mb-3"
            )}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={cn(
              "font-semibold border-b pb-1",
              compact ? "text-lg mt-3 mb-2" : "text-xl mt-5 mb-3"
            )}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={cn(
              "font-semibold",
              compact ? "text-base mt-3 mb-1" : "text-lg mt-4 mb-2"
            )}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={cn(
              "font-semibold",
              compact ? "text-sm mt-2 mb-1" : "text-base mt-3 mb-2"
            )}>
              {children}
            </h4>
          ),

          // Párrafos más compactos
          p: ({ children }) => (
            <p className={cn(
              "leading-relaxed",
              compact ? "mb-2 text-sm" : "mb-3 leading-7"
            )}>
              {children}
            </p>
          ),

          // Listas más compactas
          ul: ({ children }) => (
            <ul className={cn(
              "list-disc list-inside ml-4",
              compact ? "mb-2 space-y-0.5" : "mb-3 space-y-1"
            )}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={cn(
              "list-decimal list-inside ml-4",
              compact ? "mb-2 space-y-0.5" : "mb-3 space-y-1"
            )}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={cn(
              compact ? "leading-5 text-sm" : "leading-6"
            )}>
              {children}
            </li>
          ),

          // Blockquotes más sutiles
          blockquote: ({ children }) => (
            <blockquote className={cn(
              "border-l-4 border-primary pl-3 italic text-muted-foreground bg-muted/30 rounded-r",
              compact ? "my-2 py-1 text-sm" : "my-3 py-2"
            )}>
              {children}
            </blockquote>
          ),

          // Enlaces con estilos de proyecto
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Imágenes optimizadas con preset de proyecto
          img: ({ src, alt }) => (
            src ? (
              <div className={cn(compact ? "my-3" : "my-4")}>
                <OptimizedImage 
                  src={src} 
                  alt={alt || ''} 
                  preset="project"
                  className="rounded-lg border max-w-full h-auto mx-auto shadow-sm"
                  lazy={true}
                  showSkeleton={true}
                />
                {alt && (
                  <p className={cn(
                    "text-center text-muted-foreground mt-2 italic",
                    compact ? "text-xs" : "text-sm"
                  )}>
                    {alt}
                  </p>
                )}
              </div>
            ) : null
          ),

          // Tablas más compactas
          table: ({ children }) => (
            <div className={cn(
              "overflow-x-auto",
              compact ? "my-3" : "my-4"
            )}>
              <table className="w-full border-collapse border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className={cn(
              "border border-border bg-muted text-left font-semibold",
              compact ? "px-2 py-1 text-sm" : "px-3 py-2"
            )}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={cn(
              "border border-border",
              compact ? "px-2 py-1 text-sm" : "px-3 py-2"
            )}>
              {children}
            </td>
          ),

          // Separadores más sutiles
          hr: () => (
            <hr className={cn(
              "border-border",
              compact ? "my-4" : "my-6"
            )} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Exportar también una versión compacta para listas
export function ProjectMarkdownRendererCompact({ content, className }: Omit<ProjectMarkdownRendererProps, 'compact'>) {
  return (
    <ProjectMarkdownRenderer 
      content={content} 
      className={className} 
      compact={true} 
    />
  );
}