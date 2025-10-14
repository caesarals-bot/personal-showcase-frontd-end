/**
 * Category Service - Gestión local de categorías (sin Firebase)
 * Operaciones CRUD en memoria usando datos de la carpeta data/
 */

import type { Category } from '@/types/blog.types';
import { MOCK_CATEGORIES } from '@/data/categories.data';

// Clave para localStorage
const CATEGORIES_STORAGE_KEY = 'categories_db';

// Base de datos en memoria
let categoriesDB: Category[] = [];

// Función para persistir la base de datos en localStorage
const persistCategoriesDB = () => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoriesDB));
  } catch (error) {
    console.error('Error al guardar categorías en localStorage:', error);
  }
};

// Función para inicializar la base de datos desde localStorage o mocks
const initializeCategoriesDB = () => {
  try {
    const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (storedCategories) {
      categoriesDB = JSON.parse(storedCategories);
    } else {
      categoriesDB = [...MOCK_CATEGORIES];
      persistCategoriesDB();
    }
  } catch (error) {
    console.error('Error al cargar categorías desde localStorage:', error);
    categoriesDB = [...MOCK_CATEGORIES];
  }
};

// Inicializar la base de datos al cargar el módulo
initializeCategoriesDB();

// Colores disponibles para categorías
const CATEGORY_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
];

// Simulación de delay de red
const DELAY_MS = 300;
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

/**
 * Obtener todas las categorías
 */
export async function getCategories(): Promise<Category[]> {
  await delay();
  return [...categoriesDB].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Obtener una categoría por ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  await delay();
  return categoriesDB.find(cat => cat.id === id) || null;
}

/**
 * Obtener una categoría por slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  await delay();
  return categoriesDB.find(cat => cat.slug === slug) || null;
}

/**
 * Crear una nueva categoría
 */
export async function createCategory(
  name: string,
  color: string,
  description?: string,
  icon?: string
): Promise<string> {
  await delay();

  const slug = generateCategorySlug(name);

  // Validar que el slug no exista
  const exists = categoriesDB.some(cat => cat.slug === slug);
  if (exists) {
    throw new Error(`Ya existe una categoría con el slug: ${slug}`);
  }

  const newCategory: Category = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    slug,
    color,
    description: description?.trim() || '',
    icon: icon || 'folder',
  };

  categoriesDB.unshift(newCategory);
  persistCategoriesDB();
  return newCategory.id;
}

/**
 * Actualizar una categoría existente
 */
export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, 'id'>>
): Promise<void> {
  await delay();

  const index = categoriesDB.findIndex(cat => cat.id === id);
  if (index === -1) {
    throw new Error('Categoría no encontrada');
  }

  // Si se actualiza el nombre, regenerar el slug
  if (updates.name) {
    updates.slug = generateCategorySlug(updates.name);

    // Validar que el nuevo slug no exista en otra categoría
    const exists = categoriesDB.some(
      cat => cat.slug === updates.slug && cat.id !== id
    );
    if (exists) {
      throw new Error(`Ya existe una categoría con el slug: ${updates.slug}`);
    }
  }

  categoriesDB[index] = {
    ...categoriesDB[index],
    ...updates,
  };

  persistCategoriesDB();
}

/**
 * Eliminar una categoría
 */
export async function deleteCategory(id: string): Promise<void> {
  await delay();

  const index = categoriesDB.findIndex(cat => cat.id === id);
  if (index === -1) {
    throw new Error('Categoría no encontrada');
  }

  categoriesDB.splice(index, 1);
  persistCategoriesDB();
}

/**
 * Obtener estadísticas de categorías con conteo de posts
 * Nota: Requiere acceso a los posts, lo implementaremos después
 */
export async function getCategoriesStats(): Promise<Array<Category & { postsCount: number }>> {
  await delay();

  // Por ahora retornamos las categorías con count en 0
  // Esto se integrará con postService más adelante
  return categoriesDB.map(cat => ({
    ...cat,
    postsCount: 0
  }));
}

/**
 * Generar slug a partir del nombre
 */
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Obtener un color aleatorio
 */
export function getCategoryRandomColor(): string {
  return CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];
}

/**
 * Resetear la base de datos a los valores iniciales
 */
export function resetCategoriesDB(): void {
  categoriesDB = [...MOCK_CATEGORIES];
  persistCategoriesDB();
}
