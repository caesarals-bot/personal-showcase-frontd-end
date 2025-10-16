import type { ContactData } from '@/types/contact.types';
import { contactData } from '@/data/contact.data';
import { getProfile } from './aboutService';

const USE_FIREBASE = true;

export class ContactService {
    static async getContactData(): Promise<ContactData> {
        if (!USE_FIREBASE) {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 200));
            return contactData;
        }

        try {
            // Obtener datos del perfil de Firebase
            const profile = await getProfile();
            
            if (!profile) {
                return contactData;
            }

            // Mapear datos del perfil al formato de ContactData
            return {
                contactInfo: {
                    email: profile.contact.email,
                    phone: profile.contact.phone || '',
                    location: profile.contact.location || '',
                    socialLinks: [
                        {
                            id: 'github',
                            name: 'GitHub',
                            url: profile.social.github || '',
                            icon: 'github',
                            isVisible: !!profile.social.github
                        },
                        {
                            id: 'linkedin',
                            name: 'LinkedIn',
                            url: profile.social.linkedin || '',
                            icon: 'linkedin',
                            isVisible: !!profile.social.linkedin
                        },
                        {
                            id: 'twitter',
                            name: 'Twitter',
                            url: profile.social.twitter || '',
                            icon: 'twitter',
                            isVisible: !!profile.social.twitter
                        },
                        {
                            id: 'instagram',
                            name: 'Instagram',
                            url: profile.social.instagram || '',
                            icon: 'instagram',
                            isVisible: !!profile.social.instagram
                        }
                    ]
                }
            };
        } catch (error) {
            // Fallback a datos locales en caso de error
            return contactData;
        }
    }
}