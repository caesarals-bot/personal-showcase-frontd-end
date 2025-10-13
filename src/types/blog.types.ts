// Tipos para el sistema de blog

export type PostStatus = 'draft' | 'review' | 'published' | 'archived'

export interface BlogPost {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    author: Author
    publishedAt: string
    updatedAt?: string
    readingTime: number // en minutos
    category: Category
    tags: Tag[]
    featuredImage?: string
    gallery?: string[] // Galería de imágenes adicionales
    status: PostStatus // Estado del post: draft, review, published, archived
    isPublished: boolean // DEPRECATED: Usar 'status' en su lugar
    isFeatured: boolean
    likes: number // Contador de likes
    views: number // Contador de vistas
    commentsCount: number // Contador de comentarios
}

export interface Author {
    id: string
    name: string
    avatar?: string
    bio?: string
    social?: {
        twitter?: string
        linkedin?: string
        github?: string
        website?: string
    }
}

export interface Category {
    id: string
    name: string
    slug: string
    description?: string
    color: string // Para el badge de categoría
    icon?: string // Icono de la categoría
}

export interface Tag {
    id: string
    name: string
    slug: string
    color?: string
}

// Sistema de likes y interacción
export interface BlogLike {
    id: string
    postId: string
    userId: string
    createdAt: string
}

export interface BlogComment {
    id: string
    postId: string
    author: CommentAuthor
    content: string
    createdAt: string
    updatedAt?: string
    likes: number
    replies?: BlogComment[]
    parentId?: string
}

export interface CommentAuthor {
    id: string
    name: string
    avatar?: string
    email: string
    isVerified: boolean
}

// Sistema de autenticación
export interface User {
    id: string
    email: string
    displayName: string        // Nombre completo público
    firstName?: string          // Nombre
    lastName?: string           // Apellido
    userName?: string           // Alias único
    avatar?: string
    bio?: string
    isVerified: boolean
    isActive?: boolean
    role: 'admin' | 'user' | 'guest'
    createdAt: string
    updatedAt?: string
    socialLinks?: {
        twitter?: string
        linkedin?: string
        github?: string
        website?: string
    }
}

export interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

// Filtros y búsqueda (actualizado)
export interface BlogFilters {
    category?: string
    tags?: string[]
    author?: string
    search?: string
    sortBy?: 'publishedAt' | 'title' | 'readingTime' | 'likes' | 'views'
    sortOrder?: 'asc' | 'desc'
    featured?: boolean
}

// Paginación
export interface BlogPagination {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

// Respuesta de la API
export interface BlogResponse {
    posts: BlogPost[]
    pagination: BlogPagination
    filters: BlogFilters
}

// Props para componentes (actualizado)
export interface BlogCardProps {
    post: BlogPost
    variant?: 'default' | 'featured' | 'compact'
    showAuthor?: boolean
    showCategory?: boolean
    showTags?: boolean
    showReadingTime?: boolean
    showLikes?: boolean
    showViews?: boolean
    onLike?: (postId: string) => void
    isLiked?: boolean
    currentUser?: User | null
}

export interface BlogFiltersProps {
    categories: Category[]
    tags: Tag[]
    authors: Author[]
    currentFilters: BlogFilters
    onFiltersChange: (filters: BlogFilters) => void
}

export interface BlogSearchProps {
    searchTerm: string
    onSearchChange: (term: string) => void
    placeholder?: string
}

// Props para comentarios
export interface BlogCommentsProps {
    postId: string
    comments: BlogComment[]
    currentUser: User | null
    onAddComment: (content: string, parentId?: string) => void
    onLikeComment: (commentId: string) => void
    isLoading: boolean
}

export interface CommentFormProps {
    onSubmit: (content: string) => void
    placeholder?: string
    buttonText?: string
    isLoading?: boolean
    currentUser: User | null
}

// Props para colaboración
export interface CollaborationSectionProps {
    onContactClick: () => void
}

// Estados del blog (actualizado)
export type BlogLoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface BlogState {
    posts: BlogPost[]
    categories: Category[]
    tags: Tag[]
    authors: Author[]
    filters: BlogFilters
    pagination: BlogPagination
    loading: BlogLoadingState
    error: string | null
    userLikes: string[] // IDs de posts que el usuario ha dado like
}

// Configuración de Firebase/API
export interface BlogConfig {
    apiEndpoint?: string
    firebaseConfig?: {
        apiKey: string
        authDomain: string
        projectId: string
        storageBucket: string
        messagingSenderId: string
        appId: string
    }
    features: {
        likes: boolean
        comments: boolean
        authentication: boolean
        collaboration: boolean
    }
}

// Tipos para servicios
export interface BlogService {
    getPosts: (filters?: BlogFilters, pagination?: Partial<BlogPagination>) => Promise<BlogResponse>
    getPost: (slug: string) => Promise<BlogPost>
    likePost: (postId: string, userId: string) => Promise<void>
    unlikePost: (postId: string, userId: string) => Promise<void>
    addComment: (postId: string, comment: Omit<BlogComment, 'id' | 'createdAt'>) => Promise<BlogComment>
    getComments: (postId: string) => Promise<BlogComment[]>
}

export interface AuthService {
    login: (email: string, password: string) => Promise<User>
    register: (userData: Omit<User, 'id' | 'createdAt' | 'isVerified' | 'role'>) => Promise<User>
    logout: () => Promise<void>
    getCurrentUser: () => Promise<User | null>
    updateProfile: (userData: Partial<User>) => Promise<User>
}
