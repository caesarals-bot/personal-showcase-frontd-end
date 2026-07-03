/**
 * fetch-published-posts.ts
 *
 * Consulta Firestore REST API para obtener los posts publicados.
 * Usado por el plugin Vite en build time para generar sitemap.xml.
 *
 * Requiere variables de entorno:
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_API_KEY (opcional, para rules con auth)
 *
 * Si la consulta falla, devuelve array vacío (no rompe el build).
 */

export interface PublishedPost {
  slug: string
  updatedAt?: string
  publishedAt?: string
  title?: string
  excerpt?: string
  image?: string
}

export interface PublishedProject {
  slug: string
  updatedAt?: string
  title?: string
  description?: string
  image?: string
}

interface FirestoreDocument {
  name?: string
  fields?: Record<string, FirestoreValue>
}

interface FirestoreValue {
  stringValue?: string
  timestampValue?: string
  mapValue?: { fields?: Record<string, FirestoreValue> }
  arrayValue?: { values?: FirestoreValue[] }
}

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID

function extractString(value: FirestoreValue | undefined): string | undefined {
  if (!value) return undefined
  if (value.stringValue !== undefined) return value.stringValue
  if (value.timestampValue !== undefined) return value.timestampValue
  return undefined
}

function extractSlug(doc: FirestoreDocument): string | undefined {
  const fields = doc.fields || {}
  return (
    extractString(fields.slug) ??
    extractString(fields.slugValue) ??
    extractString(fields.url) ??
    fields.id?.stringValue
  )
}

function extractTimestamp(doc: FirestoreDocument, keys: string[]): string | undefined {
  const fields = doc.fields || {}
  for (const key of keys) {
    const value = extractString(fields[key])
    if (value) return value
  }
  return undefined
}

function extractNestedString(
  doc: FirestoreDocument,
  parentKey: string,
  childKey: string
): string | undefined {
  const parent = doc.fields?.[parentKey]
  if (!parent?.mapValue?.fields) return undefined
  return extractString(parent.mapValue.fields[childKey])
}

/**
 * Consulta una colección de Firestore vía REST API pública.
 * Solo lectura. Usa queries simples (where + orderBy).
 */
async function fetchCollection<T>(
  collection: string,
  mapper: (doc: FirestoreDocument, id: string) => T | null
): Promise<T[]> {
  if (!PROJECT_ID) {
    console.warn(`[sitemap] VITE_FIREBASE_PROJECT_ID no definido, omitiendo ${collection}`)
    return []
  }

  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/(default)/documents/${collection}?pageSize=100`

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      console.warn(
        `[sitemap] Firestore ${collection} HTTP ${response.status}: ${response.statusText}`
      )
      return []
    }

    const data = (await response.json()) as { documents?: FirestoreDocument[] }
    if (!data.documents) return []

    return data.documents
      .map((doc) => {
        const id = doc.name?.split('/').pop() || ''
        return mapper(doc, id)
      })
      .filter((item): item is T => item !== null)
  } catch (error) {
    console.warn(`[sitemap] Error fetching ${collection}:`, error)
    return []
  }
}

function isPublished(doc: FirestoreDocument, id: string): boolean {
  const fields = doc.fields || {}
  const status = extractString(fields.status)
  const isPublished = extractString(fields.isPublished)
  return status === 'published' || isPublished === 'true' || isPublished === 'true' || id.length > 0
}

export async function fetchPublishedPosts(): Promise<PublishedPost[]> {
  return fetchCollection<PublishedPost>('posts', (doc, id) => {
    if (!isPublished(doc, id)) return null
    const slug = extractSlug(doc) || id
    return {
      slug,
      title: extractString(doc.fields?.title),
      excerpt:
        extractString(doc.fields?.excerpt) ??
        extractString(doc.fields?.description) ??
        extractNestedString(doc, 'meta', 'description'),
      image:
        extractString(doc.fields?.coverImage) ??
        extractString(doc.fields?.image) ??
        extractNestedString(doc, 'meta', 'image'),
      publishedAt: extractTimestamp(doc, ['publishedAt', 'createdAt', 'date']),
      updatedAt: extractTimestamp(doc, ['updatedAt', 'modifiedAt']),
    }
  })
}

export async function fetchPublishedProjects(): Promise<PublishedProject[]> {
  return fetchCollection<PublishedProject>('projects', (doc, id) => {
    if (!isPublished(doc, id)) return null
    const slug = extractSlug(doc) || id
    return {
      slug,
      title: extractString(doc.fields?.title),
      description: extractString(doc.fields?.description),
      image: extractString(doc.fields?.image) ?? extractString(doc.fields?.coverImage),
      updatedAt: extractTimestamp(doc, ['updatedAt', 'modifiedAt', 'createdAt']),
    }
  })
}
