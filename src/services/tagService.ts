/**
 * Tag Service - Gestión de tags con soporte Firebase/Local
 * Operaciones CRUD que funcionan con Firestore o localStorage
 */

import type { Tag } from '@/types/blog.types';
import { MOCK_TAGS } from '@/data/tags.data';
import { 
  collection, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// Configuración
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';

// Clave para localStorage
const TAGS_STORAGE_KEY = 'tags_db';

// Base de datos en memoria
let tagsDB: Tag[] = [];

// Cache para Firebase
let tagsCache: Tag[] | null = null;
let tagsCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para persistir la base de datos en localStorage
const persistTagsDB = () => {
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tagsDB));
  } catch (error) {
    console.error('Error al guardar tags en localStorage:', error);
  }
};

/**
 * Obtener tags desde Firestore
 */
async function getTagsFromFirestore(): Promise<Tag[]> {
  try {
    // Verificar cache
    const now = Date.now();
    if (tagsCache && (now - tagsCacheTimestamp) < CACHE_DURATION) {
      return tagsCache;
    }

    const tagsCollection = collection(db, 'tags');
    const snapshot = await getDocs(tagsCollection);
    
    const tags: Tag[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Tag));

    // Actualizar cache
    tagsCache = tags;
    tagsCacheTimestamp = now;

    return tags;
  } catch (error) {
    console.error('Error al obtener tags de Firestore:', error);
    // Fallback a datos locales
    return getTagsLocal();
  }
}

/**
 * Obtener tags desde localStorage (modo local)
 */
async function getTagsLocal(): Promise<Tag[]> {
  await delay();
  return [...tagsDB];
}

/**
 * Obtener tag por ID desde Firestore
 */
async function getTagByIdFromFirestore(id: string): Promise<Tag | null> {
  try {
    const tags = await getTagsFromFirestore();
    return tags.find(tag => tag.id === id) || null;
  } catch (error) {
    console.error('Error al obtener tag por ID de Firestore:', error);
    // Fallback a datos locales
    return getTagByIdLocal(id);
  }
}

/**
 * Obtener tag por ID desde localStorage (modo local)
 */
async function getTagByIdLocal(id: string): Promise<Tag | null> {
  await delay();
  return tagsDB.find(tag => tag.id === id) || null;
}

// Función para inicializar la base de datos desde localStorage o mocks
const initializeTagsDB = () => {
  try {
    const storedTags = localStorage.getItem(TAGS_STORAGE_KEY);
    if (storedTags) {
      tagsDB = JSON.parse(storedTags);
    } else {
      tagsDB = [...MOCK_TAGS];
      persistTagsDB();
    }
  } catch (error) {
    console.error('Error al cargar tags desde localStorage:', error);
    tagsDB = [...MOCK_TAGS];
  }
};

// Inicializar la base de datos al cargar el módulo
initializeTagsDB();

// Simulación de delay de red (DESACTIVADO para Firebase)
const DELAY_MS = 0; // Cambiado de 300 a 0 para mejor performance
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

/**
 * Obtener todos los tags
 */
export async function getTags(): Promise<Tag[]> {
  if (USE_FIREBASE) {
    return getTagsFromFirestore();
  } else {
    return getTagsLocal();
  }
}

/**
 * Obtener un tag por ID
 */
export async function getTagById(id: string): Promise<Tag | null> {
  if (USE_FIREBASE) {
    return getTagByIdFromFirestore(id);
  } else {
    return getTagByIdLocal(id);
  }
}

/**
 * Obtener un tag por slug
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  await delay();
  return tagsDB.find(tag => tag.slug === slug) || null;
}

/**
 * Crear tag en Firestore
 */
async function createTagInFirestore(tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
  try {
    const slug = generateTagSlug(tagData.name);
    
    // Verificar que el slug sea único
    const existingTags = await getTagsFromFirestore();
    const existingTag = existingTags.find(tag => tag.slug === slug);
    if (existingTag) {
      throw new Error('Ya existe un tag con ese nombre');
    }

    const newTagData = {
      ...tagData,
      slug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const tagsCollection = collection(db, 'tags');
    const docRef = await addDoc(tagsCollection, newTagData);

    const newTag: Tag = {
      id: docRef.id,
      ...tagData,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Invalidar cache
    tagsCache = null;

    return newTag;
  } catch (error) {
    console.error('Error al crear tag en Firestore:', error);
    throw error;
  }
}

/**
 * Crear tag en localStorage (modo local)
 */
async function createTagLocal(tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
  await delay();
  
  const slug = generateTagSlug(tagData.name);
  
  // Verificar que el slug sea único
  const existingTag = tagsDB.find(tag => tag.slug === slug);
  if (existingTag) {
    throw new Error('Ya existe un tag con ese nombre');
  }

  const newTag: Tag = {
    id: `tag-${Date.now()}`,
    ...tagData,
    slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tagsDB.unshift(newTag);
  persistTagsDB();
  return newTag;
}

/**
 * Crear un nuevo tag
 */
export async function createTag(tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
  if (USE_FIREBASE) {
    return createTagInFirestore(tagData);
  } else {
    return createTagLocal(tagData);
  }
}

/**
 * Actualizar tag en Firestore
 */
async function updateTagInFirestore(id: string, tagData: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Tag> {
  try {
    // Verificar que el tag existe
    const existingTag = await getTagByIdFromFirestore(id);
    if (!existingTag) {
      throw new Error('Tag no encontrado');
    }

    let slug = existingTag.slug;
    
    // Si se está actualizando el nombre, regenerar el slug
     if (tagData.name && tagData.name !== existingTag.name) {
       slug = generateTagSlug(tagData.name);
      
      // Verificar que el nuevo slug sea único
      const existingTags = await getTagsFromFirestore();
      const duplicateTag = existingTags.find(tag => tag.slug === slug && tag.id !== id);
      if (duplicateTag) {
        throw new Error('Ya existe un tag con ese nombre');
      }
    }

    const updateData = {
      ...tagData,
      slug,
      updatedAt: serverTimestamp()
    };

    const tagDoc = doc(db, 'tags', id);
    await updateDoc(tagDoc, updateData);

    const updatedTag: Tag = {
      ...existingTag,
      ...tagData,
      slug,
      updatedAt: new Date().toISOString()
    };

    // Invalidar cache
    tagsCache = null;

    return updatedTag;
  } catch (error) {
    console.error('Error al actualizar tag en Firestore:', error);
    throw error;
  }
}

/**
 * Actualizar tag en localStorage (modo local)
 */
async function updateTagLocal(id: string, tagData: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Tag> {
  await delay();
  
  const index = tagsDB.findIndex(tag => tag.id === id);
  if (index === -1) {
    throw new Error('Tag no encontrado');
  }

  let slug = tagsDB[index].slug;
  
  // Si se está actualizando el nombre, regenerar el slug
  if (tagData.name && tagData.name !== tagsDB[index].name) {
    slug = generateTagSlug(tagData.name);
    
    // Verificar que el nuevo slug sea único
    const existingTag = tagsDB.find(tag => tag.slug === slug && tag.id !== id);
    if (existingTag) {
      throw new Error('Ya existe un tag con ese nombre');
    }
  }

  const updatedTag: Tag = {
    ...tagsDB[index],
    ...tagData,
    slug,
    updatedAt: new Date().toISOString()
  };

  tagsDB[index] = updatedTag;
  persistTagsDB();
  
  return updatedTag;
}

/**
 * Actualizar un tag existente
 */
export async function updateTag(id: string, tagData: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Tag> {
  if (USE_FIREBASE) {
    return updateTagInFirestore(id, tagData);
  } else {
    return updateTagLocal(id, tagData);
  }
}

/**
 * Eliminar tag desde Firestore
 */
async function deleteTagFromFirestore(id: string): Promise<void> {
  try {
    // Verificar que el tag existe
    const existingTag = await getTagByIdFromFirestore(id);
    if (!existingTag) {
      throw new Error('Tag no encontrado');
    }

    const tagDoc = doc(db, 'tags', id);
    await deleteDoc(tagDoc);

    // Invalidar cache
    tagsCache = null;
  } catch (error) {
    console.error('Error al eliminar tag de Firestore:', error);
    throw error;
  }
}

/**
 * Eliminar tag desde localStorage (modo local)
 */
async function deleteTagLocal(id: string): Promise<void> {
  await delay();
  
  const index = tagsDB.findIndex(tag => tag.id === id);
  if (index === -1) {
    throw new Error('Tag no encontrado');
  }

  tagsDB.splice(index, 1);
  persistTagsDB();
}

/**
 * Eliminar un tag
 */
export async function deleteTag(id: string): Promise<void> {
  if (USE_FIREBASE) {
    return deleteTagFromFirestore(id);
  } else {
    return deleteTagLocal(id);
  }
}

/**
 * Generar slug a partir del nombre
 */
export function generateTagSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const TAG_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
];

export function getTagRandomColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

/**
 * Resetear la base de datos a los valores iniciales
 */
export function resetTagsDB(): void {
  tagsDB = [...MOCK_TAGS];
  persistTagsDB();
}
