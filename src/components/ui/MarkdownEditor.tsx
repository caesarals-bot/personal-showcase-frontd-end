/**
 * MarkdownEditor - Editor de markdown con vista previa en tiempo real
 * 
 * Características:
 * - Editor de texto con sintaxis markdown
 * - Vista previa en tiempo real
 * - Modo de pantalla dividida
 * - Botones de ayuda para markdown
 * - Soporte para ProjectMarkdownRenderer
 */

import { useState } from 'react';
import { Eye, Edit, HelpCircle, Bold, Italic, Link, Code, List, Quote } from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { ProjectMarkdownRenderer } from '../ProjectMarkdownRenderer';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  compact?: boolean;
  showHelp?: boolean;
}

// Botones de ayuda para markdown
const markdownHelpers = [
  { icon: Bold, label: 'Negrita', syntax: '**texto**' },
  { icon: Italic, label: 'Cursiva', syntax: '*texto*' },
  { icon: Link, label: 'Enlace', syntax: '[texto](url)' },
  { icon: Code, label: 'Código', syntax: '`código`' },
  { icon: List, label: 'Lista', syntax: '- elemento' },
  { icon: Quote, label: 'Cita', syntax: '> cita' },
];

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Escribe tu contenido en markdown...",
  className,
  rows = 8,
  compact = false,
  showHelp = true
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const insertMarkdown = (syntax: string) => {
    const textarea = document.querySelector('textarea[data-markdown-editor]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText = '';
    if (syntax.includes('texto')) {
      newText = syntax.replace('texto', selectedText || 'texto');
    } else if (syntax.includes('url')) {
      newText = syntax.replace('url', 'https://ejemplo.com');
    } else {
      newText = syntax;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // Restaurar el foco y la selección
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className={cn("markdown-editor", className)}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
        {/* Header con tabs y botones de ayuda */}
        <div className="flex items-center justify-between mb-2">
          <TabsList className="grid w-auto grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vista Previa
            </TabsTrigger>
          </TabsList>

          {/* Botones de ayuda */}
          {showHelp && (
            <div className="flex items-center gap-1">
              <TooltipProvider>
                {markdownHelpers.map((helper, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertMarkdown(helper.syntax)}
                        className="h-8 w-8 p-0"
                      >
                        <helper.icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <div className="font-medium">{helper.label}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {helper.syntax}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                
                {/* Botón de ayuda general */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open('https://www.markdownguide.org/basic-syntax/', '_blank')}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div>Guía de Markdown</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Contenido de las tabs */}
        <TabsContent value="edit" className="mt-0">
          <Textarea
            data-markdown-editor
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="font-mono text-sm resize-none"
          />
          
          {/* Ayuda rápida */}
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Tip:</span> Usa markdown para formatear tu texto. 
            Selecciona texto y usa los botones de arriba para aplicar formato rápidamente.
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className={cn(
            "border rounded-md p-4 min-h-[200px] bg-background",
            compact && "min-h-[150px]"
          )}>
            {value.trim() ? (
              <ProjectMarkdownRenderer 
                content={value} 
                compact={compact}
              />
            ) : (
              <div className="text-muted-foreground text-center py-8">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>La vista previa aparecerá aquí</p>
                <p className="text-xs mt-1">Escribe algo en el editor para ver el resultado</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Versión compacta para formularios
export function MarkdownEditorCompact(props: Omit<MarkdownEditorProps, 'compact' | 'rows'>) {
  return (
    <MarkdownEditor 
      {...props} 
      compact={true} 
      rows={6}
    />
  );
}