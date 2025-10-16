import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { TimelineItem, TimelineData } from '@/types/timeline.types';

// Flag para usar Firebase o datos locales
const USE_FIREBASE = true;

/**
 * Obtener todos los items de la timeline desde Firestore
 */
export async function getTimelineItems(): Promise<TimelineItem[]> {
  if (!USE_FIREBASE) {
    return getTimelineItemsLocal();
  }

  try {
    const timelineRef = collection(db, 'timeline');
    const q = query(timelineRef, orderBy('period', 'desc'));
    const snapshot = await getDocs(q);
    
    const items: TimelineItem[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        company: data.company,
        period: data.period,
        description: data.description,
        skills: data.skills || [],
        type: data.type,
        icon: data.icon,
        color: data.color
      };
    });
    
    return items;
  } catch (error) {
    return [];
  }
}

/**
 * Obtener un item específico de la timeline
 */
export async function getTimelineItem(id: string): Promise<TimelineItem | null> {
  try {
    const docRef = doc(db, 'timeline', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      company: data.company,
      period: data.period,
      description: data.description,
      skills: data.skills || [],
      type: data.type,
      icon: data.icon,
      color: data.color
    };
  } catch (error) {
    return null;
  }
}

/**
 * Crear un nuevo item en la timeline
 */
export async function createTimelineItem(data: Omit<TimelineItem, 'id'>): Promise<string> {
  try {
    const timelineRef = collection(db, 'timeline');
    const docRef = await addDoc(timelineRef, {
      title: data.title,
      company: data.company || '',
      period: data.period,
      description: data.description,
      skills: data.skills || [],
      type: data.type,
      icon: data.icon || '',
      color: data.color || '#3b82f6',
      createdAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

/**
 * Actualizar un item de la timeline
 */
export async function updateTimelineItem(
  id: string, 
  data: Partial<Omit<TimelineItem, 'id'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'timeline', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Eliminar un item de la timeline
 */
export async function deleteTimelineItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'timeline', id);
    await deleteDoc(docRef);
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener timeline data (para compatibilidad con código existente)
 */
export async function getTimelineData(): Promise<TimelineData> {
  const items = await getTimelineItems();
  return { items };
}

/**
 * Versión local (fallback si Firebase no está disponible)
 */
function getTimelineItemsLocal(): TimelineItem[] {
  // Datos de ejemplo para desarrollo
  return [
    {
      id: '1',
      title: 'Ejemplo de Trabajo',
      company: 'Empresa Ejemplo',
      period: '2023 - Presente',
      description: 'Descripción de ejemplo',
      skills: ['React', 'TypeScript'],
      type: 'work'
    }
  ];
}

// Clase para compatibilidad con código existente
export class TimelineService {
  static async getTimelineData(): Promise<TimelineData> {
    return getTimelineData();
  }

  static async updateTimelineData(_data: Partial<TimelineData>): Promise<TimelineData> {
    // Esta función ya no se usa con Firebase
    // Los items se actualizan individualmente
    return { items: [] };
  }

  static resetTimelineData(): void {
    // No aplicable con Firebase
  }
}