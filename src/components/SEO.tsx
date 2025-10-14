/**
 * SEO Component
 * Componente para gestionar meta tags dinámicos y SEO
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOProps {
    title?: string
    description?: string
    keywords?: string[]
    author?: string
    image?: string
    url?: string
    type?: 'website' | 'article' | 'profile'
    publishedTime?: string
    modifiedTime?: string
    section?: string
    tags?: string[]
}

const DEFAULT_SEO = {
    title: 'Portfolio Personal | Desarrollo Web',
    description: 'Portfolio personal de desarrollo web con blog interactivo. Sistema de filtros, likes, comentarios y autenticación. Diseño moderno con modo dark y responsive design. Construido con React, TypeScript y Firebase.',
    keywords: ['desarrollo web', 'react', 'typescript', 'firebase', 'portfolio', 'blog', 'frontend', 'fullstack'],
    author: 'Desarrollador Web',
    image: '/logocesar.svg',
    type: 'website' as const
}

export default function SEO({
    title,
    description,
    keywords,
    author,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    section,
    tags
}: SEOProps) {
    const location = useLocation()

    // Construir título completo
    const fullTitle = title 
        ? `${title} | Portfolio Personal`
        : DEFAULT_SEO.title

    // Usar valores por defecto si no se proporcionan
    const seoDescription = description || DEFAULT_SEO.description
    const seoKeywords = keywords || DEFAULT_SEO.keywords
    const seoAuthor = author || DEFAULT_SEO.author
    const seoImage = image || DEFAULT_SEO.image
    const seoUrl = url || `${window.location.origin}${location.pathname}`

    useEffect(() => {
        // Actualizar título
        document.title = fullTitle

        // Función helper para actualizar o crear meta tag
        const updateMetaTag = (name: string, content: string, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name'
            let element = document.querySelector(`meta[${attribute}="${name}"]`)
            
            if (!element) {
                element = document.createElement('meta')
                element.setAttribute(attribute, name)
                document.head.appendChild(element)
            }
            
            element.setAttribute('content', content)
        }

        // Meta tags básicos
        updateMetaTag('description', seoDescription)
        updateMetaTag('keywords', seoKeywords.join(', '))
        updateMetaTag('author', seoAuthor)

        // Open Graph (Facebook, LinkedIn)
        updateMetaTag('og:title', fullTitle, true)
        updateMetaTag('og:description', seoDescription, true)
        updateMetaTag('og:image', seoImage, true)
        updateMetaTag('og:url', seoUrl, true)
        updateMetaTag('og:type', type, true)
        updateMetaTag('og:site_name', 'Portfolio Personal', true)

        // Twitter Card
        updateMetaTag('twitter:card', 'summary_large_image')
        updateMetaTag('twitter:title', fullTitle)
        updateMetaTag('twitter:description', seoDescription)
        updateMetaTag('twitter:image', seoImage)

        // Article specific (para posts de blog)
        if (type === 'article') {
            if (publishedTime) {
                updateMetaTag('article:published_time', publishedTime, true)
            }
            if (modifiedTime) {
                updateMetaTag('article:modified_time', modifiedTime, true)
            }
            if (section) {
                updateMetaTag('article:section', section, true)
            }
            if (tags && tags.length > 0) {
                tags.forEach(tag => {
                    const tagElement = document.createElement('meta')
                    tagElement.setAttribute('property', 'article:tag')
                    tagElement.setAttribute('content', tag)
                    document.head.appendChild(tagElement)
                })
            }
            if (seoAuthor) {
                updateMetaTag('article:author', seoAuthor, true)
            }
        }

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
        if (!canonical) {
            canonical = document.createElement('link')
            canonical.setAttribute('rel', 'canonical')
            document.head.appendChild(canonical)
        }
        canonical.setAttribute('href', seoUrl)

        // Robots
        updateMetaTag('robots', 'index, follow')
        updateMetaTag('googlebot', 'index, follow')

        // Viewport (ya debería estar, pero por si acaso)
        let viewport = document.querySelector('meta[name="viewport"]')
        if (!viewport) {
            viewport = document.createElement('meta')
            viewport.setAttribute('name', 'viewport')
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0')
            document.head.appendChild(viewport)
        }

    }, [fullTitle, seoDescription, seoKeywords, seoAuthor, seoImage, seoUrl, type, publishedTime, modifiedTime, section, tags])

    // Este componente no renderiza nada visible
    return null
}

// Hook personalizado para usar SEO fácilmente
export function useSEO(props: SEOProps) {
    useEffect(() => {
        // El componente SEO se encarga de todo
    }, [props])

    return <SEO {...props} />
}
