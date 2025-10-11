// Logo: componente reutilizable del logotipo basado en un SVG público
// - Alineación: left | center | right
// - Color opcional: si se especifica, colorea el logo usando CSS mask sobre el SVG
// - Tamaño opcional: width/height (px o cualquier unidad CSS)
// - Modo fluido: si fluid=true, el logo ocupa el 100% del ancho del contenedor y mantiene proporción vía aspect-ratio
// - Accesible: admite title para lectores de pantalla
//
// NOTA: el archivo SVG vive en /public y se sirve desde la raíz del sitio por Vite.
//       Si el SVG admite currentColor podrías simplificar a <img> + color de texto.

import React from 'react'

export type LogoAlign = 'left' | 'center' | 'right'

export interface LogoProps {
    align?: LogoAlign
    color?: string // ej: '#111', 'oklch(0.2 0 0)', 'hsl(var(--foreground))'
    width?: number | string // ej: 160, '10rem'
    height?: number | string // ej: 56, '3rem'
    /** Si es true, el logo se adapta al ancho del contenedor conservando la proporción */
    fluid?: boolean
    /** Relación de aspecto (ancho/alto). Por defecto 480/136 ~ 3.53 */
    aspectRatio?: number
    className?: string
    title?: string
}

// Ruta del SVG en /public
const LOGO_SRC = "/logocesar.svg"

const Logo: React.FC<LogoProps> = ({
    align = 'left',
    color,
    width = 160,
    height = 56,
    fluid = false,
    aspectRatio = 480 / 136,
    className = '',
    title = 'Logo de Cesar Londoño',
}) => {
    // Clases de alineación usando flexbox del contenedor wrapper
    const justify = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'

    // Normalizamos width/height a strings CSS
    const w = typeof width === 'number' ? `${width}px` : width
    const h = typeof height === 'number' ? `${height}px` : height

    // Estilos del contenedor cuando es fluido
    const fluidWrapperStyle: React.CSSProperties | undefined = fluid
        ? ({ width: '100%', aspectRatio } as React.CSSProperties)
        : undefined

    // Estilos del nodo gráfico (span con máscara o img)
    const graphicStyle: React.CSSProperties = fluid
        ? { width: '100%', height: '100%', display: 'inline-block', aspectRatio }
        : { width: w, height: h, display: 'inline-block' }

    return (
        <div className={`flex ${justify} ${className}`.trim()} style={fluidWrapperStyle}>
            {color ? (
                // Render con máscara para permitir colorear el SVG arbitrariamente
                <span
                    role="img"
                    aria-label={title}
                    title={title}
                    style={{
                        ...graphicStyle,
                        backgroundColor: color,
                        WebkitMaskImage: `url(${LOGO_SRC})`,
                        maskImage: `url(${LOGO_SRC})`,
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                    }}
                />
            ) : (
                // Render simple del SVG tal cual (sin colorización)
                <img
                    src={LOGO_SRC}
                    alt={title}
                    style={graphicStyle}
                />
            )}
        </div>
    )
}

export default Logo
