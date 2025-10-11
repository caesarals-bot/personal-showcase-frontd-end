/**
 * Post Service - Gestión local de posts (sin Firebase)
 * Operaciones CRUD en memoria usando datos de la carpeta data/
 */

import type { BlogPost, Tag } from '@/types/blog.types';
import { MOCK_POSTS } from '@/data/posts.data';
import { getCategoryById } from './categoryService';
import { getTagById } from './tagService';

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
    author: postsDB[0].author, // Usamos el autor del primer post como default
    publishedAt: new Date().toISOString(),
    readingTime: calculateReadingTime(data.content),
    category,
    tags,
    featuredImage: data.featuredImage,
    isPublished: data.isPublished,
    isFeatured: data.isFeatured,
    likes: 0,
    views: 0,
    commentsCount: 0,
  };
  
  postsDB.unshift(newPost); // Añadir al principio para que aparezca primero
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
  const post = postsDB.find(p => p.id === id);
  if (post) {
    post.views++;
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
 * Resetear la base de datos a los valores iniciales
 */
export function resetPostsDB(): void {
  postsDB = [...MOCK_POSTS];
  persistPostsDB();
  console.log('[PostService] Base de datos reseteada a los valores iniciales.');
}
