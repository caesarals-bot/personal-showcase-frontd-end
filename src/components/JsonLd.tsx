/**
 * JsonLd - Componente para inyectar structured data (schema.org)
 *
 * Soporta los tipos principales:
 * - Article / BlogPosting: posts del blog
 * - Person: autor del sitio
 * - WebSite: sitio raíz con SearchAction
 * - BreadcrumbList: navegación de migas de pan
 * - Organization: empresa/marca
 *
 * Google usa estos datos para generar rich snippets en resultados
 * (autor, fecha publicación, breadcrumbs, FAQ, etc.).
 *
 * Props:
 * - data: objeto que se serializa a JSON-LD. Schema.org types permitidos.
 *
 * Ejemplo:
 *   <JsonLd data={{
 *     "@context": "https://schema.org",
 *     "@type": "Article",
 *     headline: "Mi post",
 *     author: { "@type": "Person", name: "César" }
 *   }} />
 */

import { useEffect } from 'react'

export type JsonLdData = Record<string, unknown>

interface JsonLdProps {
  data: JsonLdData | JsonLdData[]
  /** id del script para cleanup (opcional) */
  id?: string
}

function serializeData(data: JsonLdData | JsonLdData[]): string {
  return JSON.stringify(data)
}

export function JsonLd({ data, id = 'json-ld' }: JsonLdProps) {
  useEffect(() => {
    const script = document.getElementById(id) as HTMLScriptElement | null

    if (script) {
      script.textContent = serializeData(data)
    } else {
      const newScript = document.createElement('script')
      newScript.id = id
      newScript.type = 'application/ld+json'
      newScript.textContent = serializeData(data)
      document.head.appendChild(newScript)
    }

    return () => {
      const el = document.getElementById(id)
      if (el) el.remove()
    }
  }, [data, id])

  return null
}

/**
 * Helpers para construir payloads JSON-LD comunes.
 */
export const SchemaBuilders = {
  article: (params: {
    headline: string
    description: string
    url: string
    image?: string
    authorName: string
    authorUrl?: string
    publishedTime?: string
    modifiedTime?: string
    section?: string
    keywords?: string[]
    inLanguage?: string
  }): JsonLdData => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: params.headline,
    description: params.description,
    url: params.url,
    ...(params.image ? { image: params.image } : {}),
    author: {
      '@type': 'Person',
      name: params.authorName,
      ...(params.authorUrl ? { url: params.authorUrl } : {}),
    },
    publisher: {
      '@type': 'Person',
      name: params.authorName,
    },
    ...(params.publishedTime ? { datePublished: params.publishedTime } : {}),
    ...(params.modifiedTime ? { dateModified: params.modifiedTime } : {}),
    ...(params.section ? { articleSection: params.section } : {}),
    ...(params.keywords ? { keywords: params.keywords.join(', ') } : {}),
    ...(params.inLanguage ? { inLanguage: params.inLanguage } : {}),
  }),

  person: (params: {
    name: string
    url: string
    jobTitle?: string
    description?: string
    image?: string
    sameAs?: string[]
  }): JsonLdData => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: params.name,
    url: params.url,
    ...(params.jobTitle ? { jobTitle: params.jobTitle } : {}),
    ...(params.description ? { description: params.description } : {}),
    ...(params.image ? { image: params.image } : {}),
    ...(params.sameAs ? { sameAs: params.sameAs } : {}),
  }),

  website: (params: {
    name: string
    url: string
    description?: string
    inLanguage?: string
  }): JsonLdData => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: params.name,
    url: params.url,
    ...(params.description ? { description: params.description } : {}),
    ...(params.inLanguage ? { inLanguage: params.inLanguage } : {}),
  }),

  breadcrumb: (
    items: Array<{ name: string; url: string }>
  ): JsonLdData => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
}
