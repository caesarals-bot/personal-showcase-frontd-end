import type { AboutData } from '@/types/about.types'

export const aboutData: AboutData = {
    sections: [
        {
            id: '1',
            title: 'Trabajo en equipo',
            content:
                'Creo que el código limpio es más que técnica: es respeto por quienes lo heredan y garantía de que cada proyecto funcione con la precisión de un reloj. Trabajo en equipo porque sé que las mejores ideas nacen en la diversidad, y busco la estabilidad sin dejar de innovar, porque el aprendizaje nunca termina.',
            image: '/comic-team-web.webp',
            imageAlt: 'Trabajo en equipo',
            imagePosition: 'right',
        },
        {
            id: '2',
            title: 'Pasión por la tecnología',
            content:
                'Curioso, inquieto y apasionado por la tecnología desde pequeño, transformé el juego en vocación. Soy Técnico Nivel Superior en Informática y futuro Ingeniero, navegando entre el front-end y el back-end con las herramientas que hoy construyen el mundo: HTML, CSS, JavaScript, React, Vue, Node.js y Ruby on Rails. Últimamente me aventuré con Kotlin y exploro las profundidades de Java POO.',
            image: '/comic-happy-web.webp',
            imageAlt: 'Pasión por la tecnología',
            imagePosition: 'left',
        },
        {
            id: '3',
            title: 'Innovación constante',
            content:
                'Si hay algo que me define, es la motivación por crecer, aportar valor y encontrar soluciones creativas que marquen la diferencia en el desarrollo de aplicaciones web. ¿Vamos por ese próximo desafío juntos?',
            image: '/comic-future-web.webp',
            imageAlt: 'Innovación y futuro',
            imagePosition: 'right',
        },
    ],
}