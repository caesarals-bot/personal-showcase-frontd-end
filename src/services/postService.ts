/**
 * Post Service - Gestión de posts con soporte Firebase/Local
 * Operaciones CRUD que funcionan con Firestore o localStorage
 */

import type { BlogPost, Tag, PostStatus, Category } from '@/types/blog.types';
import { MOCK_POSTS } from '@/data/posts.data';
import { getCategoryById, getCategories } from './categoryService';
import { getTagById, getTags } from './tagService';
import { 
  collection, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// Flag para usar Firebase o localStorage
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';

// Caché simple en memoria (5 minutos)
interface CacheEntry {
  data: BlogPost[];
  timestamp: number;
}

let postsCache: CacheEntry | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function isCacheValid(): boolean {
  if (!postsCache) return false;
  const now = Date.now();
  return (now - postsCache.timestamp) < CACHE_DURATION;
}

function clearPostsCache(): void {
  postsCache = null;
}

// Exportar función para limpiar caché manualmente
export { clearPostsCache };

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

// Simulación de delay de red (DESACTIVADO para Firebase)
const DELAY_MS = 0; // Cambiado de 300 a 0 para mejor performance
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
 * Obtener posts desde Firestore (OPTIMIZADO con CACHÉ)
 */
async function getPostsFromFirestore(options?: {
  published?: boolean;
  featured?: boolean;
  limit?: number;
}): Promise<BlogPost[]> {
  try {
    // Verificar caché primero
    if (isCacheValid() && postsCache) {
      const cached = postsCache.data;
      
      // Aplicar filtros al caché
      let filtered = cached;
      if (options?.published !== undefined) {
        filtered = filtered.filter(post => post.isPublished === options.published);
      }
      if (options?.featured !== undefined) {
        filtered = filtered.filter(post => post.isFeatured === options.featured);
      }
      if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
      }
      
      return filtered;
    }
    
    // Cargar posts desde Firestore
    const postsRef = collection(db, 'posts');
    const snapshot = await getDocs(postsRef);
    
    // Pre-cargar TODAS las categorías y tags en paralelo (UNA SOLA VEZ)
    const [allCategories, allTags] = await Promise.all([
      getCategories(),
      getTags()
    ]);
    
    // Crear mapas para lookup rápido O(1)
    const categoryMap = new Map<string, Category>(allCategories.map(cat => [cat.id, cat]));
    const tagMap = new Map<string, Tag>(allTags.map(tag => [tag.id, tag]));
    
    // Procesar todos los posts en paralelo
    const postsPromises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      
      // Lookup instantáneo en memoria (no más llamadas a Firestore)
      const category = categoryMap.get(data.categoryId) || { 
        id: '', 
        name: 'Sin categoría', 
        slug: 'sin-categoria', 
        color: '#999' 
      };
      
      const tags: Tag[] = [];
      if (data.tagIds && Array.isArray(data.tagIds)) {
        for (const tagId of data.tagIds) {
          const tag = tagMap.get(tagId);
          if (tag) tags.push(tag);
        }
      }
      
      return {
        id: docSnap.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author || { id: '1', name: 'Admin', avatar: '/mia (1).png' },
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt,
        readingTime: data.readingTime,
        category,
        tags,
        featuredImage: data.featuredImage,
        gallery: data.gallery || [],
        sources: data.sources || [],
        status: data.status || 'draft',
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        likes: data.likes || 0,
        views: data.views || 0,
        commentsCount: data.commentsCount || 0,
      } as BlogPost;
    });
    
    const posts = await Promise.all(postsPromises);
    
    // Ordenar todos los posts antes de guardar en caché
    posts.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    // Guardar en caché
    postsCache = {
      data: posts,
      timestamp: Date.now()
    };
    
    // Filtrar según opciones
    let filtered = posts;
    
    if (options?.published !== undefined) {
      filtered = filtered.filter(post => post.isPublished === options.published);
    }
    
    if (options?.featured !== undefined) {
      filtered = filtered.filter(post => post.isFeatured === options.featured);
    }
    
    // Limitar resultados (ya están ordenados)
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    return filtered;
  } catch (error) {
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
  if (USE_FIREBASE) {
    return getPostByIdFromFirestore(id);
  }
  return getPostByIdLocal(id);
}

/**
 * Obtener post por ID desde Firestore
 */
async function getPostByIdFromFirestore(id: string): Promise<BlogPost | null> {
  try {
    const posts = await getPostsFromFirestore();
    return posts.find(post => post.id === id) || null;
  } catch (error) {
    return null;
  }
}

/**
 * Obtener post por ID desde localStorage
 */
async function getPostByIdLocal(id: string): Promise<BlogPost | null> {
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
  authorName: string;
  authorAvatar?: string;
  featuredImage?: string;
  gallery?: string[];
  sources?: string[];
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
  authorName: string;
  authorAvatar?: string;
  featuredImage?: string;
  gallery?: string[];
  sources?: string[];
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
        name: data.authorName,
        avatar: data.authorAvatar || '/mia (1).png'
      },
      publishedAt: serverTimestamp(),
      readingTime: calculateReadingTime(data.content),
      featuredImage: data.featuredImage || '',
      gallery: data.gallery || [],
      sources: data.sources || [],
      status: data.status,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      likes: 0,
      views: 0,
      commentsCount: 0,
    };
    

    
    const docRef = await addDoc(collection(db, 'posts'), postData);
    
    // Limpiar caché al crear post
    clearPostsCache();
    
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
      gallery: data.gallery || [],
      sources: data.sources || [],
      status: data.status,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      likes: 0,
      views: 0,
      commentsCount: 0,
    };
    
    return newPost;
  } catch (error) {
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
  authorName: string;
  authorAvatar?: string;
  featuredImage?: string;
  gallery?: string[];
  sources?: string[];
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
    author: { id: data.authorId, name: data.authorName, avatar: data.authorAvatar || '/mia (1).png' },
    publishedAt: new Date().toISOString(),
    readingTime: calculateReadingTime(data.content),
    category,
    tags,
    featuredImage: data.featuredImage,
    gallery: data.gallery || [],
    sources: data.sources || [],
    status: data.status,
    isPublished: data.isPublished,
    isFeatured: data.isFeatured,
    likes: 0,
    views: 0,
    commentsCount: 0,
  };
  
  postsDB.unshift(newPost);
  persistPostsDB();
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
    gallery: string[];
    sources: string[];
    status: PostStatus;
    isPublished: boolean;
    isFeatured: boolean;
  }>
): Promise<BlogPost> {
  if (USE_FIREBASE) {
    return updatePostInFirestore(id, updates);
  }
  return updatePostLocal(id, updates);
}

/**
 * Actualizar post en Firestore
 */
async function updatePostInFirestore(
  id: string,
  updates: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    featuredImage: string;
    gallery: string[];
    sources: string[];
    status: PostStatus;
    isPublished: boolean;
    isFeatured: boolean;
  }>
): Promise<BlogPost> {
  try {
    // Preparar datos para actualizar
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };
    
    if (updates.title !== undefined) updateData.title = updates.title.trim();
    if (updates.slug !== undefined) updateData.slug = updates.slug;
    if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt.trim();
    if (updates.content !== undefined) {
      updateData.content = updates.content.trim();
      updateData.readingTime = calculateReadingTime(updates.content);
    }
    if (updates.categoryId !== undefined) updateData.categoryId = updates.categoryId;
    if (updates.tagIds !== undefined) updateData.tagIds = updates.tagIds;
    if (updates.featuredImage !== undefined) updateData.featuredImage = updates.featuredImage;
    if (updates.gallery !== undefined) updateData.gallery = updates.gallery;
    if (updates.sources !== undefined) updateData.sources = updates.sources;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.isPublished !== undefined) updateData.isPublished = updates.isPublished;
    if (updates.isFeatured !== undefined) updateData.isFeatured = updates.isFeatured;
    
    // Actualizar en Firestore
    const postRef = doc(db, 'posts', id);
    await updateDoc(postRef, updateData);
    
    // Limpiar caché al actualizar post
    clearPostsCache();
    
    // Obtener el post actualizado
    const updatedPost = await getPostById(id);
    if (!updatedPost) {
      throw new Error('Post no encontrado después de actualizar');
    }
    
    return updatedPost;
  } catch (error) {
    throw error;
  }
}

/**
 * Actualizar post en localStorage (versión original)
 */
async function updatePostLocal(
  id: string,
  updates: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    featuredImage: string;
    gallery: string[];
    sources: string[];
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
  
  postsDB.splice(index, 1);
  persistPostsDB();
}

/**
 * Incrementar vistas de un post
 */
export async function incrementPostViews(id: string): Promise<void> {
  if (USE_FIREBASE) {
    try {
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error al incrementar vistas:', error);
      // No lanzar error para no interrumpir la experiencia del usuario
    }
    return;
  }
  
  // Modo local
  await delay();
  const post = postsDB.find(p => p.id === id);
  if (post) {
    post.views = (post.views || 0) + 1;
    persistPostsDB();
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
}
