import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { AboutData, Profile } from '@/types/about.types';
import { aboutData } from '@/data/about.data';

// Flag para usar Firebase
const USE_FIREBASE = true;

// Base de datos en memoria
let aboutDataDB: AboutData = { ...aboutData };

// Simulación de delay de red
const delay = () => new Promise(resolve => setTimeout(resolve, 300));

// Simulación de API/Firebase
export class AboutService {
  // Método actual (datos locales)
  static async getAboutData(): Promise<AboutData> {
    await delay();
    return { ...aboutDataDB };
  }

  // Actualizar datos del About
  static async updateAboutData(data: Partial<AboutData>): Promise<AboutData> {
    await delay();
    
    aboutDataDB = {
      ...aboutDataDB,
      ...data,
    };

    return { ...aboutDataDB };
  }

  // Resetear a valores iniciales
  static resetAboutData(): void {
    aboutDataDB = { ...aboutData };
  }
}

/**
 * Obtener perfil desde Firestore
 */
export async function getProfile(): Promise<Profile | null> {
  if (!USE_FIREBASE) {
    return getProfileLocal();
  }

  try {
    const docRef = doc(db, 'profile', 'about');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.warn('Perfil no encontrado en Firestore');
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      fullName: data.fullName || '',
      title: data.title || '',
      bio: data.bio || '',
      avatar: data.avatar,
      resume: data.resume,
      skills: data.skills || [],
      languages: data.languages || [],
      interests: data.interests || [],
      contact: data.contact || { email: '' },
      social: data.social || {},
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    };
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return null;
  }
}

/**
 * Actualizar perfil en Firestore
 */
export async function updateProfile(data: Partial<Profile>): Promise<void> {
  try {
    const docRef = doc(db, 'profile', 'about');
    
    // Verificar si existe
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Crear documento si no existe
      await setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } else {
      // Actualizar documento existente
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
}

/**
 * Crear perfil inicial en Firestore
 */
export async function createProfile(data: Omit<Profile, 'id' | 'updatedAt'>): Promise<void> {
  try {
    const docRef = doc(db, 'profile', 'about');
    await setDoc(docRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error al crear perfil:', error);
    throw error;
  }
}

/**
 * Versión local (fallback)
 */
function getProfileLocal(): Profile {
  return {
    id: 'about',
    fullName: 'Tu Nombre',
    title: 'Full Stack Developer',
    bio: 'Desarrollador apasionado por crear experiencias digitales excepcionales.',
    skills: ['React', 'TypeScript', 'Node.js'],
    contact: {
      email: 'tu@email.com',
      phone: '+57 300 123 4567',
      whatsapp: '+57 300 123 4567'
    },
    social: {
      github: 'https://github.com/tuusuario',
      linkedin: 'https://linkedin.com/in/tuusuario'
    }
  };
}