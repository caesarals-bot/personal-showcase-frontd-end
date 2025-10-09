/**
 * Tipos para el Panel de Administración
 * 
 * Este archivo contiene todas las interfaces y tipos necesarios
 * para el sistema de administración del blog y gestión de contenido.
 */

import type { BlogPost, Category, Tag, User } from './blog.types'

// ============================================================================
// TIPOS PARA POSTS
// ============================================================================

/**
 * Datos para crear un nuevo post
 */
export interface CreatePostData {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  categoryId: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
}

/**
 * Datos para actualizar un post existente
 */
export interface UpdatePostData extends Partial<CreatePostData> {
  id: string
}

/**
 * Estado del formulario de post
 */
export interface PostFormState {
  data: CreatePostData
  errors: Partial<Record<keyof CreatePostData, string>>
  isSubmitting: boolean
  isDirty: boolean
}

// ============================================================================
// TIPOS PARA CATEGORÍAS
// ============================================================================

/**
 * Datos para crear una nueva categoría
 */
export interface CreateCategoryData {
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
}

/**
 * Datos para actualizar una categoría existente
 */
export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string
}

// ============================================================================
// TIPOS PARA TAGS
// ============================================================================

/**
 * Datos para crear un nuevo tag
 */
export interface CreateTagData {
  name: string
  slug: string
}

/**
 * Datos para actualizar un tag existente
 */
export interface UpdateTagData extends Partial<CreateTagData> {
  id: string
}

// ============================================================================
// TIPOS PARA GESTIÓN DE USUARIOS
// ============================================================================

/**
 * Datos para actualizar un usuario (admin)
 */
export interface UpdateUserData {
  id: string
  displayName?: string
  avatar?: string
  bio?: string
  role?: 'admin' | 'user' | 'guest'
  isActive?: boolean
  socialLinks?: {
    github?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
}

/**
 * Filtros para listar usuarios
 */
export interface UserFilters {
  role?: 'admin' | 'user' | 'guest' | 'all'
  isActive?: boolean
  search?: string
  sortBy?: 'createdAt' | 'displayName' | 'email'
  sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// TIPOS PARA DASHBOARD
// ============================================================================

/**
 * Estadísticas del dashboard
 */
export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalUsers: number
  activeUsers: number
  recentPosts: BlogPost[]
  topPosts: Array<{
    id: string
    title: string
    views: number
    likes: number
  }>
  categoriesStats: Array<{
    id: string
    name: string
    postsCount: number
    color: string
  }>
  tagsStats: Array<{
    id: string
    name: string
    postsCount: number
  }>
}

/**
 * Actividad reciente
 */
export interface RecentActivity {
  id: string
  type: 'post_created' | 'post_updated' | 'post_published' | 'comment_added' | 'user_registered'
  title: string
  description: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  metadata?: Record<string, any>
}

// ============================================================================
// TIPOS PARA PERFIL (ABOUT)
// ============================================================================

/**
 * Información personal del perfil
 */
export interface ProfilePersonalInfo {
  fullName: string
  title: string
  bio: string
  avatar: string
  email: string
  phone?: string
  location: string
  availability: 'available' | 'busy' | 'not-available'
}

/**
 * Habilidad técnica
 */
export interface Skill {
  id?: string
  name: string
  level: number // 0-100
  category: 'frontend' | 'backend' | 'tools' | 'other'
}

/**
 * Experiencia laboral
 */
export interface Experience {
  id: string
  company: string
  position: string
  startDate: string // YYYY-MM
  endDate?: string // null si es trabajo actual
  description: string
  technologies: string[]
  current?: boolean
}

/**
 * Educación
 */
export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string // YYYY-MM
  endDate?: string
  description?: string
  current?: boolean
}

/**
 * Perfil completo
 */
export interface Profile {
  id: 'main'
  personalInfo: ProfilePersonalInfo
  socialLinks: {
    github?: string
    linkedin?: string
    twitter?: string
    instagram?: string
    youtube?: string
    website?: string
  }
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  updatedAt: string
}

/**
 * Datos para actualizar el perfil
 */
export interface UpdateProfileData extends Partial<Omit<Profile, 'id' | 'updatedAt'>> {}

// ============================================================================
// TIPOS PARA PORTFOLIO
// ============================================================================

/**
 * Proyecto del portfolio
 */
export interface Project {
  id: string
  title: string
  slug: string
  description: string
  fullDescription: string
  coverImage: string
  images: string[]
  technologies: string[]
  category: string
  status: 'completed' | 'in-progress' | 'planned'
  featured: boolean
  links: {
    live?: string
    github?: string
    demo?: string
  }
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt?: string
}

/**
 * Datos para crear un proyecto
 */
export interface CreateProjectData {
  title: string
  slug: string
  description: string
  fullDescription: string
  coverImage: string
  images?: string[]
  technologies: string[]
  category: string
  status: 'completed' | 'in-progress' | 'planned'
  featured: boolean
  links?: {
    live?: string
    github?: string
    demo?: string
  }
  startDate: string
  endDate?: string
}

/**
 * Datos para actualizar un proyecto
 */
export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string
}

// ============================================================================
// TIPOS PARA NAVEGACIÓN DEL ADMIN
// ============================================================================

/**
 * Item del menú de navegación
 */
export interface AdminNavItem {
  id: string
  label: string
  icon: string // Nombre del icono de lucide-react
  path: string
  badge?: number
  children?: AdminNavItem[]
}

/**
 * Secciones del panel de admin
 */
export type AdminSection = 
  | 'dashboard'
  | 'posts'
  | 'categories'
  | 'tags'
  | 'users'
  | 'profile'
  | 'portfolio'
  | 'settings'

// ============================================================================
// TIPOS PARA TABLAS Y LISTADOS
// ============================================================================

/**
 * Configuración de columnas para tablas
 */
export interface TableColumn<T = any> {
  id: string
  label: string
  accessor: keyof T | ((row: T) => any)
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => React.ReactNode
}

/**
 * Acciones de tabla
 */
export interface TableAction<T = any> {
  id: string
  label: string
  icon?: string
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  onClick: (row: T) => void
  show?: (row: T) => boolean
}

/**
 * Configuración de paginación
 */
export interface TablePagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ============================================================================
// TIPOS PARA FORMULARIOS
// ============================================================================

/**
 * Estado genérico de formulario
 */
export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isDirty: boolean
}

/**
 * Opciones de campo de formulario
 */
export interface FormFieldOption {
  value: string
  label: string
  disabled?: boolean
}

// ============================================================================
// TIPOS PARA NOTIFICACIONES
// ============================================================================

/**
 * Notificación del sistema
 */
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// ============================================================================
// TIPOS PARA SUBIDA DE ARCHIVOS
// ============================================================================

/**
 * Archivo subido
 */
export interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

/**
 * Progreso de subida
 */
export interface UploadProgress {
  fileId: string
  progress: number // 0-100
  status: 'uploading' | 'success' | 'error'
  error?: string
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  BlogPost,
  Category,
  Tag,
  User
}
