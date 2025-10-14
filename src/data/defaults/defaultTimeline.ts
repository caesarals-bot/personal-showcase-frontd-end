/**
 * Default Timeline Data
 * Datos por defecto para Timeline cuando no hay conexión
 */

import type { TimelineData } from '@/types/timeline.types'

export const defaultTimelineData: TimelineData = {
    items: [
        {
            id: 'default-1',
            title: 'Desarrollador Full Stack',
            company: 'Experiencia Profesional',
            period: '2020 - Presente',
            description: 'Desarrollo de aplicaciones web modernas con React, TypeScript y Node.js. Enfoque en arquitecturas escalables y mejores prácticas.',
            skills: ['React', 'TypeScript', 'Node.js', 'Firebase'],
            type: 'work'
        },
        {
            id: 'default-2',
            title: 'Formación en Desarrollo Web',
            company: 'Educación Continua',
            period: '2019 - 2023',
            description: 'Formación técnica en desarrollo web frontend y backend, con especialización en tecnologías modernas.',
            skills: ['JavaScript', 'HTML', 'CSS', 'Git'],
            type: 'education'
        },
        {
            id: 'default-3',
            title: 'Certificaciones Técnicas',
            period: '2020 - 2023',
            description: 'Certificaciones en desarrollo web, metodologías ágiles y mejores prácticas de programación.',
            skills: ['Agile', 'Scrum', 'Testing', 'CI/CD'],
            type: 'certification'
        }
    ]
}
