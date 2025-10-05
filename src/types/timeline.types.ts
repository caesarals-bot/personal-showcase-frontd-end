export interface TimelineItem {
    id: string
    title: string
    company?: string
    period: string
    description: string
    skills: string[]
    type: 'work' | 'education' | 'certification' | 'project'
    icon?: string
    color?: string
}

export interface TimelineData {
    items: TimelineItem[]
}