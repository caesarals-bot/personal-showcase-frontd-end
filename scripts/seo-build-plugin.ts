/**
 * seo-build-plugin.ts
 *
 * Plugin Vite que genera en build time:
 * - public/robots.txt (copia desde template con SITE_URL)
 * - dist/sitemap.xml (consultando Firestore vía REST API)
 *
 * Si la consulta a Firestore falla, genera un sitemap mínimo solo con
 * las rutas estáticas (no rompe el build).
 */

import type { Plugin } from 'vite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fetchPublishedPosts, fetchPublishedProjects } from './fetch-published-content'

const SITE_URL = process.env.VITE_SITE_URL || 'https://cesarlondoño.dev'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq: string
  priority: number
}

const STATIC_ROUTES: SitemapUrl[] = [
  { loc: '/', changefreq: 'weekly', priority: 1.0 },
  { loc: '/about', changefreq: 'monthly', priority: 0.8 },
  { loc: '/portfolio', changefreq: 'weekly', priority: 0.9 },
  { loc: '/blog', changefreq: 'daily', priority: 0.9 },
  { loc: '/contactame', changefreq: 'monthly', priority: 0.7 },
]

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toIsoDate(value: string | undefined): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString().split('T')[0]
}

function buildSitemapXml(urls: SitemapUrl[]): string {
  const entries = urls
    .map((url) => {
      const lastmodTag = url.lastmod
        ? `\n    <lastmod>${url.lastmod}</lastmod>`
        : ''
      return `  <url>
    <loc>${escapeXml(SITE_URL + url.loc)}</loc>${lastmodTag}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
}

function buildRobotsTxt(): string {
  return `# robots.txt - Generado en build

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth/
Disallow: /api/
Disallow: /*.json$

Sitemap: ${SITE_URL}/sitemap.xml
`
}

async function generateSitemap(): Promise<string> {
  console.log('[seo-build-plugin] Generando sitemap.xml...')

  const urls: SitemapUrl[] = [...STATIC_ROUTES]

  try {
    const [posts, projects] = await Promise.all([
      fetchPublishedPosts(),
      fetchPublishedProjects(),
    ])

    console.log(
      `[seo-build-plugin] Encontrados ${posts.length} posts y ${projects.length} proyectos`
    )

    for (const post of posts) {
      urls.push({
        loc: `/blog/${post.slug}`,
        lastmod: toIsoDate(post.updatedAt ?? post.publishedAt),
        changefreq: 'monthly',
        priority: 0.7,
      })
    }

    for (const project of projects) {
      urls.push({
        loc: `/portfolio/${project.slug}`,
        lastmod: toIsoDate(project.updatedAt),
        changefreq: 'monthly',
        priority: 0.7,
      })
    }
  } catch (error) {
    console.warn(
      '[seo-build-plugin] No se pudo consultar Firestore, sitemap solo con rutas estáticas:',
      error
    )
  }

  return buildSitemapXml(urls)
}

export function seoBuildPlugin(): Plugin {
  return {
    name: 'seo-build-plugin',
    apply: 'build',

    async closeBundle() {
      const root = process.cwd()
      const publicDir = resolve(root, 'public')
      const distDir = resolve(root, 'dist')

      const robotsContent = buildRobotsTxt()
      const sitemapContent = await generateSitemap()

      const robotsTargets = [resolve(publicDir, 'robots.txt'), resolve(distDir, 'robots.txt')]
      for (const target of robotsTargets) {
        try {
          writeFileSync(target, robotsContent, 'utf-8')
          console.log(`[seo-build-plugin] robots.txt -> ${target}`)
        } catch (error) {
          console.warn(`[seo-build-plugin] No se pudo escribir robots.txt en ${target}:`, error)
        }
      }

      const sitemapTargets = [
        resolve(publicDir, 'sitemap.xml'),
        resolve(distDir, 'sitemap.xml'),
      ]
      for (const target of sitemapTargets) {
        try {
          writeFileSync(target, sitemapContent, 'utf-8')
          console.log(`[seo-build-plugin] sitemap.xml -> ${target}`)
        } catch (error) {
          console.warn(
            `[seo-build-plugin] No se pudo escribir sitemap.xml en ${target}:`,
            error
          )
        }
      }
    },
  }
}
