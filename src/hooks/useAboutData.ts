import type { AboutData } from '@/types/about.types'
import { AboutService } from '@/services'
import { useAsyncData } from './useAsyncData'

export function useAboutData() {
    return useAsyncData<AboutData>(() => AboutService.getAboutData())
}