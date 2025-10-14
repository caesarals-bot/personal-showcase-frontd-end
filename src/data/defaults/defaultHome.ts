/**
 * Default Home Data
 * Datos por defecto para HomePage cuando no hay conexión
 */

export interface HomeData {
    title: string
    subtitle: string
    description: string
    roles: string[]
}

export const defaultHomeData: HomeData = {
    title: 'Portfolio Personal',
    subtitle: 'Desarrollador Web',
    description: 'Creando experiencias digitales memorables que fusionan diseño y tecnología para resolver problemas complejos.',
    roles: [
        'Desarrollador web',
        'Ingeniero informático'
    ]
}
