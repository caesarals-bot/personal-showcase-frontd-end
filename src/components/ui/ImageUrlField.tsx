/**
 * ImageUrlField - Campo combinado para gestión de URL de imagen
 *
 * Combina:
 * - Input manual de URL (cualquier origen: ImageKit, Firebase legacy, /public, http)
 * - Botón de subida vía ImageSelector (preset parametrizable)
 * - Preview en vivo
 * - Display de URL para copiar
 *
 * Sin filtros de Firebase Storage: el componente es agnóstico al proveedor.
 * La validación de origen se delega al consumidor si la necesita.
 */

import { Image as ImageIcon } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import ImageSelector from './ImageSelector';
import { ImageUrlDisplay } from './ImageUrlDisplay';

export interface ImageUrlFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (url: string) => void;
  onFileIdChange?: (fileId: string) => void;
  preset?: 'about' | 'featured' | 'gallery' | 'blog' | 'project' | 'avatar';
  required?: boolean;
  helperText?: string;
  sectionTitle?: string;
}

export function ImageUrlField({
  id = 'image-url-field',
  label = 'URL de la imagen',
  placeholder = '/imagen.webp o https://ik.imagekit.io/...',
  value,
  onChange,
  onFileIdChange,
  preset = 'about',
  required = false,
  helperText,
  sectionTitle,
}: ImageUrlFieldProps) {
  const helperId = `${id}-helper`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={id}>
          <ImageIcon className="inline h-4 w-4 mr-2" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={helperText ? helperId : undefined}
        />
        {helperText && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>

      <div className="space-y-3 border-t pt-4">
        <div className="space-y-1">
          <Label className="text-sm font-medium">
            <ImageIcon className="inline h-4 w-4 mr-2" />
            Subir nueva imagen
          </Label>
          <p className="text-xs text-muted-foreground">
            Sube una imagen optimizada que reemplace la URL actual
            {sectionTitle ? ` para "${sectionTitle}"` : ''}.
          </p>
        </div>
        <ImageSelector
          value={value}
          onChange={(url) => onChange(url)}
          onImageUploaded={onFileIdChange ? (info) => onFileIdChange(info.fileId) : undefined}
          preset={preset}
          multiple={false}
          maxFiles={1}
        />
      </div>

      {value && (
        <div className="space-y-3 border-t pt-4">
          <div className="space-y-2">
            <Label>Vista previa</Label>
            <div className="border rounded-lg p-3 bg-muted/30 flex items-center justify-center min-h-[160px]">
              <img
                src={value}
                alt="Vista previa"
                className="max-h-48 rounded-md object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>URL para copiar</Label>
            <ImageUrlDisplay urls={[value]} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUrlField;