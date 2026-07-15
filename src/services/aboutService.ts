import type { AboutData, AboutSection, Profile } from '@/types/about.types';
import { aboutData } from '@/data/about.data';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { ImageKitService } from './imageKitService';

const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';

// Claves para localStorage
const ABOUT_STORAGE_KEY = 'about_db';
const PROFILE_STORAGE_KEY = 'profile_data_db';

// Cache para About data
interface CacheEntry {
  data: AboutData;
  timestamp: number;
}

let aboutCache: CacheEntry | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function isCacheValid(): boolean {
  return aboutCache !== null && (Date.now() - aboutCache.timestamp) < CACHE_DURATION;
}

function clearAboutCache(): void {
  aboutCache = null;
}

export { clearAboutCache };

// Base de datos en memoria para AboutData
let aboutDataDB: AboutData = { ...aboutData };

// Base de datos en memoria para Profile
let profileDB: Profile | null = null;

// Función para persistir la base de datos en localStorage
const persistAboutDB = () => {
  try {
    localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(aboutDataDB));
  } catch (error) {
    console.error('Error al guardar datos de About en localStorage:', error);
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

// Función para inicializar la base de datos local
const initializeAboutDB = () => {
  try {
    const stored = localStorage.getItem(ABOUT_STORAGE_KEY);
    if (stored) {
      const parsed = safeJsonParse<AboutData>(stored);
      if (parsed && parsed.sections && Array.isArray(parsed.sections)) {
        aboutDataDB = parsed;
        return;
      }
    }
  } catch (error) {
    console.warn('Error al cargar datos de About desde localStorage:', error);
  }

  // Si no hay datos válidos, usar datos por defecto
  aboutDataDB = { ...aboutData };
  persistAboutDB();
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
initializeAboutDB();
initializeProfileDB();

/**
 * Obtener datos de About (función principal)
 */
export async function getAboutData(): Promise<AboutData> {
  if (USE_FIREBASE) {
    return getAboutDataFromFirestore();
  }
  return getAboutDataLocal();
}

/**
 * Obtener datos de About desde Firestore (con caché)
 */
async function getAboutDataFromFirestore(): Promise<AboutData> {
  try {
    // Verificar caché primero
    if (isCacheValid() && aboutCache) {
      return aboutCache.data;
    }

    const docRef = doc(db, 'about', 'data');
    const docSnap = await getDoc(docRef);
    
    let data: AboutData;
    
    if (docSnap.exists()) {
      data = docSnap.data() as AboutData;
      // Actualizar caché local
      aboutDataDB = data;
      persistAboutDB();
    } else {
      // Si no existe el documento, crearlo con los datos iniciales
      data = { ...aboutDataDB };
      await setDoc(docRef, data);
    }

    // Guardar en caché
    aboutCache = {
      data,
      timestamp: Date.now()
    };

    return data;
  } catch (error) {
    console.error('Error al obtener datos de About desde Firestore:', error);
    // Recurrir a datos locales como fallback
    return getAboutDataLocal();
  }
}

/**
 * Obtener datos de About desde localStorage
 */
async function getAboutDataLocal(): Promise<AboutData> {
  return { ...aboutDataDB };
}

/**
 * Actualizar datos de About (escritura completa del documento).
 * Mantenido por compatibilidad con código existente. Para mutaciones de secciones,
 * preferir createSection/updateSection/deleteSection que no dependen de cache en memoria.
 */
export async function updateAboutData(data: Partial<AboutData>): Promise<AboutData> {
  const currentData = await getAboutData();
  const mergedData: AboutData = {
    ...currentData,
    ...data,
  };

  aboutDataDB = mergedData;
  persistAboutDB();
  clearAboutCache();

  if (USE_FIREBASE) {
    await updateAboutDataInFirestore(mergedData);
  }

  return { ...mergedData };
}

/**
 * Crear una nueva sección en About.
 * Lee el documento actual, agrega la sección al array, escribe en Firestore.
 * Patrón equivalente a createPostInFirestore.
 */
export async function createSection(sectionInput: Omit<AboutSection, 'id'>): Promise<AboutSection> {
  const newSection: AboutSection = {
    id: `section-${Date.now()}`,
    ...sectionInput,
  };

  if (USE_FIREBASE) {
    await createSectionInFirestore(newSection);
  } else {
    aboutDataDB = {
      ...aboutDataDB,
      sections: [...(aboutDataDB.sections || []), newSection],
    };
    persistAboutDB();
  }

  clearAboutCache();
  return newSection;
}

/**
 * Actualizar una sección existente por id.
 * Lee el documento, hace merge campo por campo, escribe en Firestore.
 * Patrón equivalente a updatePostInFirestore.
 */
export async function updateSection(id: string, updates: Partial<AboutSection>): Promise<AboutSection> {
  if (USE_FIREBASE) {
    const updated = await updateSectionInFirestore(id, updates);
    clearAboutCache();
    return updated;
  }

  // Modo local
  const sections = aboutDataDB.sections || [];
  const index = sections.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error(`Sección con id "${id}" no encontrada`);
  }
  const merged = { ...sections[index], ...updates };
  const newSections = [...sections];
  newSections[index] = merged;
  aboutDataDB = { ...aboutDataDB, sections: newSections };
  persistAboutDB();
  clearAboutCache();
  return merged;
}

/**
 * Eliminar una sección por id.
 * Lee el documento, filtra del array, escribe en Firestore.
 */
export async function deleteSection(id: string): Promise<void> {
  if (USE_FIREBASE) {
    await deleteSectionInFirestore(id);
    clearAboutCache();
    return;
  }

  // Modo local
  const sections = aboutDataDB.sections || [];
  aboutDataDB = {
    ...aboutDataDB,
    sections: sections.filter(s => s.id !== id),
  };
  persistAboutDB();
  clearAboutCache();
}

// Simulación de API/Firebase
export class AboutService {
  // Método actual (datos locales)
  static async getAboutData(): Promise<AboutData> {
    return getAboutData();
  }

  // Método para forzar recarga desde Firestore (útil en admin)
  static async getAboutDataFresh(): Promise<AboutData> {
    clearAboutCache();
    return getAboutData();
  }

  // Crear una nueva sección
  static async createSection(section: Omit<AboutSection, 'id'>): Promise<AboutSection> {
    return createSection(section);
  }

  // Actualizar una sección existente
  static async updateSection(id: string, updates: Partial<AboutSection>): Promise<AboutSection> {
    return updateSection(id, updates);
  }

  // Eliminar una sección
  static async deleteSection(id: string): Promise<void> {
    return deleteSection(id);
  }

  // Eliminar la imagen de una sección (la borra de ImageKit y limpia Firestore)
  static async removeAboutImage(section: AboutSection): Promise<void> {
    return removeAboutImage(section);
  }

  // Actualizar datos del About (compatibilidad — preferir createSection/updateSection/deleteSection)
  static async updateAboutData(data: Partial<AboutData>): Promise<AboutData> {
    return updateAboutData(data);
  }

  // Resetear a valores iniciales
  static resetAboutData(): void {
    aboutDataDB = { ...aboutData };
    persistAboutDB();
    clearAboutCache();
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
 * Crear una sección en Firestore.
 * Si el documento about/data no existe, lo crea con la primera sección.
 * Si existe, hace append al array sections.
 */
async function createSectionInFirestore(section: AboutSection): Promise<void> {
  const docRef = doc(db, 'about', 'data');
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      sections: [section],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return;
  }

  const currentData = docSnap.data() as AboutData;
  const currentSections = currentData.sections || [];
  await updateDoc(docRef, {
    sections: [...currentSections, section],
    updatedAt: Timestamp.now(),
  });
}

/**
 * Actualizar una sección existente en Firestore.
 * Lee el doc actual, localiza la sección por id, hace merge, escribe.
 * Patrón equivalente a updatePostInFirestore (campo por campo, sin estado en memoria).
 */
async function updateSectionInFirestore(id: string, updates: Partial<AboutSection>): Promise<AboutSection> {
  const docRef = doc(db, 'about', 'data');
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('No se encontró el documento de About para actualizar');
  }

  const currentData = docSnap.data() as AboutData;
  const currentSections = currentData.sections || [];
  const index = currentSections.findIndex(s => s.id === id);

  if (index === -1) {
    throw new Error(`Sección con id "${id}" no encontrada`);
  }

  const merged: AboutSection = {
    ...currentSections[index],
    ...updates,
  };

  const updatedSections = [...currentSections];
  updatedSections[index] = merged;

  await updateDoc(docRef, {
    sections: updatedSections,
    updatedAt: Timestamp.now(),
  });

  return merged;
}

/**
 * Eliminar una sección por id en Firestore.
 * Lee el doc actual, filtra el array, escribe.
 */
async function deleteSectionInFirestore(id: string): Promise<void> {
  const docRef = doc(db, 'about', 'data');
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return;
  }

  const currentData = docSnap.data() as AboutData;
  const currentSections = currentData.sections || [];
  const updatedSections = currentSections.filter(s => s.id !== id);

  if (updatedSections.length === currentSections.length) {
    return;
  }

  await updateDoc(docRef, {
sections: updatedSections,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Eliminar la imagen de una sección del About.
 * Borra de ImageKit usando el imageFileId persistido, y limpia image + imageFileId en Firestore.
 */
export async function removeAboutImage(section: AboutSection): Promise<void> {
  if (!section.imageFileId && !section.image) {
    return;
  }

  if (USE_FIREBASE) {
    if (section.imageFileId) {
      try {
        await ImageKitService.deleteImage(section.imageFileId);
      } catch (err) {
        console.warn(`⚠️ No se pudo eliminar la imagen de ImageKit: ${section.imageFileId}`, err);
      }
    }

    const currentData = await getAboutDataFromFirestore();
    const sections = currentData.sections || [];
    const updatedSections = sections.map((s) =>
      s.id === section.id ? { ...s, image: '', imageFileId: '' } : s
    );

    if (updatedSections.some((s, i) => s !== sections[i])) {
      await updateAboutDataInFirestore({ ...currentData, sections: updatedSections });
    }

    aboutDataDB = { ...currentData, sections: updatedSections };
    persistAboutDB();
    clearAboutCache();
    return;
  }

  // Modo local
  aboutDataDB = {
    ...aboutDataDB,
    sections: (aboutDataDB.sections || []).map((s) =>
      s.id === section.id ? { ...s, image: '', imageFileId: '' } : s
    ),
  };
  persistAboutDB();
  clearAboutCache();
}