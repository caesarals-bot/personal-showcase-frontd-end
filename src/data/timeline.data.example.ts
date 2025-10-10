import type { TimelineData } from '@/types/timeline.types'

/**
 * ARCHIVO DE EJEMPLO - NO USAR EN PRODUCCIÓN
 * 
 * Copia este archivo como 'timeline.data.ts' y actualiza con tu experiencia real:
 * 1. cp timeline.data.example.ts timeline.data.ts
 * 2. Actualiza con tus trabajos, educación, certificaciones y proyectos
 * 3. El archivo timeline.data.ts está en .gitignore para proteger tu información
 */

export const timelineData: TimelineData = {
    items: [
        {
            id: '1',
            title: 'Tu Posición Actual',
            company: 'Nombre de la Empresa',
            period: '2023 - Presente',
            description: 'Descripción de tu rol actual, responsabilidades principales y logros destacados en esta posición.',
            skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
            type: 'work'
        },
        {
            id: '2',
            title: 'Tu Proyecto Personal Destacado',
            period: '2022',
            description: 'Descripción de un proyecto personal importante que hayas desarrollado, tecnologías utilizadas y resultados obtenidos.',
            skills: ['Vue.js', 'Python', 'MongoDB', 'Docker'],
            type: 'project'
        },
        {
            id: '3',
            title: 'Certificación Profesional',
            company: 'Institución Certificadora',
            period: '2022',
            description: 'Descripción de una certificación importante que hayas obtenido y cómo ha impactado en tu desarrollo profesional.',
            skills: ['Certificación', 'Skill 1', 'Skill 2', 'Skill 3'],
            type: 'certification'
        },
        {
            id: '4',
            title: 'Posición Anterior',
            company: 'Empresa Anterior',
            period: '2021 - 2022',
            description: 'Descripción de una posición anterior, proyectos en los que trabajaste y experiencia adquirida.',
            skills: ['JavaScript', 'React', 'CSS', 'Git'],
            type: 'work'
        },
        {
            id: '5',
            title: 'Formación Académica',
            company: 'Universidad/Instituto',
            period: '2019 - 2021',
            description: 'Tu formación académica principal, especialización y proyectos destacados durante tus estudios.',
            skills: ['Fundamentos', 'Algoritmos', 'Bases de Datos', 'Programación'],
            type: 'education'
        }
    ]
}
