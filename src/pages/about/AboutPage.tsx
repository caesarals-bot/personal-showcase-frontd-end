import { motion } from 'framer-motion'
import AboutSection from './components/AboutSection'
import Timeline from './components/Timeline'
import { useAboutData } from '@/hooks/useAboutData'
import { useTimelineData } from '@/hooks/useTimelineData'


export default function AboutPage() {
    const { data: aboutData, loading: aboutLoading, error: aboutError } = useAboutData()
    const { data: timelineData, loading: timelineLoading, error: timelineError } = useTimelineData()

    if (aboutLoading || timelineLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground mx-auto mb-4" />
                    <p>Cargando...</p>
                </div>
            </div>
        )
    }

    if (aboutError || timelineError) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center text-red-500">
                    <p>Error al cargar los datos</p>
                    <p className="text-sm">{aboutError?.message || timelineError?.message}</p>
                </div>
            </div>
        )
    }

    if (!aboutData || !timelineData) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>No hay datos disponibles</p>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen">
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-10 text-center sm:mb-12 md:mb-16"
                >
                    <h1 className="mb-3 text-3xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
                        Sobre mí
                    </h1>
                    <p className="mx-auto max-w-2xl text-base text-foreground/70 sm:text-lg md:text-xl">
                        Desarrollador apasionado por crear experiencias digitales que marquen la diferencia
                    </p>
                </motion.div>

                {/* Layout de dos columnas en desktop */}
                {/* Layout de dos columnas en desktop */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Columna izquierda: Secciones About */}
                    <div className="rounded-2xl border border-border/30 bg-background/40 p-6 backdrop-blur-sm shadow-sm lg:p-8">
                        <div className="space-y-6 sm:space-y-8 md:space-y-10">
                            {aboutData.sections.map((section, index) => (
                                <AboutSection key={section.id} section={section} index={index} />
                            ))}
                        </div>
                    </div>

                    {/* Columna derecha: Timeline */}
                    <div className="rounded-2xl border border-border/30 bg-background/40 p-6 backdrop-blur-sm shadow-sm lg:sticky lg:top-20 lg:self-start lg:p-8">
                        <Timeline data={timelineData} />
                    </div>
                </div>
            </div>
        </div>
    )
}