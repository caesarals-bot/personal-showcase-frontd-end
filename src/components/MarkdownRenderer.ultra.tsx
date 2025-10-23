import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { lazy, Suspense, useState, useEffect, memo } from 'react';
import { useTheme } from '@/components/theme-provider';
import { OptimizedImage } from './ui/OptimizedImage';
import { cn } from '@/lib/utils';

// Lazy loading del syntax highlighter con importación selectiva
const SyntaxHighlighter = lazy(() => 
  import('react-syntax-highlighter').then(module => ({
    default: module.Prism
  }))
);

// Lazy loading de temas con cache
let themesCache: any = null;
const loadThemes = async () => {
  if (themesCache) return themesCache;
  
  const module = await import('react-syntax-highlighter/dist/esm/styles/prism');
  themesCache = {
    oneDark: module.oneDark,
    oneLight: module.oneLight
  };
  return themesCache;
};

// Lenguajes más comunes para importación selectiva
const COMMON_LANGUAGES = [
  'javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'css', 'html', 
  'json', 'markdown', 'bash', 'sql', 'yaml', 'xml'
];

// Cache para lenguajes cargados dinámicamente
const languageCache = new Map();

// Función para cargar lenguajes bajo demanda
const loadLanguage = async (language: string) => {
  if (languageCache.has(language)) {
    return languageCache.get(language);
  }

  try {
    // Solo cargar si es un lenguaje común o específicamente solicitado
    if (COMMON_LANGUAGES.includes(language.toLowerCase())) {
      const langModule = await import(`react-syntax-highlighter/dist/esm/languages/prism/${language}`);
      languageCache.set(language, langModule.default);
      return langModule.default;
    }
  } catch (error) {
    console.warn(`Failed to load language: ${language}`, error);
  }
  
  return null;
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
  preset?: 'blog' | 'project' | 'compact';
}

// Componente de loading optimizado
const CodeLoader = memo(() => (
  <div className="bg-muted rounded-lg p-4 my-6 animate-pulse border">
    <div className="flex items-center gap-2 mb-3">
      <div className="h-3 w-16 bg-muted-foreground/20 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-muted-foreground/20 rounded"></div>
      <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
      <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
    </div>
  </div>
));

// Componente de bloque de código optimizado
const CodeBlock = memo(({ language, children, theme }: {
  language: string;
  children: string;
  theme: string;
}) => {
  const [themes, setThemes] = useState<any>(null);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [loadedThemes] = await Promise.all([
        loadThemes(),
        loadLanguage(language)
      ]);
      setThemes(loadedThemes);
      setIsLanguageLoaded(true);
    };

    loadData();
  }, [language]);

  if (!themes || !isLanguageLoaded) {
    return <CodeLoader />;
  }

  const syntaxTheme = theme === 'dark' ? themes.oneDark : themes.oneLight;

  return (
    <div className="relative my-6">
      {/* Etiqueta del lenguaje */}
      <div className="absolute top-0 left-4 -translate-y-1/2 z-10">
        <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono font-medium">
          {language}
        </span>
      </div>
      
      {/* Bloque de código */}
      <Suspense fallback={<CodeLoader />}>
        <SyntaxHighlighter
          style={syntaxTheme}
          language={language}
          PreTag="div"
          className="rounded-lg border shadow-sm"
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            padding: '1.5rem 1rem 1rem 1rem',
          }}
          showLineNumbers={children.split('\n').length > 10}
          wrapLines={true}
          wrapLongLines={true}
        >
          {children}
        </SyntaxHighlighter>
      </Suspense>
    </div>
  );
});

// Componente principal optimizado
export const MarkdownRendererUltra = memo(({ 
  content, 
  className, 
  preset = 'blog' 
}: MarkdownRendererProps) => {
  const { theme } = useTheme();
  const isCompact = preset === 'compact';

  const components = {
    // Renderizar bloques de código con optimización avanzada
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

    // Títulos optimizados según preset
    h1: ({ children }: any) => (
      <h1 className={cn(
        "font-bold border-b pb-2 first:mt-0",
        isCompact ? "text-xl mt-4 mb-2" : "text-3xl mt-8 mb-4"
      )}>
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className={cn(
        "font-semibold border-b pb-1",
        isCompact ? "text-lg mt-3 mb-2" : "text-2xl mt-6 mb-3"
      )}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className={cn(
        "font-semibold",
        isCompact ? "text-base mt-3 mb-1" : "text-xl mt-5 mb-2"
      )}>
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className={cn(
        "font-semibold",
        isCompact ? "text-sm mt-2 mb-1" : "text-lg mt-4 mb-2"
      )}>
        {children}
      </h4>
    ),

    // Párrafos optimizados
    p: ({ children }: any) => (
      <p className={cn(
        "leading-relaxed",
        isCompact ? "mb-2 text-sm" : "mb-4 leading-7"
      )}>
        {children}
      </p>
    ),

    // Listas optimizadas
    ul: ({ children }: any) => (
      <ul className={cn(
        "list-disc list-inside ml-4",
        isCompact ? "mb-2 space-y-0.5" : "mb-4 space-y-1"
      )}>
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className={cn(
        "list-decimal list-inside ml-4",
        isCompact ? "mb-2 space-y-0.5" : "mb-4 space-y-1"
      )}>
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className={cn(
        isCompact ? "leading-5 text-sm" : "leading-6"
      )}>
        {children}
      </li>
    ),

    // Blockquotes
    blockquote: ({ children }: any) => (
      <blockquote className={cn(
        "border-l-4 border-primary pl-3 italic text-muted-foreground bg-muted/30 rounded-r",
        isCompact ? "my-2 py-1 text-sm" : "my-4 py-2"
      )}>
        {children}
      </blockquote>
    ),

    // Enlaces
    a: ({ href, children }: any) => (
      <a 
        href={href} 
        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    // Imágenes optimizadas
    img: ({ src, alt }: any) => (
      src ? (
        <div className={cn(isCompact ? "my-3" : "my-6")}>
          <OptimizedImage 
            src={src} 
            alt={alt || ''} 
            preset={preset === 'project' ? 'project' : 'blog'}
            className="rounded-lg border max-w-full h-auto mx-auto shadow-sm"
            lazy={true}
            showSkeleton={true}
          />
          {alt && (
            <p className={cn(
              "text-center text-muted-foreground mt-2 italic",
              isCompact ? "text-xs" : "text-sm"
            )}>
              {alt}
            </p>
          )}
        </div>
      ) : null
    ),

    // Tablas
    table: ({ children }: any) => (
      <div className={cn(
        "overflow-x-auto",
        isCompact ? "my-3" : "my-6"
      )}>
        <table className="w-full border-collapse border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className={cn(
        "border border-border bg-muted text-left font-semibold",
        isCompact ? "px-2 py-1 text-sm" : "px-4 py-2"
      )}>
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className={cn(
        "border border-border",
        isCompact ? "px-2 py-1 text-sm" : "px-4 py-2"
      )}>
        {children}
      </td>
    ),

    // Separadores
    hr: () => (
      <hr className={cn(
        "border-border",
        isCompact ? "my-4" : "my-8"
      )} />
    ),
  };

  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRendererUltra.displayName = 'MarkdownRendererUltra';