/**
 * Like Service - Gestión de likes con soporte Firebase/Local
 */

import type { BlogLike } from '@/types/blog.types';

// Modo de desarrollo
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';

// Base de datos local
let likesDB: BlogLike[] = [];

// Cargar desde localStorage
function loadLikesDB() {
  const stored = localStorage.getItem('blog_likes');
  if (stored) {
    likesDB = JSON.parse(stored);
  }
}

// Guardar en localStorage
function persistLikesDB() {
  localStorage.setItem('blog_likes', JSON.stringify(likesDB));
}

// Inicializar
loadLikesDB();

/**
 * Verificar si un usuario ya dio like a un post
 */
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    return false;
  }
  
  return likesDB.some(like => like.postId === postId && like.userId === userId);
}

/**
 * Dar like a un post
 */
export async function likePost(postId: string, userId: string): Promise<BlogLike> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    throw new Error('Firebase no implementado aún');
  }
  
  // Verificar si ya dio like
  const existingLike = likesDB.find(
    like => like.postId === postId && like.userId === userId
  );
  
  if (existingLike) {
    throw new Error('Ya diste like a este post');
  }
  
  // Crear nuevo like
  const newLike: BlogLike = {
    id: `like-${Date.now()}`,
    postId,
    userId,
    createdAt: new Date().toISOString(),
  };
  
  likesDB.push(newLike);
  persistLikesDB();
  
  return newLike;
}

/**
 * Quitar like de un post
 */
export async function unlikePost(postId: string, userId: string): Promise<void> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    throw new Error('Firebase no implementado aún');
  }
  
  const index = likesDB.findIndex(
    like => like.postId === postId && like.userId === userId
  );
  
  if (index === -1) {
    throw new Error('No has dado like a este post');
  }
  
  likesDB.splice(index, 1);
  persistLikesDB();
}

/**
 * Obtener cantidad de likes de un post
 */
export async function getPostLikesCount(postId: string): Promise<number> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    return 0;
  }
  
  return likesDB.filter(like => like.postId === postId).length;
}

/**
 * Obtener todos los likes de un post
 */
export async function getPostLikes(postId: string): Promise<BlogLike[]> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    return [];
  }
  
  return likesDB.filter(like => like.postId === postId);
}
