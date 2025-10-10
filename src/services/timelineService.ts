import type { TimelineData } from '@/types/timeline.types'
import { timelineData } from '@/data/timeline.data'

// Base de datos en memoria
let timelineDB: TimelineData = { ...timelineData, items: [...timelineData.items] };

// Simulación de delay de red
const delay = () => new Promise(resolve => setTimeout(resolve, 300));

export class TimelineService {
    static async getTimelineData(): Promise<TimelineData> {
        await delay();
        return { ...timelineDB, items: [...timelineDB.items] };
    }

    // Actualizar datos de la timeline
    static async updateTimelineData(data: Partial<TimelineData>): Promise<TimelineData> {
        await delay();
        
        timelineDB = {
            ...timelineDB,
            ...data,
        };

        console.log('[TimelineService] Datos actualizados:', timelineDB);
        return { ...timelineDB, items: [...timelineDB.items] };
    }

    // Resetear a valores iniciales
    static resetTimelineData(): void {
        timelineDB = { ...timelineData, items: [...timelineData.items] };
        console.log('[TimelineService] Datos reseteados');
    }
}