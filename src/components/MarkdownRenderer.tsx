/**
 * MarkdownRenderer - Renderizador de markdown canónico del proyecto
 *
 * Stack:
 * - `react-markdown` + `remark-gfm` para parsear markdown.
 * - `prismjs` para syntax highlighting (tree-shakeable: solo importamos
 *   los lenguajes que se usan en el proyecto).
 * - `prism-react-renderer` para integrar Prism con React.
 *
 * Lenguajes registrados (subset): javascript, typescript, jsx, tsx, markup,
 * css, bash, json, markdown. Si necesitas uno nuevo:
 * 1. Agregar import al bloque de lenguajes.
 * 2. Verificar con `npm run build` (chunk adicional pequeño esperado).
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes, type PrismTheme } from 'prism-react-renderer';
import { memo } from 'react';
import { useTheme } from '@/components/theme-provider';
import { OptimizedImage } from './ui/OptimizedImage';
import { cn } from '@/lib/utils';

// Core de Prism + subset de lenguajes.
// Cada import registra 1 lenguaje en el core. NO importar todos los disponibles.
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

interface CodeBlockProps {
  language: string;
  children: string;
  theme: string;
}

const CodeBlock = memo(({ language, children, theme }: CodeBlockProps) => {
  const normalizedLang = language.toLowerCase();
  const grammar = Prism.languages[normalizedLang];

  if (!grammar) {
    return (
      <pre className="bg-muted rounded-lg border p-4 my-4 overflow-x-auto text-sm">
        <code className="font-mono">{children}</code>
      </pre>
    );
  }

  const prismTheme: PrismTheme =
    theme === 'dark' ? themes.nightOwl : themes.github;

  return (
    <div className="relative my-6">
      <div className="absolute top-0 left-4 -translate-y-1/2 z-10">
        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-mono font-medium">
          {language}
        </span>
      </div>
      <Highlight
        code={children}
        language={normalizedLang}
        theme={prismTheme}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(className, 'rounded-lg border shadow-sm')}
            style={{
              ...style,
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              padding: '1.5rem 1rem 1rem 1rem',
            }}
          >
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line });
              return (
                <div key={i} {...lineProps}>
                  {line.map((token, key) => {
                    const tokenProps = getTokenProps({ token });
                    return <span key={key} {...tokenProps} />;
                  })}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  preset?: 'blog' | 'project' | 'compact';
}

export function MarkdownRenderer({
  content,
  className,
  preset = 'blog',
}: MarkdownRendererProps) {
  const { theme } = useTheme();
  const isCompact = preset === 'compact';
  const imagePreset = preset === 'project' ? 'project' : 'blog';

  const components = {
    code({ inline, className: codeClassName, children }: {
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    }) {
      const match = /language-(\w+)/.exec(codeClassName || '');
      const language = match ? match[1] : '';

      if (!inline && language) {
        return (
          <CodeBlock
            language={language}
            theme={theme || 'light'}
            children={String(children).replace(/\n$/, '')}
          />
        );
      }

      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border">
          {children}
        </code>
      );
    },
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1
        className={cn(
          'font-bold border-b pb-2 first:mt-0',
          isCompact ? 'text-xl mt-4 mb-2' : 'text-3xl mt-8 mb-4'
        )}
      >
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2
        className={cn(
          'font-semibold border-b pb-1',
          isCompact ? 'text-lg mt-3 mb-2' : 'text-2xl mt-6 mb-3'
        )}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3
        className={cn(
          'font-semibold',
          isCompact ? 'text-base mt-3 mb-1' : 'text-xl mt-5 mb-2'
        )}
      >
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4
        className={cn(
          'font-semibold',
          isCompact ? 'text-sm mt-2 mb-1' : 'text-lg mt-4 mb-2'
        )}
      >
        {children}
      </h4>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p
        className={cn(
          'leading-relaxed',
          isCompact ? 'mb-2 text-sm' : 'mb-4 leading-7'
        )}
      >
        {children}
      </p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul
        className={cn(
          'list-disc list-inside ml-4',
          isCompact ? 'mb-2 space-y-0.5' : 'mb-4 space-y-1'
        )}
      >
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol
        className={cn(
          'list-decimal list-inside ml-4',
          isCompact ? 'mb-2 space-y-0.5' : 'mb-4 space-y-1'
        )}
      >
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className={cn(isCompact ? 'leading-5 text-sm' : 'leading-6')}>
        {children}
      </li>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote
        className={cn(
          'border-l-4 border-primary pl-3 italic text-muted-foreground bg-muted/30 rounded-r',
          isCompact ? 'my-2 py-1 text-sm' : 'my-4 py-2'
        )}
      >
        {children}
      </blockquote>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }: { src?: string; alt?: string }) =>
      src ? (
        <div className={cn(isCompact ? 'my-3' : 'my-6')}>
          <OptimizedImage
            src={src}
            alt={alt || ''}
            preset={imagePreset}
            className="rounded-lg border max-w-full h-auto mx-auto shadow-sm"
            lazy={true}
            showSkeleton={true}
          />
          {alt && (
            <p
              className={cn(
                'text-center text-muted-foreground mt-2 italic',
                isCompact ? 'text-xs' : 'text-sm'
              )}
            >
              {alt}
            </p>
          )}
        </div>
      ) : null,
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className={cn('overflow-x-auto', isCompact ? 'my-3' : 'my-6')}>
        <table className="w-full border-collapse border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th
        className={cn(
          'border border-border bg-muted text-left font-semibold',
          isCompact ? 'px-2 py-1 text-sm' : 'px-4 py-2'
        )}
      >
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td
        className={cn(
          'border border-border',
          isCompact ? 'px-2 py-1 text-sm' : 'px-4 py-2'
        )}
      >
        {children}
      </td>
    ),
    hr: () => (
      <hr className={cn('border-border', isCompact ? 'my-4' : 'my-8')} />
    ),
  };

  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Re-export para compatibilidad con código legacy.
export { MarkdownRenderer as MarkdownRendererOptimized };

export function MarkdownRendererCompact({
  content,
  className,
}: Omit<MarkdownRendererProps, 'preset'>) {
  return (
    <MarkdownRenderer content={content} className={className} preset="compact" />
  );
}
