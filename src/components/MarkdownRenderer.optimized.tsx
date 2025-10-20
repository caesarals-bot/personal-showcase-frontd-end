import ReactMarkdown from 'react-markdown';
import { lazy, Suspense, useState, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
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

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Componente de loading para el syntax highlighter
const CodeLoader = () => (
  <div className="bg-muted rounded-lg p-4 my-6 animate-pulse">
    <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
    <div className="h-4 bg-muted-foreground/20 rounded mb-2 w-3/4"></div>
    <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
  </div>
);

// Componente de código optimizado
const CodeBlock = ({ language, children, theme }: { language: string; children: string; theme: string }) => {
  const [themes, setThemes] = useState<any>(null);

  useEffect(() => {
    loadThemes().then(setThemes);
  }, []);

  if (!themes) {
    return <CodeLoader />;
  }

  const syntaxTheme = theme === 'dark' ? themes.oneDark : themes.oneLight;

  return (
    <div className="relative my-6">
      {/* Etiqueta del lenguaje */}
      <div className="absolute top-0 left-4 -translate-y-1/2 z-10">
        <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
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
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
        >
          {children}
        </SyntaxHighlighter>
      </Suspense>
    </div>
  );
};

export function MarkdownRendererOptimized({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme();

  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        components={{
          // Renderizar bloques de código con syntax highlighting optimizado
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <CodeBlock 
                language={language} 
                theme={theme || 'light'}
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
          
          // Personalizar otros elementos (sin cambios)
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0 border-b pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3 border-b pb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-5 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-7">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-6">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <div className="my-6">
              <img 
                src={src} 
                alt={alt} 
                className="rounded-lg border max-w-full h-auto mx-auto shadow-sm"
                loading="lazy"
              />
              {alt && (
                <p className="text-center text-sm text-muted-foreground mt-2 italic">
                  {alt}
                </p>
              )}
            </div>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-8 border-border" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}