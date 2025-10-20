import type { TimelineData } from '@/types/timeline.types'
import { TimelineService } from '@/services'
import { useAsyncData } from './useAsyncData'

export function useTimelineData() {
    return useAsyncData<TimelineData>(() => TimelineService.getTimelineData())
}