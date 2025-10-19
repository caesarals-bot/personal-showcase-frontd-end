/**
 * Category Service - Gestión de categorías con soporte Firebase/Local
 * Operaciones CRUD que funcionan con Firestore o localStorage
 */

import type { Category } from '@/types/blog.types';
import { MOCK_CATEGORIES } from '@/data/categories.data';
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

// Flag para usar Firebase o localStorage
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';

// Cache para categorías de Firebase
interface CacheEntry {
  data: Category[];
  timestamp: number;
}

let categoriesCache: CacheEntry | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function isCacheValid(): boolean {
  return categoriesCache !== null && (Date.now() - categoriesCache.timestamp) < CACHE_DURATION;
}

function clearCategoriesCache(): void {
  categoriesCache = null;
}

// Exportar función para limpiar caché
export { clearCategoriesCache };

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

// Simulación de delay de red (DESACTIVADO para Firebase)
const DELAY_MS = 0; // Cambiado de 300 a 0 para mejor performance
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

/**
 * Obtener todas las categorías
 */
export async function getCategories(): Promise<Category[]> {
  if (USE_FIREBASE) {
    return getCategoriesFromFirestore();
  }
  return getCategoriesLocal();
}

/**
 * Obtener categorías desde Firestore (OPTIMIZADO con CACHÉ)
 */
async function getCategoriesFromFirestore(): Promise<Category[]> {
  try {
    // Verificar caché primero
    if (isCacheValid() && categoriesCache) {
      return categoriesCache.data;
    }

    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        color: data.color,
        icon: data.icon,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });

    // Actualizar caché
    categoriesCache = {
      data: categories,
      timestamp: Date.now()
    };

    return categories;
  } catch (error) {
    console.error('Error al obtener categorías desde Firestore:', error);
    // Fallback a datos locales en caso de error
    return getCategoriesLocal();
  }
}

/**
 * Obtener categorías desde localStorage (modo local)
 */
async function getCategoriesLocal(): Promise<Category[]> {
  await delay();
  return [...categoriesDB].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Obtener categoría por ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  if (USE_FIREBASE) {
    return getCategoryByIdFromFirestore(id);
  }
  return getCategoryByIdLocal(id);
}

/**
 * Obtener categoría por ID desde Firestore
 */
async function getCategoryByIdFromFirestore(id: string): Promise<Category | null> {
  try {
    const categories = await getCategoriesFromFirestore();
    return categories.find(category => category.id === id) || null;
  } catch (error) {
    console.error('Error al obtener categoría desde Firestore:', error);
    return getCategoryByIdLocal(id);
  }
}

/**
 * Obtener categoría por ID desde localStorage
 */
async function getCategoryByIdLocal(id: string): Promise<Category | null> {
  await delay();
  return categoriesDB.find(category => category.id === id) || null;
}

/**
 * Obtener una categoría por slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (USE_FIREBASE) {
    return getCategoryBySlugFromFirestore(slug);
  }
  return getCategoryBySlugLocal(slug);
}

/**
 * Obtener categoría por slug desde Firestore
 */
async function getCategoryBySlugFromFirestore(slug: string): Promise<Category | null> {
  try {
    const categories = await getCategoriesFromFirestore();
    return categories.find(category => category.slug === slug) || null;
  } catch (error) {
    console.error('Error al obtener categoría por slug desde Firestore:', error);
    return getCategoryBySlugLocal(slug);
  }
}

/**
 * Obtener categoría por slug desde localStorage
 */
async function getCategoryBySlugLocal(slug: string): Promise<Category | null> {
  await delay();
  return categoriesDB.find(cat => cat.slug === slug) || null;
}

/**
 * Crear nueva categoría
 */
export async function createCategory(data: {
  name: string;
  description: string;
  color: string;
  icon?: string;
}): Promise<Category> {
  // Validación de entrada
  if (!data.name?.trim()) {
    throw new Error('El nombre de la categoría es requerido');
  }
  if (!data.color?.trim()) {
    throw new Error('El color de la categoría es requerido');
  }
  
  if (USE_FIREBASE) {
    return createCategoryInFirestore(data);
  }
  return createCategoryLocal(data);
}

/**
 * Crear categoría en Firestore
 */
async function createCategoryInFirestore(data: {
  name: string;
  description: string;
  color: string;
  icon?: string;
}): Promise<Category> {
  try {
    // Generar slug único
    const baseSlug = generateCategorySlug(data.name);
    let slug = baseSlug;
    let counter = 1;
    
    // Verificar que el slug sea único
    const existingCategories = await getCategoriesFromFirestore();
    while (existingCategories.some(cat => cat.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const categoryData = {
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      color: data.color,
      icon: data.icon || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Crear documento en Firestore
    const docRef = await addDoc(collection(db, 'categories'), categoryData);
    
    // Limpiar caché al crear categoría
    clearCategoriesCache();
    
    // Retornar la categoría completa
    const newCategory: Category = {
      id: docRef.id,
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      color: data.color,
      icon: data.icon || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return newCategory;
  } catch (error) {
    console.error('Error al crear categoría en Firestore:', error);
    throw error;
  }
}

/**
 * Crear categoría en localStorage (modo local)
 */
async function createCategoryLocal(data: {
  name: string;
  description: string;
  color: string;
  icon?: string;
}): Promise<Category> {
  await delay();
  
  // Generar ID único
  const id = `cat-${Date.now()}`;
  
  // Generar slug único
  const baseSlug = generateCategorySlug(data.name);
  let slug = baseSlug;
  let counter = 1;
  
  // Verificar que el slug sea único
  while (categoriesDB.some(cat => cat.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  const newCategory: Category = {
    id,
    name: data.name.trim(),
    slug,
    description: data.description.trim(),
    color: data.color,
    icon: data.icon || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  categoriesDB.push(newCategory);
  persistCategoriesDB();
  
  return newCategory;
}

/**
 * Actualizar categoría existente
 */
export async function updateCategory(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
  }>
): Promise<Category> {
  // Validación de entrada
  if (!id?.trim()) {
    throw new Error('El ID de la categoría es requerido');
  }
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('Se requiere al menos un campo para actualizar');
  }
  if (updates.name !== undefined && !updates.name.trim()) {
    throw new Error('El nombre de la categoría no puede estar vacío');
  }
  
  if (USE_FIREBASE) {
    return updateCategoryInFirestore(id, updates);
  }
  return updateCategoryLocal(id, updates);
}

/**
 * Actualizar categoría en Firestore
 */
async function updateCategoryInFirestore(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
  }>
): Promise<Category> {
  try {
    // Obtener categoría actual
    const currentCategory = await getCategoryByIdFromFirestore(id);
    if (!currentCategory) {
      throw new Error(`Categoría con ID ${id} no encontrada`);
    }

    // Si se actualiza el nombre, regenerar slug
    let newSlug = currentCategory.slug;
    if (updates.name && updates.name !== currentCategory.name) {
      const baseSlug = generateCategorySlug(updates.name);
      newSlug = baseSlug;
      let counter = 1;
      
      // Verificar que el nuevo slug sea único (excluyendo la categoría actual)
      const existingCategories = await getCategoriesFromFirestore();
      while (existingCategories.some(cat => cat.slug === newSlug && cat.id !== id)) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updateData: any = {
      updatedAt: serverTimestamp()
    };

    if (updates.name) updateData.name = updates.name.trim();
    if (updates.description !== undefined) updateData.description = updates.description.trim();
    if (updates.color) updateData.color = updates.color;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (newSlug !== currentCategory.slug) updateData.slug = newSlug;

    // Actualizar en Firestore
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, updateData);
    
    // Limpiar caché al actualizar
    clearCategoriesCache();
    
    // Retornar categoría actualizada
    const updatedCategory: Category = {
      ...currentCategory,
      ...updates,
      slug: newSlug,
      name: updates.name?.trim() || currentCategory.name,
      description: updates.description?.trim() || currentCategory.description,
      icon: updates.icon !== undefined ? updates.icon : currentCategory.icon,
      updatedAt: new Date().toISOString()
    };
    
    return updatedCategory;
  } catch (error) {
    console.error('Error al actualizar categoría en Firestore:', error);
    throw error;
  }
}

/**
 * Actualizar categoría en localStorage (modo local)
 */
async function updateCategoryLocal(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
  }>
): Promise<Category> {
  await delay();
  
  const categoryIndex = categoriesDB.findIndex(cat => cat.id === id);
  if (categoryIndex === -1) {
    throw new Error(`Categoría con ID ${id} no encontrada`);
  }
  
  const category = categoriesDB[categoryIndex];
  
  // Si se actualiza el nombre, regenerar slug
  let newSlug = category.slug;
  if (updates.name && updates.name !== category.name) {
    const baseSlug = generateCategorySlug(updates.name);
    newSlug = baseSlug;
    let counter = 1;
    
    // Verificar que el nuevo slug sea único (excluyendo la categoría actual)
    while (categoriesDB.some(cat => cat.slug === newSlug && cat.id !== id)) {
      newSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  
  const updatedCategory: Category = {
    ...category,
    ...updates,
    slug: newSlug,
    name: updates.name?.trim() || category.name,
    description: updates.description?.trim() || category.description,
    icon: updates.icon !== undefined ? updates.icon : category.icon,
    updatedAt: new Date().toISOString()
  };
  
  categoriesDB[categoryIndex] = updatedCategory;
  persistCategoriesDB();
  
  return updatedCategory;
}

/**
 * Eliminar una categoría
 */
export async function deleteCategory(id: string): Promise<void> {
  if (USE_FIREBASE) {
    return deleteCategoryFromFirestore(id);
  }
  return deleteCategoryLocal(id);
}

/**
 * Eliminar categoría desde Firestore
 */
async function deleteCategoryFromFirestore(id: string): Promise<void> {
  try {
    // Verificar que la categoría existe
    const category = await getCategoryByIdFromFirestore(id);
    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    // Eliminar documento de Firestore
    const categoryRef = doc(db, 'categories', id);
    await deleteDoc(categoryRef);
    
    // Limpiar caché al eliminar
    clearCategoriesCache();
  } catch (error) {
    console.error('Error al eliminar categoría desde Firestore:', error);
    throw error;
  }
}

/**
 * Eliminar categoría desde localStorage (modo local)
 */
async function deleteCategoryLocal(id: string): Promise<void> {
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
 * Nota: Para evitar dependencias circulares, el conteo real se debe hacer desde postService
 */
export async function getCategoriesStats(): Promise<Array<Category & { postsCount: number }>> {
  const categories = await getCategories();
  
  // Por ahora retornamos las categorías con count en 0
  // El conteo real de posts debe implementarse desde postService para evitar dependencias circulares
  return categories.map(cat => ({
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
