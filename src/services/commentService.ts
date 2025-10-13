/**
 * Comment Service - Gestión de comentarios con soporte Firebase/Local
 */

import type { BlogComment, CommentAuthor } from '@/types/blog.types';

// Modo de desarrollo
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';

// Base de datos local
let commentsDB: BlogComment[] = [];

// Cargar desde localStorage
function loadCommentsDB() {
  const stored = localStorage.getItem('blog_comments');
  if (stored) {
    commentsDB = JSON.parse(stored);
  }
}

// Guardar en localStorage
function persistCommentsDB() {
  localStorage.setItem('blog_comments', JSON.stringify(commentsDB));
}

// Inicializar
loadCommentsDB();

/**
 * Obtener comentarios de un post
 */
export async function getPostComments(postId: string): Promise<BlogComment[]> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    return [];
  }
  
  // Filtrar comentarios del post (solo comentarios principales, no respuestas)
  const mainComments = commentsDB.filter(
    comment => comment.postId === postId && !comment.parentId
  );
  
  // Agregar respuestas a cada comentario
  return mainComments.map(comment => ({
    ...comment,
    replies: commentsDB.filter(reply => reply.parentId === comment.id),
  }));
}

/**
 * Crear un nuevo comentario
 */
export async function createComment(data: {
  postId: string;
  author: CommentAuthor;
  content: string;
  parentId?: string;
}): Promise<BlogComment> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    throw new Error('Firebase no implementado aún');
  }
  
  const newComment: BlogComment = {
    id: `comment-${Date.now()}`,
    postId: data.postId,
    author: data.author,
    content: data.content,
    createdAt: new Date().toISOString(),
    likes: 0,
    parentId: data.parentId,
  };
  
  commentsDB.push(newComment);
  persistCommentsDB();
  
  console.log('[CommentService] Comentario creado:', newComment);
  return newComment;
}

/**
 * Actualizar un comentario
 */
export async function updateComment(
  id: string,
  updates: {
    content: string;
  }
): Promise<BlogComment> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    throw new Error('Firebase no implementado aún');
  }
  
  const index = commentsDB.findIndex(comment => comment.id === id);
  if (index === -1) {
    throw new Error('Comentario no encontrado');
  }
  
  commentsDB[index] = {
    ...commentsDB[index],
    content: updates.content,
    updatedAt: new Date().toISOString(),
  };
  
  persistCommentsDB();
  console.log('[CommentService] Comentario actualizado');
  return commentsDB[index];
}

/**
 * Eliminar un comentario
 */
export async function deleteComment(id: string): Promise<void> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    throw new Error('Firebase no implementado aún');
  }
  
  // Eliminar el comentario y sus respuestas
  commentsDB = commentsDB.filter(
    comment => comment.id !== id && comment.parentId !== id
  );
  
  persistCommentsDB();
  console.log('[CommentService] Comentario eliminado');
}

/**
 * Dar like a un comentario
 */
export async function likeComment(id: string): Promise<BlogComment> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    throw new Error('Firebase no implementado aún');
  }
  
  const index = commentsDB.findIndex(comment => comment.id === id);
  if (index === -1) {
    throw new Error('Comentario no encontrado');
  }
  
  commentsDB[index].likes += 1;
  persistCommentsDB();
  
  return commentsDB[index];
}

/**
 * Obtener cantidad de comentarios de un post (incluyendo respuestas)
 */
export async function getPostCommentsCount(postId: string): Promise<number> {
  if (USE_FIREBASE) {
    // TODO: Implementar con Firebase
    return 0;
  }
  
  return commentsDB.filter(comment => comment.postId === postId).length;
}
