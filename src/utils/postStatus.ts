/**
 * Utilidades para manejar estados de posts
 */

import type { PostStatus } from '@/types/blog.types'

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Borrador',
  review: 'En Revisión',
  published: 'Publicado',
  archived: 'Archivado',
}

export const POST_STATUS_COLORS: Record<PostStatus, string> = {
  draft: '#94A3B8', // Gris
  review: '#F59E0B', // Amarillo
  published: '#10B981', // Verde
  archived: '#6B7280', // Gris oscuro
}

export const POST_STATUS_ICONS: Record<PostStatus, string> = {
  draft: '📝',
  review: '👁️',
  published: '✅',
  archived: '🗄️',
}

/**
 * Obtener label del estado
 */
export function getStatusLabel(status: PostStatus): string {
  return POST_STATUS_LABELS[status]
}

/**
 * Obtener color del estado
 */
export function getStatusColor(status: PostStatus): string {
  return POST_STATUS_COLORS[status]
}

/**
 * Obtener icono del estado
 */
export function getStatusIcon(status: PostStatus): string {
  return POST_STATUS_ICONS[status]
}

/**
 * Verificar si un post es visible públicamente
 */
export function isPostPublic(status: PostStatus): boolean {
  return status === 'published'
}

/**
 * Verificar si un post es editable
 */
export function isPostEditable(status: PostStatus): boolean {
  return status === 'draft' || status === 'review'
}
