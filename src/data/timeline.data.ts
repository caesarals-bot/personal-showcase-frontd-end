import type { TimelineData } from '@/types/timeline.types'

export const timelineData: TimelineData = {
    items: [
        {
            id: '7',
            title: 'Ingenieria Informatica',
            company: 'Iacc Chile',
            period: '2025 en formacion',
            description: 'Estoy avanzando en Ingeniería en Informática mediante Continuidad de Estudios (RAP) en IACC, reconociendo aprendizajes previos y consolidando mi desarrollo profesional para obtener el título.',
            skills: ['Java y mucho otros en formacion'],
            type: 'education'
        },
        {
            id: '6',
            title: 'DESARROLLO RUBY ON RAILS PARA EMPRENDIMIENTOS DE TIPO START-UP',
            company: 'Talento Digital para Chile',
            period: '2023',
            description: 'Curso de desarrollo Ruby on Rails para startups, capacita para crear MVPs funcionales con enfoque ágil, manejando todo el ciclo de vida del producto, bases de datos y presentación a inversores.',
            skills: ['Ruby on Rails','html', 'css', 'postgresql', 'git', 'github', 'agile', 'scrum', 'kanban', 'testing', 'deployment', 'docker'],
            type: 'certification'
        },
        {
            id: '1',
            title: 'Desarrollador Aplicaciones Frontend Trainee',
            company: 'Sence AWAKELAB',
            period: '2022',
            description: 'Trainee en desarrollo frontend (430 horas) en Awakelab, Chile. Formación práctica en Vue.js y SQL, enfocada en creación, gestión y optimización de aplicaciones web modernas e interactivas.',
            skills: ['Vue.js','TypeScript', 'PostgreSQL', 'Jira', 'git', 'github', 'agile', 'testing', 'deployment'],
            type: 'certification'
        },
        {
            id: '2',
            title: 'Aceleración de Alkemy',
            period: '2021',
            description: 'Participé en la nivelación Alkemy, donde creé un proyecto React aplicando metodologías ágiles, demostrando dominio técnico, capacidad de trabajo colaborativo y solución creativa en entornos de desarrollo profesional.',
            skills: ['React', 'Redux', 'React router', 'lazy loading', 'hooks', 'testing'],
            type: 'certification'
        },
        {
            id: '3',
            title: 'Procesos de analisis de datos',
            company: 'Sence Chile (Servicio Nacional de Capacitación y Empleo)',
            period: '2021',
            description: 'Curso SENCE de análisis de datos enfocado en recolección, procesamiento, interpretación y visualización de información, usando herramientas digitales y estadísticas, para apoyar la toma de decisiones en contextos laborales y productivos.',
            skills: ['SQL', 'ETL', 'Visual Studio', 'Modelado de datos'],
            type: 'certification'
        },
        {
            id: '4',
            title: 'Bases De Datos Generalidades Y Sistemas De Gestion',
            company: 'SENA Colombia',
            period: '2020',
            description: 'Curso corto del SENA sobre bases de datos, generalidades y sistemas de gestión. Aprendí modelado, consulta, administración de datos con SQL y fundamentos clave de los principales DBMS actuales.',
            skills: ['SQL', 'DBMS', 'Modelado', 'Consulta', 'Administración de datos'],
            type: 'certification'
        },
        {
            id: '5',
            title: 'Técnico Superior en Informática',
            company: 'IACC',
            period: '2017 - 2020',
            description: 'Técnico de Nivel Superior en Informática (IACC), especializado en desarrollo y soporte de sistemas, bases de datos y aplicaciones. Capacitado para resolver problemas complejos, gestionar equipos y aplicar buenas prácticas, calidad y seguridad en entornos dinámicos. Destaca por su autonomía, trabajo colaborativo, pensamiento crítico y adaptación a la transformación digital.',
            skills: ['Java', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'SQL'],
            type: 'education'
        }
    ]
}