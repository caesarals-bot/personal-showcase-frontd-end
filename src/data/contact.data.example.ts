import type { ContactData } from '@/types/contact.types'

/**
 * ARCHIVO DE EJEMPLO - NO USAR EN PRODUCCIÓN
 * 
 * Copia este archivo como 'contact.data.ts' y actualiza con tu información real:
 * 1. cp contact.data.example.ts contact.data.ts
 * 2. Actualiza email, teléfono y URLs de redes sociales
 * 3. El archivo contact.data.ts está en .gitignore para proteger tu información
 */

export const contactData: ContactData = {
    contactInfo: {
        email: 'tu-email@ejemplo.com',
        phone: '+1 234 567-8900',
        location: 'Tu Ciudad, Tu País',
        socialLinks: [
            {
                id: '1',
                name: 'GitHub',
                url: 'https://github.com/tu-usuario',
                icon: 'github',
                color: '#333',
                isVisible: true
            },
            {
                id: '2',
                name: 'LinkedIn',
                url: 'https://linkedin.com/in/tu-perfil',
                icon: 'linkedin',
                color: '#0077B5',
                isVisible: true
            },
            {
                id: '3',
                name: 'Twitter',
                url: 'https://twitter.com/tu-usuario',
                icon: 'twitter',
                color: '#1DA1F2',
                isVisible: true
            },
            {
                id: '4',
                name: 'Instagram',
                url: 'https://instagram.com/tu-usuario',
                icon: 'instagram',
                color: '#E4405F',
                isVisible: false
            }
        ]
    }
}
