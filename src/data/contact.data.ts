import type { ContactData } from '@/types/contact.types'

export const contactData: ContactData = {
    contactInfo: {
        email: 'cesar@ejemplo.com',
        phone: '+54 9 11 1234-5678',
        location: 'Buenos Aires, Argentina',
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