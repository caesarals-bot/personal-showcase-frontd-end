/**
 * Sistema de permisos basado en roles
 */

import type { PostStatus } from '@/types/blog.types'

export type UserRole = 'admin' | 'user' | 'guest'

/**
 * Verificar si el usuario puede crear posts
 */
export function canCreatePost(role: UserRole): boolean {
  return role === 'admin' || role === 'user'
}

/**
 * Verificar si el usuario puede editar un post
 */
export function canEditPost(role: UserRole, postAuthorId: string, currentUserId: string): boolean {
  if (role === 'admin') return true
  if (role === 'user' && postAuthorId === currentUserId) return true
  return false
}

/**
 * Verificar si el usuario puede eliminar un post
 */
export function canDeletePost(role: UserRole, postAuthorId: string, currentUserId: string): boolean {
  if (role === 'admin') return true
  if (role === 'user' && postAuthorId === currentUserId) return true
  return false
}

/**
 * Verificar si el usuario puede publicar directamente
 */
export function canPublishPost(role: UserRole): boolean {
  return role === 'admin'
}

/**
 * Verificar si el usuario puede aprobar posts
 */
export function canApprovePost(role: UserRole): boolean {
  return role === 'admin'
}

/**
 * Verificar si el usuario puede archivar posts
 */
export function canArchivePost(role: UserRole): boolean {
  return role === 'admin'
}

/**
 * Obtener estados permitidos para cambiar según el rol
 */
export function getAllowedStatusTransitions(
  role: UserRole,
  currentStatus: PostStatus,
  isAuthor: boolean
): PostStatus[] {
  // Admin puede cambiar a cualquier estado
  if (role === 'admin') {
    return ['draft', 'review', 'published', 'archived']
  }

  // User solo puede cambiar sus propios posts
  if (role === 'user' && isAuthor) {
    switch (currentStatus) {
      case 'draft':
        return ['draft', 'review'] // Puede guardar como borrador o enviar a revisión
      case 'review':
        return ['draft', 'review'] // Puede volver a borrador o mantener en revisión
      case 'published':
        return ['published'] // No puede cambiar posts publicados
      case 'archived':
        return ['archived'] // No puede cambiar posts archivados
      default:
        return []
    }
  }

  // Guest no puede cambiar estados
  return []
}

/**
 * Verificar si el usuario puede cambiar a un estado específico
 */
export function canChangeToStatus(
  role: UserRole,
  currentStatus: PostStatus,
  targetStatus: PostStatus,
  isAuthor: boolean
): boolean {
  const allowedStatuses = getAllowedStatusTransitions(role, currentStatus, isAuthor)
  return allowedStatuses.includes(targetStatus)
}

/**
 * Obtener el estado inicial al crear un post según el rol
 */
export function getInitialPostStatus(role: UserRole): PostStatus {
  if (role === 'admin') return 'draft' // Admin puede elegir
  if (role === 'user') return 'draft' // User siempre empieza en borrador
  return 'draft'
}

/**
 * Verificar si el usuario puede ver posts en un estado específico
 */
export function canViewPostsByStatus(role: UserRole, status: PostStatus): boolean {
  if (role === 'admin') return true // Admin ve todo
  if (role === 'user' && status === 'published') return true // User ve publicados
  if (role === 'guest' && status === 'published') return true // Guest solo ve publicados
  return false
}

/**
 * Obtener mensaje de ayuda para el estado según el rol
 */
export function getStatusHelpText(role: UserRole, status: PostStatus): string {
  if (role === 'admin') {
    switch (status) {
      case 'draft':
        return 'Borrador: El post está en edición y no es visible públicamente.'
      case 'review':
        return 'En Revisión: El post está listo para ser revisado antes de publicar.'
      case 'published':
        return 'Publicado: El post es visible en el blog público.'
      case 'archived':
        return 'Archivado: El post ya no es visible pero se mantiene guardado.'
    }
  }

  if (role === 'user') {
    switch (status) {
      case 'draft':
        return 'Borrador: Continúa editando. Cuando esté listo, envíalo a revisión.'
      case 'review':
        return 'En Revisión: Tu post está esperando aprobación del administrador.'
      case 'published':
        return 'Publicado: Tu post está visible en el blog. Solo el admin puede modificarlo.'
      case 'archived':
        return 'Archivado: Este post ya no está visible.'
    }
  }

  return ''
}

/**
 * Obtener acciones disponibles para un post según el rol
 */
export interface PostAction {
  id: string
  label: string
  icon: string
  variant: 'default' | 'destructive' | 'outline' | 'secondary'
  requiresConfirmation: boolean
}

export function getAvailablePostActions(
  role: UserRole,
  currentStatus: PostStatus,
  isAuthor: boolean
): PostAction[] {
  const actions: PostAction[] = []

  // Editar (si tiene permiso)
  if (canEditPost(role, 'author-id', 'current-user-id')) {
    actions.push({
      id: 'edit',
      label: 'Editar',
      icon: '✏️',
      variant: 'outline',
      requiresConfirmation: false,
    })
  }

  // Acciones específicas del admin
  if (role === 'admin') {
    if (currentStatus === 'review') {
      actions.push({
        id: 'approve',
        label: 'Aprobar y Publicar',
        icon: '✅',
        variant: 'default',
        requiresConfirmation: true,
      })
      actions.push({
        id: 'reject',
        label: 'Rechazar',
        icon: '❌',
        variant: 'destructive',
        requiresConfirmation: true,
      })
    }

    if (currentStatus === 'published') {
      actions.push({
        id: 'archive',
        label: 'Archivar',
        icon: '🗄️',
        variant: 'secondary',
        requiresConfirmation: true,
      })
    }

    actions.push({
      id: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      variant: 'destructive',
      requiresConfirmation: true,
    })
  }

  // Acciones para usuarios
  if (role === 'user' && isAuthor) {
    if (currentStatus === 'draft') {
      actions.push({
        id: 'submit-review',
        label: 'Enviar a Revisión',
        icon: '📤',
        variant: 'default',
        requiresConfirmation: false,
      })
    }

    if (currentStatus === 'review') {
      actions.push({
        id: 'back-to-draft',
        label: 'Volver a Borrador',
        icon: '↩️',
        variant: 'outline',
        requiresConfirmation: false,
      })
    }

    // Solo puede eliminar sus propios borradores
    if (currentStatus === 'draft') {
      actions.push({
        id: 'delete',
        label: 'Eliminar',
        icon: '🗑️',
        variant: 'destructive',
        requiresConfirmation: true,
      })
    }
  }

  return actions
}
