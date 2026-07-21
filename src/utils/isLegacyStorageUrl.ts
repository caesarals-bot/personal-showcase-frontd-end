/**
 * Detecta si una URL apunta a Firebase Storage (proveedor legacy).
 *
 * Firebase Storage fue el proveedor de imágenes antes de la migración a
 * ImageKit (2026-07-14). Las URLs con este host ya no se sirven porque el
 * proyecto Firebase tiene Storage bloqueado (402 Payment Required).
 *
 * Usar para mostrar placeholder en UI y evitar peticiones inútiles.
 */
export function isLegacyStorageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  return (
    url.includes('firebasestorage.googleapis.com') ||
    url.includes('.firebasestorage.app/')
  )
}