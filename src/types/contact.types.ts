export interface SocialLink {
    id: string
    name: string
    url: string
    icon: string
    color?: string
    isVisible: boolean
}

export interface ContactInfo {
    email: string
    phone?: string
    location?: string
    socialLinks: SocialLink[]
}

export interface ContactData {
    contactInfo: ContactInfo
}