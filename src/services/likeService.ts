/**
 * Like Service - Gestión de likes con soporte Firebase/Local
 */

import type { BlogLike } from '@/types/blog.types';
import { 
  collection, 
  addDoc, 
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
let likesDB: BlogLike[] = [];

// Cargar desde localStorage
function loadLikesDB() {
  const stored = localStorage.getItem('blog_likes');
  if (stored) {
    const likes = safeJsonParse<BlogLike[]>(stored);
    if (likes) {
      likesDB = likes;
    } else {
      console.warn('⚠️ Datos corruptos en blog_likes. Limpiando...');
      localStorage.removeItem('blog_likes');
      likesDB = [];
    }
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
    try {
      const likesRef = collection(db, 'interactions');
      const q = query(
        likesRef, 
        where('type', '==', 'like'),
        where('postId', '==', postId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error al verificar like:', error);
      return false;
    }
  }
  
  return likesDB.some(like => like.postId === postId && like.userId === userId);
}

/**
 * Dar like a un post
 */
export async function likePost(postId: string, userId: string): Promise<BlogLike> {
  if (USE_FIREBASE) {
    try {
      // Verificar si ya dio like
      const hasLiked = await hasUserLikedPost(postId, userId);
      if (hasLiked) {
        throw new Error('Ya diste like a este post');
      }
      
      // Crear documento en Firestore
      const likesRef = collection(db, 'interactions');
      const docRef = await addDoc(likesRef, {
        type: 'like',
        postId,
        userId,
        createdAt: new Date().toISOString()
      });
      
      return {
        id: docRef.id,
        postId,
        userId,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error al dar like:', error);
      throw error;
    }
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
    try {
      const likesRef = collection(db, 'interactions');
      const q = query(
        likesRef,
        where('type', '==', 'like'),
        where('postId', '==', postId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('No has dado like a este post');
      }
      
      // Eliminar el documento
      const likeDoc = snapshot.docs[0];
      await deleteDoc(doc(db, 'interactions', likeDoc.id));
    } catch (error) {
      console.error('Error al quitar like:', error);
      throw error;
    }
    return;
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
    try {
      const likesRef = collection(db, 'interactions');
      const q = query(
        likesRef,
        where('type', '==', 'like'),
        where('postId', '==', postId)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error al obtener likes:', error);
      return 0;
    }
  }
  
  return likesDB.filter(like => like.postId === postId).length;
}

/**
 * Obtener todos los likes de un post
 */
export async function getPostLikes(postId: string): Promise<BlogLike[]> {
  if (USE_FIREBASE) {
    try {
      const likesRef = collection(db, 'interactions');
      const q = query(
        likesRef,
        where('type', '==', 'like'),
        where('postId', '==', postId)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        postId: doc.data().postId,
        userId: doc.data().userId,
        createdAt: doc.data().createdAt
      }));
    } catch (error) {
      console.error('Error al obtener likes:', error);
      return [];
    }
  }
  
  return likesDB.filter(like => like.postId === postId);
}
