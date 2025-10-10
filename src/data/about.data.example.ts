import type { AboutData } from '@/types/about.types'

/**
 * ARCHIVO DE EJEMPLO - NO USAR EN PRODUCCIÓN
 * 
 * Copia este archivo como 'about.data.ts' y personaliza con tu información:
 * 1. cp about.data.example.ts about.data.ts
 * 2. Actualiza títulos, contenido e imágenes
 * 3. El archivo about.data.ts está en .gitignore para proteger tu información
 */

export const aboutData: AboutData = {
    sections: [
        {
            id: '1',
            title: 'Tu Primera Sección',
            content:
                'Aquí puedes escribir sobre tu filosofía de trabajo, valores profesionales o lo que consideres importante destacar sobre tu forma de trabajar y pensar.',
            image: '/imagen-ejemplo-1.webp',
            imageAlt: 'Descripción de tu imagen',
            imagePosition: 'right',
        },
        {
            id: '2',
            title: 'Tu Segunda Sección',
            content:
                'Esta sección puede hablar sobre tu pasión por la tecnología, tu background educativo, las tecnologías que dominas o tu trayectoria profesional.',
            image: '/imagen-ejemplo-2.webp',
            imageAlt: 'Descripción de tu segunda imagen',
            imagePosition: 'left',
        },
        {
            id: '3',
            title: 'Tu Tercera Sección',
            content:
                'Aquí puedes mencionar tus objetivos futuros, proyectos en los que te gustaría trabajar, o hacer un llamado a la acción para potenciales colaboradores o empleadores.',
            image: '/imagen-ejemplo-3.webp',
            imageAlt: 'Descripción de tu tercera imagen',
            imagePosition: 'right',
        },
    ],
}
