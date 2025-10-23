export interface AboutSection {
    id: string
    title: string
    content: string
    image: string
    imageAlt: string
    imagePosition: 'left' | 'right'
}

export interface AboutData {
    sections: AboutSection[]
}

// Información de contacto
export interface ContactInfo {
    email: string
    phone?: string
    whatsapp?: string
    location?: string
}

// Redes sociales
export interface SocialLinks {
    github?: string
    linkedin?: string
    twitter?: string
    instagram?: string
    website?: string
    // Redes sociales adicionales dinámicas
    additional?: Array<{ name: string; url: string; icon?: string }>
}

// Perfil completo
export interface Profile {
    id: string
    fullName: string
    title: string
    bio: string
    avatar?: string
    resume?: string
    skills: string[]
    languages?: Array<{ name: string; level: string }>
    interests?: string[]
    contact: ContactInfo
    social: SocialLinks
    updatedAt?: string
}