/**
 * Tag Service - Gestión local de tags (sin Firebase)
 * Operaciones CRUD en memoria usando datos de la carpeta data/
 */

import type { Tag } from '@/types/blog.types';
import { MOCK_TAGS } from '@/data/tags.data';

// Clave para localStorage
const TAGS_STORAGE_KEY = 'tags_db';

// Base de datos en memoria
let tagsDB: Tag[] = [];

// Función para persistir la base de datos en localStorage
const persistTagsDB = () => {
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tagsDB));
  } catch (error) {
    console.error('Error al guardar tags en localStorage:', error);
  }
};

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

// Simulación de delay de red para hacer la experiencia más realista
const DELAY_MS = 300;
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

/**
 * Obtener todos los tags
 */
export async function getTags(): Promise<Tag[]> {
  await delay();
  return [...tagsDB].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Obtener un tag por ID
 */
export async function getTagById(id: string): Promise<Tag | null> {
  await delay();
  return tagsDB.find(tag => tag.id === id) || null;
}

/**
 * Obtener un tag por slug
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  await delay();
  return tagsDB.find(tag => tag.slug === slug) || null;
}

/**
 * Crear un nuevo tag
 */
export async function createTag(data: Omit<Tag, 'id'>): Promise<Tag> {
  await delay();
  
  // Validar que el slug no exista
  const exists = tagsDB.some(tag => tag.slug === data.slug);
  if (exists) {
    throw new Error(`Ya existe un tag con el slug: ${data.slug}`);
  }

  const newTag: Tag = {
    id: `tag-${Date.now()}`,
    ...data,
  };

  tagsDB.unshift(newTag);
  persistTagsDB();
  return newTag;
}

/**
 * Actualizar un tag existente
 */
export async function updateTag(id: string, data: Partial<Omit<Tag, 'id'>>): Promise<Tag> {
  await delay();
  
  const index = tagsDB.findIndex(tag => tag.id === id);
  if (index === -1) {
    throw new Error('Tag no encontrado');
  }

  // Si se actualiza el slug, validar que no exista otro tag con ese slug
  if (data.slug && data.slug !== tagsDB[index].slug) {
    const exists = tagsDB.some(tag => tag.slug === data.slug);
    if (exists) {
      throw new Error(`Ya existe un tag con el slug: ${data.slug}`);
    }
  }

  tagsDB[index] = {
    ...tagsDB[index],
    ...data,
  };

  persistTagsDB();
  return tagsDB[index];
}

/**
 * Eliminar un tag
 */
export async function deleteTag(id: string): Promise<void> {
  await delay();
  
  const index = tagsDB.findIndex(tag => tag.id === id);
  if (index === -1) {
    throw new Error('Tag no encontrado');
  }

  tagsDB.splice(index, 1);
  persistTagsDB();
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
