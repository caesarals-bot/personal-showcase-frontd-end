import type { TimelineData } from '@/types/timeline.types'
import { timelineData } from '@/data/timeline.data'

export class TimelineService {
    static async getTimelineData(): Promise<TimelineData> {
        await new Promise(resolve => setTimeout(resolve, 300))
        return timelineData
    }

    // TODO: Métodos Firebase
    // static async getTimelineDataFromFirebase(): Promise<TimelineData> { ... }
    // static async updateTimelineData(data: TimelineData): Promise<void> { ... }
}