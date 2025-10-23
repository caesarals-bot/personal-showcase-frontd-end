import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'

const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true'

export interface SiteSettings {
  siteName?: string
  siteDescription?: string
  siteUrl?: string
  author?: {
    name?: string
    email?: string
    avatar?: string
  }
  social?: Record<string, string>
  features?: Record<string, boolean>
  homeHeroImageUrl?: string | null
  homeHeroImagePath?: string | null
  // Nuevo: configuración de textos del Home
  homeDynamicTitlesEnabled?: boolean
  homeDynamicTitles?: string[]
  homeStaticTitle?: string
  homeTagline?: string
  updatedAt?: string
}

const SETTINGS_DOC_PATH = ['settings', 'site'] as const

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!USE_FIREBASE) {
    return null
  }
  try {
    const ref = doc(db, SETTINGS_DOC_PATH[0], SETTINGS_DOC_PATH[1])
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const data = snap.data() as any
    return {
      siteName: data.siteName,
      siteDescription: data.siteDescription,
      siteUrl: data.siteUrl,
      author: data.author,
      social: data.social,
      features: data.features,
      homeHeroImageUrl: data.homeHeroImageUrl ?? null,
      homeHeroImagePath: data.homeHeroImagePath ?? null,
      homeDynamicTitlesEnabled: data.homeDynamicTitlesEnabled ?? true,
      homeDynamicTitles: data.homeDynamicTitles ?? ['Desarrollador web', 'Ingeniero informático'],
      homeStaticTitle: data.homeStaticTitle ?? 'Ingeniero informático y desarrollador web',
      homeTagline: data.homeTagline ?? 'Creando experiencias digitales memorables que fusionan diseño y tecnología para resolver problemas complejos.',
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAt
    }
  } catch (error) {
    console.error('Error leyendo Site Settings:', error)
    return null
  }
}

export async function getHomeHeroImage(): Promise<string | null> {
  const settings = await getSiteSettings()
  return settings?.homeHeroImageUrl ?? null
}

export async function setHomeHeroImage(url: string | null, path?: string | null): Promise<void> {
  if (!USE_FIREBASE) return
  try {
    const ref = doc(db, SETTINGS_DOC_PATH[0], SETTINGS_DOC_PATH[1])
    await updateDoc(ref, {
      homeHeroImageUrl: url ?? null,
      homeHeroImagePath: path ?? null,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error actualizando imagen de Home:', error)
    throw error
  }
}

// Nuevo: leer configuración de textos del Home
export async function getHomeTextSettings(): Promise<{
  dynamicEnabled: boolean
  titles: string[]
  staticTitle: string
  tagline: string
} | null> {
  const settings = await getSiteSettings()
  if (!settings) return null
  return {
    dynamicEnabled: settings.homeDynamicTitlesEnabled ?? true,
    titles: settings.homeDynamicTitles ?? ['Desarrollador web', 'Ingeniero informático'],
    staticTitle: settings.homeStaticTitle ?? 'Ingeniero informático y desarrollador web',
    tagline: settings.homeTagline ?? 'Creando experiencias digitales memorables que fusionan diseño y tecnología para resolver problemas complejos.',
  }
}

// Nuevo: actualizar configuración de textos del Home
export async function setHomeTextSettings(update: {
  dynamicEnabled?: boolean
  titles?: string[]
  staticTitle?: string
  tagline?: string
}): Promise<void> {
  if (!USE_FIREBASE) return
  try {
    const ref = doc(db, SETTINGS_DOC_PATH[0], SETTINGS_DOC_PATH[1])
    await updateDoc(ref, {
      homeDynamicTitlesEnabled: update.dynamicEnabled,
      homeDynamicTitles: update.titles,
      homeStaticTitle: update.staticTitle,
      homeTagline: update.tagline,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error actualizando textos de Home:', error)
    throw error
  }
}