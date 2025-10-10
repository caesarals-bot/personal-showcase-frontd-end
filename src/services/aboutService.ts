import type { AboutData } from '@/types/about.types'
import { aboutData } from '@/data/about.data'

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

    console.log('[AboutService] Datos actualizados:', aboutDataDB);
    return { ...aboutDataDB };
  }

  // Resetear a valores iniciales
  static resetAboutData(): void {
    aboutDataDB = { ...aboutData };
    console.log('[AboutService] Datos reseteados');
  }
}