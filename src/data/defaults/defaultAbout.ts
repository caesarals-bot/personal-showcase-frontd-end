/**
 * Default About Data
 * Datos por defecto para la página About cuando no hay conexión
 */

import type { AboutData } from '@/types/about.types'

export const defaultAboutData: AboutData = {
    sections: [
        {
            id: 'default-1',
            title: 'Desarrollador Full Stack',
            content:
                'Desarrollador apasionado por crear experiencias web modernas y eficientes. Especializado en React, TypeScript y arquitecturas escalables. Comprometido con el código limpio y las mejores prácticas de desarrollo.',
            image: '/comic-team-web.webp',
            imageAlt: 'Desarrollo web',
            imagePosition: 'right',
        },
        {
            id: 'default-2',
            title: 'Tecnologías y Herramientas',
            content:
                'Experiencia con tecnologías modernas: React, TypeScript, Node.js, Firebase, Tailwind CSS. Siempre aprendiendo y explorando nuevas herramientas para mejorar la calidad del código y la experiencia del usuario.',
            image: '/comic-happy-web.webp',
            imageAlt: 'Tecnología',
            imagePosition: 'left',
        },
        {
            id: 'default-3',
            title: 'Innovación y Aprendizaje',
            content:
                'Motivado por el crecimiento constante y la búsqueda de soluciones creativas. Enfocado en aportar valor a cada proyecto y en construir aplicaciones que marquen la diferencia.',
            image: '/comic-future-web.webp',
            imageAlt: 'Innovación',
            imagePosition: 'right',
        },
    ],
}
