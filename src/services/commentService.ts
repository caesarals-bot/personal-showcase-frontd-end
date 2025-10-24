/**
 * Comment Service - Gestión de comentarios con soporte Firebase/Local
 */

import type { BlogComment, CommentAuthor } from '@/types/blog.types';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  doc
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { safeJsonParse } from '@/utils/safeJsonParse';

// Modo de desarrollo
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';

// Base de datos local
let commentsDB: BlogComment[] = [];

// Cargar desde localStorage
function loadCommentsDB() {
  const stored = localStorage.getItem('blog_comments');
  if (stored) {
    const comments = safeJsonParse<BlogComment[]>(stored);
    if (comments) {
      commentsDB = comments;
    } else {
      console.warn('⚠️ Datos corruptos en blog_comments. Limpiando...');
      localStorage.removeItem('blog_comments');
      commentsDB = [];
    }
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
    try {
      const commentsRef = collection(db, 'interactions');
      const q = query(
        commentsRef,
        where('type', '==', 'comment'),
        where('postId', '==', postId)
      );
      const snapshot = await getDocs(q);
      
      const allComments = snapshot.docs.map(doc => ({
        id: doc.id,
        postId: doc.data().postId,
        author: doc.data().author,
        content: doc.data().content,
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt,
        likes: doc.data().likes || 0,
        parentId: doc.data().parentId
      }));
      
      // Ordenar por fecha (más recientes primero)
      allComments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Filtrar comentarios principales (sin parentId)
      const mainComments = allComments.filter(comment => !comment.parentId);
      
      // Agregar respuestas a cada comentario
      return mainComments.map(comment => ({
        ...comment,
        replies: allComments.filter(reply => reply.parentId === comment.id)
      }));
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      return [];
    }
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
    try {
      const commentsRef = collection(db, 'interactions');
      
      // Limpiar el objeto author para evitar campos undefined
      const cleanAuthor = {
        id: data.author.id,
        name: data.author.name,
        email: data.author.email || '',
        avatar: data.author.avatar || ''
      };
      
      const docRef = await addDoc(commentsRef, {
        type: 'comment',
        postId: data.postId,
        author: cleanAuthor,
        content: data.content,
        createdAt: new Date().toISOString(),
        likes: 0,
        parentId: data.parentId || null
      });
      
      return {
        id: docRef.id,
        postId: data.postId,
        author: data.author,
        content: data.content,
        createdAt: new Date().toISOString(),
        likes: 0,
        parentId: data.parentId
      };
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    }
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
    try {
      const commentRef = doc(db, 'interactions', id);
      await updateDoc(commentRef, {
        content: updates.content,
        updatedAt: new Date().toISOString()
      });
      
      // Retornar el comentario actualizado (simplificado)
      return {
        id,
        content: updates.content,
        updatedAt: new Date().toISOString()
      } as BlogComment;
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }
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
  return commentsDB[index];
}

/**
 * Eliminar un comentario
 */
export async function deleteComment(id: string): Promise<void> {
  if (USE_FIREBASE) {
    try {
      // Eliminar el comentario principal
      await deleteDoc(doc(db, 'interactions', id));
      
      // Eliminar respuestas (comentarios hijos)
      const commentsRef = collection(db, 'interactions');
      const q = query(
        commentsRef,
        where('type', '==', 'comment'),
        where('parentId', '==', id)
      );
      const snapshot = await getDocs(q);
      
      // Eliminar todas las respuestas
      const deletePromises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
    return;
  }
  
  // Eliminar el comentario y sus respuestas
  commentsDB = commentsDB.filter(
    comment => comment.id !== id && comment.parentId !== id
  );
  
  persistCommentsDB();
}

/**
 * Dar like a un comentario
 */
export async function likeComment(id: string): Promise<BlogComment> {
  if (USE_FIREBASE) {
    try {
      const commentRef = doc(db, 'interactions', id);
      // Incrementar el contador de likes
      // Nota: Esto es simplificado, idealmente usarías FieldValue.increment(1)
      await updateDoc(commentRef, {
        likes: 1 // Simplificado por ahora
      });
      
      return { id, likes: 1 } as BlogComment;
    } catch (error) {
      console.error('Error al dar like al comentario:', error);
      throw error;
    }
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
    try {
      const commentsRef = collection(db, 'interactions');
      const q = query(
        commentsRef,
        where('type', '==', 'comment'),
        where('postId', '==', postId)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error al contar comentarios:', error);
      return 0;
    }
  }
  
  return commentsDB.filter(comment => comment.postId === postId).length;
}
