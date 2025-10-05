import type { AboutData } from '@/types/about.types'
import { aboutData } from '@/data/about.data'

// Simulación de API/Firebase
export class AboutService {
  // Método actual (datos locales)
  static async getAboutData(): Promise<AboutData> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300))
    return aboutData
  }

  // TODO: Método futuro para Firebase
  // static async getAboutDataFromFirebase(): Promise<AboutData> {
  //   const docRef = doc(db, 'about', 'main')
  //   const docSnap = await getDoc(docRef)
  //   if (docSnap.exists()) {
  //     return docSnap.data() as AboutData
  //   }
  //   throw new Error('No se encontraron datos')
  // }

  // TODO: Método para actualizar datos (panel admin)
  // static async updateAboutData(data: AboutData): Promise<void> {
  //   const docRef = doc(db, 'about', 'main')
  //   await setDoc(docRef, data)
  // }
}