/**
 * site.ts - Constantes globales del sitio
 *
 * Centraliza URLs, datos del autor y configuración SEO base.
 * Usar SIEMPRE estas constantes en lugar de hardcodear URLs.
 */

const DEFAULT_SITE_URL = 'https://xn--cesarlondoo-beb.dev'

export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined) || DEFAULT_SITE_URL

export const SITE_NAME = 'César Londoño - Full Stack Developer'

export const SITE_DESCRIPTION =
  'Full Stack Developer especializado en React, Vue.js, Ruby on Rails y Firebase. Portfolio personal con blog técnico sobre desarrollo web, arquitectura de software y mejores prácticas.'

export const SITE_KEYWORDS = [
  'césar londoño',
  'full stack developer',
  'react',
  'vue.js',
  'ruby on rails',
  'typescript',
  'firebase',
  'desarrollo web',
  'portfolio',
  'blog técnico',
  'colombia',
  'latam',
]

export const AUTHOR = {
  name: 'César Londoño',
  jobTitle: 'Full Stack Developer',
  email: 'proyectosenevolucion@gmail.com',
  twitter: '@cesarlondono',
  github: 'caesarals',
  linkedin: 'cesarlondono',
  avatar: '/comic-team-web.webp',
}

export const SOCIAL_PROFILES = [
  'https://github.com/caesarals',
  'https://linkedin.com/in/cesarlondono',
  'https://twitter.com/cesarlondono',
]

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`
export const DEFAULT_OG_IMAGE_WIDTH = 1200
export const DEFAULT_OG_IMAGE_HEIGHT = 630

export const NAV_ROUTES = {
  home: '/',
  about: '/about',
  portfolio: '/portfolio',
  blog: '/blog',
  contact: '/contactame',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  admin: '/admin',
} as const

export const ROBOTS_CONFIG = {
  public: 'index, follow',
  admin: 'noindex, nofollow',
} as const
