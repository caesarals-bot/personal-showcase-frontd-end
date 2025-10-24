import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { AboutData, Profile } from '@/types/about.types';
import { aboutData } from '@/data/about.data';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { ImageUploadService } from './imageUploadService';

// Flag para usar Firebase
const USE_FIREBASE = true;

// Claves para localStorage
const ABOUT_STORAGE_KEY = 'about_data_db';
const PROFILE_STORAGE_KEY = 'profile_data_db';

// Base de datos en memoria para AboutData
let aboutDataDB: AboutData = { ...aboutData };

// Base de datos en memoria para Profile
let profileDB: Profile | null = null;

// Función para persistir la base de datos en localStorage
const persistAboutDB = () => {
  try {
    localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(aboutDataDB));
  } catch (error) {
    console.error('Error al guardar about data en localStorage:', error);
  }
};

// Función para persistir el perfil en localStorage
const persistProfileDB = () => {
  try {
    if (profileDB) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileDB));
    }
  } catch (error) {
    console.error('Error al guardar profile en localStorage:', error);
  }
};

// Función para inicializar la base de datos desde Firebase o localStorage
const initializeAboutDB = async () => {
  if (USE_FIREBASE) {
    try {
      // Intentar cargar desde Firebase primero
      aboutDataDB = await getAboutDataFromFirestore();
      return;
    } catch (error) {
      console.warn('⚠️ Error al cargar desde Firebase, usando localStorage:', error);
      // Fallback a localStorage si Firebase falla
    }
  }

  // Cargar desde localStorage (modo local o fallback)
  try {
    const storedData = localStorage.getItem(ABOUT_STORAGE_KEY);
    if (storedData) {
      const data = safeJsonParse<AboutData>(storedData);
      if (data) {
        aboutDataDB = data;
      } else {
        console.warn('⚠️ Datos corruptos en about_data_db. Reinicializando...');
        aboutDataDB = { ...aboutData };
        persistAboutDB();
      }
    } else {
      aboutDataDB = { ...aboutData };
      persistAboutDB();
    }
  } catch (error) {
    console.error('Error al cargar about data desde localStorage:', error);
    aboutDataDB = { ...aboutData };
  }
};

// Función para inicializar el perfil desde localStorage
const initializeProfileDB = () => {
  try {
    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (storedProfile) {
      const profile = safeJsonParse<Profile>(storedProfile);
      if (profile) {
        profileDB = profile;
      } else {
        console.warn('⚠️ Datos corruptos en profile_data_db. Limpiando...');
        localStorage.removeItem(PROFILE_STORAGE_KEY);
        profileDB = null;
      }
    }
  } catch (error) {
    console.error('Error al cargar profile desde localStorage:', error);
  }
};

// Inicializar las bases de datos al cargar el módulo
initializeAboutDB().catch(error => {
  console.error('Error al inicializar aboutDB:', error);
});
initializeProfileDB();

// Simulación de delay de red
const delay = () => new Promise(resolve => setTimeout(resolve, 300));

// Simulación de API/Firebase
export class AboutService {
  // Método actual (datos locales)
  static async getAboutData(): Promise<AboutData> {
    if (USE_FIREBASE) {
      return await getAboutDataFromFirestore();
    }
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

    if (USE_FIREBASE) {
      try {
        // Persistir en Firestore primero
        await updateAboutDataInFirestore(aboutDataDB);
        // Solo guardar en localStorage como cache después de éxito en Firebase
        persistAboutDB();
      } catch (error) {
        console.error('Error al guardar en Firestore, usando localStorage como fallback:', error);
        // Fallback: guardar en localStorage si Firebase falla
        persistAboutDB();
      }
    } else {
      // Modo local: solo persistir en localStorage
      persistAboutDB();
    }

    return { ...aboutDataDB };
  }

  // Resetear a valores iniciales
  static resetAboutData(): void {
    aboutDataDB = { ...aboutData };
    persistAboutDB();
  }
}

/**
 * Obtener perfil desde Firestore o localStorage
 */
export async function getProfile(): Promise<Profile | null> {
  if (!USE_FIREBASE) {
    return getProfileLocal();
  }

  try {
    const docRef = doc(db, 'profile', 'about');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.warn('Perfil no encontrado en Firestore, usando localStorage');
      return getProfileLocal();
    }
    
    const data = docSnap.data();
    const profile = {
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
    
    // Guardar en localStorage para persistencia
    profileDB = profile;
    persistProfileDB();
    
    return profile;
  } catch (error) {
    console.error('Error al obtener perfil desde Firebase, usando localStorage:', error);
    return getProfileLocal();
  }
}

/**
 * Actualizar perfil en Firestore y localStorage
 */
export async function updateProfile(data: Partial<Profile>): Promise<void> {
  // Actualizar en localStorage primero (para persistencia inmediata)
  if (profileDB) {
    profileDB = { ...profileDB, ...data, updatedAt: new Date().toISOString() };
  } else {
    // Si no existe perfil en memoria, crear uno básico
    profileDB = {
      id: 'about',
      fullName: data.fullName || '',
      title: data.title || '',
      bio: data.bio || '',
      avatar: data.avatar || '',
      resume: data.resume || '',
      skills: data.skills || [],
      languages: data.languages || [],
      interests: data.interests || [],
      contact: data.contact || { email: '' },
      social: data.social || {},
      updatedAt: new Date().toISOString()
    };
  }
  persistProfileDB();

  // Si Firebase está habilitado, también actualizar allí
  if (USE_FIREBASE) {
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
      console.error('Error al actualizar perfil en Firebase (datos guardados en localStorage):', error);
      // No lanzar error porque los datos ya están guardados en localStorage
    }
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
 * Versión local (fallback) - usa localStorage si está disponible
 */
function getProfileLocal(): Profile | null {
  // Si hay datos en localStorage, usarlos
  if (profileDB) {
    return profileDB;
  }
  
  // Si no hay datos guardados, retornar null para que el componente maneje el estado inicial
  return null;
}

/**
 * Obtener datos About desde Firestore
 */
async function getAboutDataFromFirestore(): Promise<AboutData> {
  try {
    const docRef = doc(db, 'about', 'data');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const firestoreData = docSnap.data() as AboutData;
      
      // Actualizar caché local
      aboutDataDB = firestoreData;
      persistAboutDB();
      
      return firestoreData;
    } else {
      // Si no existe el documento, crear uno con los datos iniciales
      await updateAboutDataInFirestore(aboutDataDB);
      return { ...aboutDataDB };
    }
  } catch (error) {
    console.error('Error al obtener datos About desde Firestore:', error);
    // Fallback a datos locales
    return { ...aboutDataDB };
  }
}

/**
 * Actualizar datos About en Firestore
 */
async function updateAboutDataInFirestore(data: AboutData): Promise<void> {
  try {
    const docRef = doc(db, 'about', 'data');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Actualizar documento existente
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } else {
      // Crear documento nuevo
      await setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error al actualizar datos About en Firestore:', error);
    throw error;
  }
}

/**
 * Extraer la ruta de Storage desde una URL de Firebase
 */
function extractStoragePathFromUrl(url: string): string | null {
  try {
    // Patrón para URLs de Firebase Storage
    const match = url.match(/\/o\/(.+?)\?/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch (error) {
    console.error('Error al extraer ruta de Storage:', error);
    return null;
  }
}

/**
 * Eliminar una imagen específica de las secciones About
 */
export async function removeAboutImage(imageUrl: string, sectionId?: string): Promise<void> {
  if (USE_FIREBASE) {
    try {
      const currentData = await getAboutDataFromFirestore();
      
      if (!currentData || !currentData.sections || !currentData.sections.length) {
        return;
      }

      // Eliminar de Firebase Storage
      const path = extractStoragePathFromUrl(imageUrl);
      if (path) {
        try {
          await ImageUploadService.deleteImage(path);
        } catch (err) {
          console.warn('⚠️ No se pudo eliminar la imagen del Storage:', err);
          // No lanzar error, continuar con la actualización de Firestore
        }
      }

      // Actualizar las secciones removiendo la imagen
      const updatedSections = currentData.sections.map(section => {
        // Si se especifica un sectionId, solo actualizar esa sección
        if (sectionId && section.id !== sectionId) {
          return section;
        }

        const updatedSection = { ...section };
        
        // Remover de la imagen principal si coincide
        if (updatedSection.image === imageUrl) {
          updatedSection.image = '';
        }
        
        // Remover de las imágenes adicionales si existe
        if (updatedSection.images) {
          updatedSection.images = updatedSection.images.filter((url: string) => url !== imageUrl);
        }
        
        // Remover de la galería si existe
        if (updatedSection.gallery) {
          updatedSection.gallery = updatedSection.gallery.filter((url: string) => url !== imageUrl);
        }
        
        return updatedSection;
      });

      const updatedData = { ...currentData, sections: updatedSections };
      
      await updateAboutDataInFirestore(updatedData);
      
      // Actualizar cache local
      aboutDataDB = updatedData;
      persistAboutDB();
      
      return;
    } catch (error) {
      console.error('❌ Error al eliminar imagen de About:', error);
      throw error;
    }
  }

  // Modo local
  if (aboutDataDB.sections) {
    aboutDataDB.sections = aboutDataDB.sections.map(section => {
      // Si se especifica un sectionId, solo actualizar esa sección
      if (sectionId && section.id !== sectionId) {
        return section;
      }

      const updatedSection = { ...section };
      
      // Remover de la imagen principal si coincide
      if (updatedSection.image === imageUrl) {
        updatedSection.image = '';
      }
      
      // Remover de las imágenes adicionales si existe
      if (updatedSection.images) {
        updatedSection.images = updatedSection.images.filter((url: string) => url !== imageUrl);
      }
      
      // Remover de la galería si existe
      if (updatedSection.gallery) {
        updatedSection.gallery = updatedSection.gallery.filter((url: string) => url !== imageUrl);
      }
      
      return updatedSection;
    });
    persistAboutDB();
  }
}

/**
 * Eliminar múltiples imágenes de las secciones About
 */
export async function removeAboutImages(imageUrls: string[], sectionId?: string): Promise<void> {
  if (USE_FIREBASE) {
    try {
      const currentData = await getAboutDataFromFirestore();
      
      if (!currentData || !currentData.sections || !currentData.sections.length) {
        return;
      }

      // Eliminar de Firebase Storage
      const deletionPromises = imageUrls.map(async (imageUrl) => {
        const path = extractStoragePathFromUrl(imageUrl);
        if (path) {
          try {
            await ImageUploadService.deleteImage(path);
          } catch (err) {
            console.warn('⚠️ No se pudo eliminar la imagen del Storage:', err);
            // No lanzar error, continuar con las demás eliminaciones
          }
        }
      });

      await Promise.all(deletionPromises);

      // Actualizar las secciones removiendo las imágenes
      const updatedSections = currentData.sections.map(section => {
        // Si se especifica un sectionId, solo actualizar esa sección
        if (sectionId && section.id !== sectionId) {
          return section;
        }

        const updatedSection = { ...section };
        
        // Remover de la imagen principal si coincide con alguna de las URLs
        if (imageUrls.includes(updatedSection.image)) {
          updatedSection.image = '';
        }
        
        // Remover de las imágenes adicionales si existe
        if (updatedSection.images) {
          updatedSection.images = updatedSection.images.filter((url: string) => !imageUrls.includes(url));
        }
        
        // Remover de la galería si existe
        if (updatedSection.gallery) {
          updatedSection.gallery = updatedSection.gallery.filter((url: string) => !imageUrls.includes(url));
        }
        
        return updatedSection;
      });

      const updatedData = { ...currentData, sections: updatedSections };
      
      await updateAboutDataInFirestore(updatedData);
      
      // Actualizar cache local
      aboutDataDB = updatedData;
      persistAboutDB();
      
      return;
    } catch (error) {
      console.error('❌ Error al eliminar imágenes de About:', error);
      throw error;
    }
  }

  // Modo local
  if (aboutDataDB.sections) {
    aboutDataDB.sections = aboutDataDB.sections.map(section => {
      // Si se especifica un sectionId, solo actualizar esa sección
      if (sectionId && section.id !== sectionId) {
        return section;
      }

      const updatedSection = { ...section };
      
      // Remover de la imagen principal si coincide con alguna de las URLs
      if (imageUrls.includes(updatedSection.image)) {
        updatedSection.image = '';
      }
      
      // Remover de las imágenes adicionales si existe
      if (updatedSection.images) {
        updatedSection.images = updatedSection.images.filter((url: string) => !imageUrls.includes(url));
      }
      
      // Remover de la galería si existe
      if (updatedSection.gallery) {
        updatedSection.gallery = updatedSection.gallery.filter((url: string) => !imageUrls.includes(url));
      }
      
      return updatedSection;
    });
    persistAboutDB();
  }
}