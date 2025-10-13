/**
 * Post Service - Gestión de posts con soporte Firebase/Local
 * Operaciones CRUD que funcionan con Firestore o localStorage
 */

import type { BlogPost, Tag, PostStatus } from '@/types/blog.types';
import { MOCK_POSTS } from '@/data/posts.data';
import { getCategoryById } from './categoryService';
import { getTagById } from './tagService';
import { 
  collection, 
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// Flag para usar Firebase o localStorage
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';

console.log('🔥 PostService - Modo:', USE_FIREBASE ? 'FIREBASE' : 'LOCAL');

// Clave para localStorage
const POSTS_STORAGE_KEY = 'posts_db';

// Base de datos en memoria
let postsDB: BlogPost[] = [];

// Función para persistir la base de datos en localStorage
const persistPostsDB = () => {
  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(postsDB));
  } catch (error) {
    console.error('Error al guardar posts en localStorage:', error);
  }
};

// Función para inicializar la base de datos desde localStorage o mocks
const initializePostsDB = () => {
  try {
    const storedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
    if (storedPosts) {
      postsDB = JSON.parse(storedPosts);
    } else {
      postsDB = [...MOCK_POSTS];
      persistPostsDB();
    }
  } catch (error) {
    console.error('Error al cargar posts desde localStorage:', error);
    postsDB = [...MOCK_POSTS];
  }
};

// Inicializar la base de datos al cargar el módulo
initializePostsDB();

// Simulación de delay de red
const DELAY_MS = 300;
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

/**
 * Obtener todos los posts
 */
export async function getPosts(options?: {
  published?: boolean;
  featured?: boolean;
  limit?: number;
}): Promise<BlogPost[]> {
  if (USE_FIREBASE) {
    return getPostsFromFirestore(options);
  }
  return getPostsLocal(options);
}

/**
 * Obtener posts desde Firestore
 */
async function getPostsFromFirestore(options?: {
  published?: boolean;
  featured?: boolean;
  limit?: number;
}): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    // Query sin orderBy para evitar problemas con campos faltantes
    const snapshot = await getDocs(postsRef);
    console.log('📊 Documentos encontrados en Firestore:', snapshot.docs.length);
    console.log('🔍 Proyecto Firebase:', db.app.options.projectId);
    
    const posts: BlogPost[] = [];
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      console.log('📄 Post encontrado:', { id: docSnap.id, title: data.title, isPublished: data.isPublished });
      
      // Obtener categoría y tags populados
      let category = null;
      const tags: Tag[] = [];
      
      try {
        category = await getCategoryById(data.categoryId);
      } catch (error) {
        console.warn('⚠️ No se pudo cargar categoría:', data.categoryId);
      }
      
      if (data.tagIds && Array.isArray(data.tagIds)) {
        for (const tagId of data.tagIds) {
          try {
            const tag = await getTagById(tagId);
            if (tag) tags.push(tag);
          } catch (error) {
            console.warn('⚠️ No se pudo cargar tag:', tagId);
          }
        }
      }
      
      posts.push({
        id: docSnap.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author || { id: '1', name: 'Admin', avatar: '/mia (1).png' },
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt,
        readingTime: data.readingTime,
        category: category || { id: '', name: 'Sin categoría', slug: 'sin-categoria', color: '#999' },
        tags,
        featuredImage: data.featuredImage,
        status: data.status || 'draft',
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        likes: data.likes || 0,
        views: data.views || 0,
        commentsCount: data.commentsCount || 0,
      });
    }
    
    // Filtrar y ordenar en el cliente
    let filtered = posts;
    
    if (options?.published !== undefined) {
      filtered = filtered.filter(post => post.isPublished === options.published);
    }
    
    if (options?.featured !== undefined) {
      filtered = filtered.filter(post => post.isFeatured === options.featured);
    }
    
    // Ordenar por fecha de publicación (más recientes primero)
    filtered.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    // Limitar resultados
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    console.log('✅ Posts cargados desde Firestore:', filtered.length);
    return filtered;
  } catch (error) {
    console.error('❌ Error al cargar posts desde Firestore:', error);
    throw error;
  }
}

/**
 * Obtener posts desde localStorage (versión original)
 */
async function getPostsLocal(options?: {
  published?: boolean;
  featured?: boolean;
  limit?: number;
}): Promise<BlogPost[]> {
  await delay();
  
  let filtered = [...postsDB];
  
  // Filtrar por publicados
  if (options?.published !== undefined) {
    filtered = filtered.filter(post => post.isPublished === options.published);
  }
  
  // Filtrar por destacados
  if (options?.featured !== undefined) {
    filtered = filtered.filter(post => post.isFeatured === options.featured);
  }
  
  // Ordenar por fecha de publicación (más recientes primero)
  filtered.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  // Limitar resultados
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  
  return filtered;
}

/**
 * Obtener un post por ID
 */
export async function getPostById(id: string): Promise<BlogPost | null> {
  await delay();
  return postsDB.find(post => post.id === id) || null;
}

/**
 * Obtener un post por slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  await delay();
  return postsDB.find(post => post.slug === slug) || null;
}

/**
 * Obtener posts por categoría
 */
export async function getPostsByCategory(categoryId: string): Promise<BlogPost[]> {
  await delay();
  return postsDB
    .filter(post => post.category.id === categoryId && post.isPublished)
    .sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

/**
 * Obtener posts por tag
 */
export async function getPostsByTag(tagId: string): Promise<BlogPost[]> {
  await delay();
  return postsDB
    .filter(post => 
      post.isPublished && 
      post.tags.some(tag => tag.id === tagId)
    )
    .sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

/**
 * Buscar posts
 */
export async function searchPosts(query: string): Promise<BlogPost[]> {
  await delay();
  
  if (!query.trim()) {
    return getPosts({ published: true });
  }
  
  const searchTerm = query.toLowerCase();
  
  return postsDB
    .filter(post => 
      post.isPublished && (
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.category.name.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.name.toLowerCase().includes(searchTerm))
      )
    )
    .sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

/**
 * Crear un nuevo post
 */
export async function createPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  authorId: string;
  featuredImage?: string;
  status: PostStatus;
  isPublished: boolean;
  isFeatured: boolean;
}): Promise<BlogPost> {
  if (USE_FIREBASE) {
    return createPostInFirestore(data);
  }
  return createPostLocal(data);
}

/**
 * Crear post en Firestore
 */
async function createPostInFirestore(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  authorId: string;
  featuredImage?: string;
  status: PostStatus;
  isPublished: boolean;
  isFeatured: boolean;
}): Promise<BlogPost> {
  try {
    // Validar que el slug no exista
    const existingPosts = await getPosts();
    const exists = existingPosts.some(post => post.slug === data.slug);
    if (exists) {
      throw new Error(`Ya existe un post con el slug: ${data.slug}`);
    }
    
    // Obtener categoría y tags
    const category = await getCategoryById(data.categoryId);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }
    
    const tags: Tag[] = [];
    for (const tagId of data.tagIds) {
      const tag = await getTagById(tagId);
      if (tag) {
        tags.push(tag);
      }
    }
    
    // Crear documento en Firestore
    const postData = {
      title: data.title.trim(),
      slug: data.slug,
      excerpt: data.excerpt.trim(),
      content: data.content.trim(),
      categoryId: data.categoryId,
      tagIds: data.tagIds,
      authorId: data.authorId,
      author: {
        id: data.authorId,
        name: 'Admin User',
        avatar: '/mia (1).png'
      },
      publishedAt: serverTimestamp(),
      readingTime: calculateReadingTime(data.content),
      featuredImage: data.featuredImage || '',
      status: data.status,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      likes: 0,
      views: 0,
      commentsCount: 0,
    };
    
    const docRef = await addDoc(collection(db, 'posts'), postData);
    console.log('✅ Post creado en Firestore:', docRef.id);
    
    // Retornar el post completo
    const newPost: BlogPost = {
      id: docRef.id,
      title: data.title.trim(),
      slug: data.slug,
      excerpt: data.excerpt.trim(),
      content: data.content.trim(),
      author: postData.author,
      publishedAt: new Date().toISOString(),
      readingTime: calculateReadingTime(data.content),
      category,
      tags,
      featuredImage: data.featuredImage,
      status: data.status,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      likes: 0,
      views: 0,
      commentsCount: 0,
    };
    
    return newPost;
  } catch (error) {
    console.error('❌ Error al crear post en Firestore:', error);
    throw error;
  }
}

/**
 * Crear post en localStorage (versión original)
 */
async function createPostLocal(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  authorId: string;
  featuredImage?: string;
  status: PostStatus;
  isPublished: boolean;
  isFeatured: boolean;
}): Promise<BlogPost> {
  await delay();
  
  // Validar que el slug no exista
  const exists = postsDB.some(post => post.slug === data.slug);
  if (exists) {
    throw new Error(`Ya existe un post con el slug: ${data.slug}`);
  }
  
  // Obtener categoría y tags
  const category = await getCategoryById(data.categoryId);
  if (!category) {
    throw new Error('Categoría no encontrada');
  }
  
  const tags: Tag[] = [];
  for (const tagId of data.tagIds) {
    const tag = await getTagById(tagId);
    if (tag) {
      tags.push(tag);
    }
  }
  
  // Crear el nuevo post
  const newPost: BlogPost = {
    id: `post-${Date.now()}`,
    title: data.title.trim(),
    slug: data.slug,
    excerpt: data.excerpt.trim(),
    content: data.content.trim(),
    author: postsDB[0]?.author || { id: '1', name: 'Admin', avatar: '/mia (1).png' },
    publishedAt: new Date().toISOString(),
    readingTime: calculateReadingTime(data.content),
    category,
    tags,
    featuredImage: data.featuredImage,
    status: data.status,
    isPublished: data.isPublished,
    isFeatured: data.isFeatured,
    likes: 0,
    views: 0,
    commentsCount: 0,
  };
  
  postsDB.unshift(newPost);
  persistPostsDB();
  console.log('[PostService] Post creado:', newPost);
  return newPost;
}

/**
 * Actualizar un post existente
 */
export async function updatePost(
  id: string,
  updates: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    featuredImage: string;
    status: PostStatus;
    isPublished: boolean;
    isFeatured: boolean;
  }>
): Promise<BlogPost> {
  await delay();
  
  const index = postsDB.findIndex(post => post.id === id);
  if (index === -1) {
    throw new Error('Post no encontrado');
  }
  
  const currentPost = postsDB[index];
  
  // Si se actualiza el slug, validar que no exista
  if (updates.slug && updates.slug !== currentPost.slug) {
    const exists = postsDB.some(post => post.slug === updates.slug && post.id !== id);
    if (exists) {
      throw new Error(`Ya existe un post con el slug: ${updates.slug}`);
    }
  }
  
  // Actualizar categoría si se proporciona
  let category = currentPost.category;
  if (updates.categoryId) {
    const newCategory = await getCategoryById(updates.categoryId);
    if (newCategory) {
      category = newCategory;
    }
  }
  
  // Actualizar tags si se proporcionan
  let tags = currentPost.tags;
  if (updates.tagIds) {
    tags = [];
    for (const tagId of updates.tagIds) {
      const tag = await getTagById(tagId);
      if (tag) {
        tags.push(tag);
      }
    }
  }
  
  // Calcular nuevo readingTime si se actualiza el contenido
  const readingTime = updates.content 
    ? calculateReadingTime(updates.content)
    : currentPost.readingTime;
  
  // Actualizar el post
  postsDB[index] = {
    ...currentPost,
    ...updates,
    category,
    tags,
    readingTime,
    updatedAt: new Date().toISOString(),
  };
  
  persistPostsDB();
  console.log('[PostService] Post actualizado:', postsDB[index]);
  return postsDB[index];
}

/**
 * Eliminar un post
 */
export async function deletePost(id: string): Promise<void> {
  await delay();
  
  const index = postsDB.findIndex(post => post.id === id);
  if (index === -1) {
    throw new Error('Post no encontrado');
  }
  
  const deleted = postsDB.splice(index, 1)[0];
  persistPostsDB();
  console.log('[PostService] Post eliminado:', deleted);
}

/**
 * Incrementar vistas de un post
 */
export async function incrementPostViews(id: string): Promise<void> {
  await delay();
  const post = postsDB.find(p => p.id === id);
  if (post) {
    post.views = (post.views || 0) + 1;
    persistPostsDB();
    console.log(`👁️ Vista registrada para post ${id}. Total: ${post.views}`);
  }
}

/**
 * Calcular tiempo de lectura (en minutos)
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generar slug a partir del título
 */
export function generatePostSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Actualizar el contador de comentarios de un post
 */
export async function updatePostCommentsCount(postId: string, count: number): Promise<void> {
  await delay();
  const post = postsDB.find(p => p.id === postId);
  if (post) {
    post.commentsCount = count;
    persistPostsDB();
  }
}

/**
 * Actualizar el contador de likes de un post
 */
export async function updatePostLikesCount(postId: string, count: number): Promise<void> {
  await delay();
  const post = postsDB.find(p => p.id === postId);
  if (post) {
    post.likes = count;
    persistPostsDB();
  }
}

/**
 * Resetear la base de datos a los valores iniciales
 */
export function resetPostsDB(): void {
  postsDB = [...MOCK_POSTS];
  persistPostsDB();
  console.log('[PostService] Base de datos reseteada a los valores iniciales.');
}
