/**
 * SEO Component
 * Componente para gestionar meta tags dinámicos y SEO
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
    SITE_URL,
    SITE_NAME,
    SITE_DESCRIPTION,
    SITE_KEYWORDS,
    AUTHOR,
    DEFAULT_OG_IMAGE,
    DEFAULT_OG_IMAGE_WIDTH,
    DEFAULT_OG_IMAGE_HEIGHT,
} from '@/constants/site'

interface SEOProps {
    title?: string
    description?: string
    keywords?: string[]
    author?: string
    image?: string
    imageWidth?: number
    imageHeight?: number
    url?: string
    type?: 'website' | 'article' | 'profile'
    publishedTime?: string
    modifiedTime?: string
    section?: string
    tags?: string[]
}

const DEFAULT_SEO = {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    author: AUTHOR.name,
    image: DEFAULT_OG_IMAGE,
    imageWidth: DEFAULT_OG_IMAGE_WIDTH,
    imageHeight: DEFAULT_OG_IMAGE_HEIGHT,
    type: 'website' as const,
}

function toAbsoluteUrl(url: string | undefined, base: string): string {
    if (!url) return `${base}${DEFAULT_OG_IMAGE}`
    if (/^https?:\/\//i.test(url)) return url
    if (url.startsWith('/')) return `${base}${url}`
    return `${base}/${url}`
}

export default function SEO({
    title,
    description,
    keywords,
    author,
    image,
    imageWidth,
    imageHeight,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    section,
    tags
}: SEOProps) {
    const location = useLocation()

    const fullTitle = title
        ? `${title} | ${AUTHOR.name}`
        : DEFAULT_SEO.title

    const seoDescription = description || DEFAULT_SEO.description
    const seoKeywords = keywords || DEFAULT_SEO.keywords
    const seoAuthor = author || DEFAULT_SEO.author
    const seoImage = toAbsoluteUrl(image || DEFAULT_SEO.image, SITE_URL)
    const seoImageWidth = imageWidth || DEFAULT_SEO.imageWidth
    const seoImageHeight = imageHeight || DEFAULT_SEO.imageHeight
    const seoUrl = url || `${SITE_URL}${location.pathname}`

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
        updateMetaTag('og:image:width', String(seoImageWidth), true)
        updateMetaTag('og:image:height', String(seoImageHeight), true)
        updateMetaTag('og:image:alt', fullTitle, true)
        updateMetaTag('og:url', seoUrl, true)
        updateMetaTag('og:type', type, true)
        updateMetaTag('og:site_name', SITE_NAME, true)
        updateMetaTag('og:locale', 'es_CO', true)

        // Twitter Card
        updateMetaTag('twitter:card', 'summary_large_image')
        updateMetaTag('twitter:title', fullTitle)
        updateMetaTag('twitter:description', seoDescription)
        updateMetaTag('twitter:image', seoImage)
        updateMetaTag('twitter:image:alt', fullTitle)
        if (AUTHOR.twitter) {
            updateMetaTag('twitter:creator', AUTHOR.twitter)
            updateMetaTag('twitter:site', AUTHOR.twitter)
        }

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

    }, [fullTitle, seoDescription, seoKeywords, seoAuthor, seoImage, seoImageWidth, seoImageHeight, seoUrl, type, publishedTime, modifiedTime, section, tags])

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
