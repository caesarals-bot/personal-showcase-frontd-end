/**
 * Project Service - Gestión de proyectos del portfolio
 * 
 * Funcionalidades:
 * - CRUD de proyectos
 * - Filtrado y búsqueda
 * - Gestión de tecnologías
 * - Integración con Firebase/localStorage
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Project, CreateProjectData, UpdateProjectData } from '@/types/admin.types'

// Base de datos local para desarrollo
let projectsDB: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform',
    slug: 'ecommerce-platform',
    description: 'Plataforma de e-commerce moderna y escalable',
    fullDescription: 'Plataforma de comercio electrónico completa con React, Node.js y PostgreSQL. Incluye carrito de compras, procesamiento de pagos, gestión de inventario, panel de administración y sistema de usuarios con autenticación segura.',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    images: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800'
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Tailwind CSS'],
    category: 'Web Development',
    status: 'completed',
    featured: true,
    links: {
      demo: 'https://demo-ecommerce.example.com',
      github: 'https://github.com/user/ecommerce-platform',
      live: 'https://ecommerce-platform.example.com'
    },
    startDate: '2024-01-15',
    endDate: '2024-03-20',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z'
  },
  {
    id: '2',
    title: 'Task Management App',
    slug: 'task-management-app',
    description: 'App de gestión de tareas colaborativa',
    fullDescription: 'Aplicación de gestión de tareas con funcionalidades avanzadas de colaboración. Incluye asignación de tareas, seguimiento de progreso, notificaciones en tiempo real, comentarios y sistema de equipos.',
    coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
    images: [
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800'
    ],
    technologies: ['Vue.js', 'Express.js', 'MongoDB', 'Socket.io'],
    category: 'Web Development',
    status: 'completed',
    featured: false,
    links: {
      demo: 'https://demo-taskmanager.example.com',
      github: 'https://github.com/user/task-management'
    },
    startDate: '2024-02-01',
    endDate: '2024-03-15',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-15T14:20:00Z'
  },
  {
    id: '3',
    title: 'Mobile Weather App',
    slug: 'mobile-weather-app',
    description: 'App móvil del clima con pronósticos detallados',
    fullDescription: 'Aplicación móvil del clima con React Native y APIs meteorológicas. Incluye pronósticos extendidos, mapas interactivos, alertas meteorológicas, geolocalización y diseño adaptativo.',
    coverImage: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800',
    images: [
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800'
    ],
    technologies: ['React Native', 'TypeScript', 'Weather API'],
    category: 'Mobile Development',
    status: 'completed',
    featured: false,
    links: {
      github: 'https://github.com/user/weather-app'
    },
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-04-30T11:00:00Z'
  }
]

// Clave para localStorage
const PROJECTS_STORAGE_KEY = 'portfolio_projects'
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true'

// Funciones de persistencia local
const loadProjectsDB = (): Project[] => {
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error al cargar proyectos desde localStorage:', error)
  }
  return projectsDB
}

const persistProjectsDB = () => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projectsDB))
  } catch (error) {
    console.error('Error al guardar proyectos en localStorage:', error)
  }
}

// Inicializar base de datos local
projectsDB = loadProjectsDB()

/**
 * Obtener todos los proyectos
 */
export const getProjects = async (): Promise<Project[]> => {
  if (USE_FIREBASE) {
    try {
      const projectsRef = collection(db, 'portfolio')
      const q = query(projectsRef, orderBy('updatedAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const projects = snapshot.docs.map(doc => {
        const data = doc.data()
        const project = {
          ...data,
          id: doc.id  // ✅ Asignar el ID DESPUÉS para que no sea sobrescrito
        } as Project
        return project
      })
      
      return projects
    } catch (error) {
      // Error al obtener proyectos desde Firestore
      // Fallback a localStorage
      return projectsDB
    }
  }
  return [...projectsDB].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
    return dateB - dateA
  })
}

/**
 * Obtener proyecto por ID
 */
export const getProjectById = async (id: string): Promise<Project | null> => {
  if (USE_FIREBASE) {
    try {
      const projectRef = doc(db, 'portfolio', id)
      const snapshot = await getDoc(projectRef)
      
      if (snapshot.exists()) {
        const data = snapshot.data()
        return {
          ...data,
          id: snapshot.id  // ✅ Asignar el ID DESPUÉS para que no sea sobrescrito
        } as Project
      }
      return null
    } catch (error) {
      console.error('Error al obtener proyecto desde Firestore:', error)
    }
  }
  
  return projectsDB.find(p => p.id === id) || null
}

/**
 * Obtener proyecto por slug
 */
export const getProjectBySlug = async (slug: string): Promise<Project | null> => {
  if (USE_FIREBASE) {
    try {
      const projectsRef = collection(db, 'portfolio')
      const q = query(projectsRef, where('slug', '==', slug))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0]
        const data = docSnap.data()
        return {
          ...data,
          id: docSnap.id  // ✅ Asignar el ID DESPUÉS para que no sea sobrescrito
        } as Project
      }
      return null
    } catch (error) {
      console.error('Error al obtener proyecto por slug desde Firestore:', error)
    }
  }
  
  return projectsDB.find(p => p.slug === slug) || null
}

/**
 * Crear nuevo proyecto
 */
export const createProject = async (data: CreateProjectData, excludeId?: string): Promise<Project> => {
  const now = new Date().toISOString()
  const slug = generateProjectSlug(data.title)
  
  // Verificar si ya existe un proyecto con el mismo título o slug
  if (USE_FIREBASE) {
    try {
      const existingProjects = await getProjects()
      const duplicateByTitle = existingProjects.find(p => 
        p.title.toLowerCase() === data.title.toLowerCase() && 
        (!excludeId || p.id !== excludeId)
      )
      const duplicateBySlug = existingProjects.find(p => 
        p.slug === slug && 
        (!excludeId || p.id !== excludeId)
      )
      
      if (duplicateByTitle) {
        throw new Error(`Ya existe un proyecto con el título "${data.title}"`)
      }
      
      if (duplicateBySlug) {
        throw new Error(`Ya existe un proyecto con el slug "${slug}"`)
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Ya existe un proyecto')) {
        throw error
      }
      console.warn('Error al verificar duplicados, continuando con la creación:', error)
    }
  }
  
  const newProject: Project = {
    id: '', // Se asignará después
    ...data,
    images: data.images || [], // Asegurar que images siempre sea un array
    links: data.links || {}, // Asegurar que links siempre sea un objeto
    slug,
    createdAt: now,
    updatedAt: now
  }
  
  if (USE_FIREBASE) {
    try {
      // Limpiar campos undefined antes de enviar a Firebase
      const cleanedProject = cleanUndefinedFields(newProject)
      
      const projectsRef = collection(db, 'portfolio')
      const docRef = await addDoc(projectsRef, cleanedProject)
      newProject.id = docRef.id
      return newProject
    } catch (error) {
      // Error al crear proyecto en Firestore
      throw error
    }
  }
  
  // Modo local
  newProject.id = Date.now().toString()
  projectsDB.push(newProject)
  persistProjectsDB()
  return newProject
}

/**
 * Actualizar proyecto
 */
export const updateProject = async (id: string, updates: UpdateProjectData): Promise<Project> => {
  // Validar que el ID sea válido
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('ID de proyecto inválido: debe ser una cadena no vacía')
  }
  
  // Validar duplicados si se está actualizando el título
  if (updates.title && USE_FIREBASE) {
    try {
      const existingProjects = await getProjects()
      const slug = generateProjectSlug(updates.title)
      
      const duplicateByTitle = existingProjects.find(p => 
        p.title.toLowerCase() === updates.title!.toLowerCase() && 
        p.id !== id
      )
      const duplicateBySlug = existingProjects.find(p => 
        p.slug === slug && 
        p.id !== id
      )
      
      if (duplicateByTitle) {
        throw new Error(`Ya existe un proyecto con el título "${updates.title}"`)
      }
      
      if (duplicateBySlug) {
        throw new Error(`Ya existe un proyecto con el slug "${slug}"`)
      }
      
      // Si el título cambió, actualizar también el slug
      if (updates.title) {
        updates.slug = slug
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Ya existe un proyecto')) {
        throw error
      }
      console.warn('Error al verificar duplicados en actualización, continuando:', error)
    }
  }
  
  if (USE_FIREBASE) {
    try {
      const projectRef = doc(db, 'portfolio', id)
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // Limpiar campos undefined antes de enviar a Firebase
      const cleanedUpdateData = cleanUndefinedFields(updateData)
      
      await updateDoc(projectRef, cleanedUpdateData)
      
      // Obtener el proyecto actualizado
      const updatedProject = await getProjectById(id)
      if (!updatedProject) {
        throw new Error('Proyecto no encontrado después de la actualización')
      }
      return updatedProject
    } catch (error) {
      // Error al actualizar proyecto en Firestore
      
      throw error
    }
  }
  
  // Modo local
  const index = projectsDB.findIndex(p => p.id === id)
  if (index === -1) {
    throw new Error('Proyecto no encontrado')
  }
  
  projectsDB[index] = {
    ...projectsDB[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  persistProjectsDB()
  return projectsDB[index]
}

/**
 * Eliminar proyecto
 */
export const deleteProject = async (id: string): Promise<void> => {
  if (USE_FIREBASE) {
    try {
      const projectRef = doc(db, 'portfolio', id)
      await deleteDoc(projectRef)
      return
    } catch (error) {
      console.error('Error al eliminar proyecto en Firestore:', error)
      throw error
    }
  }
  
  // Modo local
  const index = projectsDB.findIndex(p => p.id === id)
  if (index === -1) {
    throw new Error('Proyecto no encontrado')
  }
  
  projectsDB.splice(index, 1)
  persistProjectsDB()
}

/**
 * Obtener proyectos destacados
 */
export const getFeaturedProjects = async (limit?: number): Promise<Project[]> => {
  const projects = await getProjects()
  const featured = projects.filter(p => p.featured)
  
  return limit ? featured.slice(0, limit) : featured
}

/**
 * Obtener proyectos por categoría
 */
export const getProjectsByCategory = async (category: string): Promise<Project[]> => {
  if (USE_FIREBASE) {
    try {
      const projectsRef = collection(db, 'portfolio')
      const q = query(
        projectsRef, 
        where('category', '==', category),
        orderBy('updatedAt', 'desc')
      )
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id  // ✅ Asignar el ID DESPUÉS para que no sea sobrescrito
        } as Project
      })
    } catch (error) {
      console.error('Error al obtener proyectos por categoría desde Firestore:', error)
    }
  }
  
  return projectsDB.filter(p => p.category === category)
}

/**
 * Obtener proyectos por tecnología
 */
export const getProjectsByTechnology = async (technology: string): Promise<Project[]> => {
  const projects = await getProjects()
  return projects.filter(p => 
    p.technologies?.some(tech => 
      tech.toLowerCase().includes(technology.toLowerCase())
    )
  )
}

/**
 * Buscar proyectos
 */
export const searchProjects = async (searchTerm: string): Promise<Project[]> => {
  const projects = await getProjects()
  const term = searchTerm.toLowerCase()
  
  return projects.filter(p => 
    p.title.toLowerCase().includes(term) ||
    p.description.toLowerCase().includes(term) ||
    p.fullDescription.toLowerCase().includes(term) ||
    p.technologies?.some(tech => tech.toLowerCase().includes(term)) ||
    p.category.toLowerCase().includes(term)
  )
}

/**
 * Generar slug único para proyecto
 */
export const generateProjectSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  // En una implementación real, verificarías unicidad
  return baseSlug
}

/**
 * Obtener todas las tecnologías únicas
 */
export const getAllTechnologies = async (): Promise<string[]> => {
  const projects = await getProjects()
  const allTechs = projects.flatMap(p => p.technologies || [])
  return [...new Set(allTechs)].sort()
}

/**
 * Obtener todas las categorías únicas
 */
export const getAllCategories = async (): Promise<string[]> => {
  const projects = await getProjects()
  const allCategories = projects.map(p => p.category)
  return [...new Set(allCategories)].sort()
}

// Función auxiliar para limpiar campos undefined antes de enviar a Firebase
const cleanUndefinedFields = (obj: any): any => {
  const cleaned: any = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        cleaned[key] = cleanUndefinedFields(obj[key])
      } else {
        cleaned[key] = obj[key]
      }
    }
  }
  return cleaned
}