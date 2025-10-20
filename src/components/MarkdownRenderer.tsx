import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { OptimizedImage } from './ui/OptimizedImage'
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme();
  
  // Determinar el tema del syntax highlighter basado en el tema actual
  const syntaxTheme = theme === 'dark' ? oneDark : oneLight;

  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Renderizar bloques de código con syntax highlighting
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <div className="relative my-6">
                {/* Etiqueta del lenguaje */}
                <div className="absolute top-0 left-4 -translate-y-1/2 z-10">
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
                    {language}
                  </span>
                </div>
                
                {/* Bloque de código */}
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
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code 
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border" 
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // Personalizar otros elementos
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
            src ? (
              <div className="my-6">
                <OptimizedImage 
                  src={src} 
                  alt={alt || ''} 
                  preset="blog"
                  className="rounded-lg border max-w-full h-auto mx-auto shadow-sm"
                  lazy={true}
                  showSkeleton={true}
                />
                {alt && (
                  <p className="text-center text-sm text-muted-foreground mt-2 italic">
                    {alt}
                  </p>
                )}
              </div>
            ) : null
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