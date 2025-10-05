import { motion } from 'framer-motion'
import type { AboutSection as AboutSectionType } from '@/types/about.types'

interface AboutSectionProps {
    section: AboutSectionType
    index: number
}

export default function AboutSection({ section, index }: AboutSectionProps) {
    const isImageLeft = section.imagePosition === 'left'

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className={`flex flex-col gap-4 rounded-xl border border-border/40 bg-background/50 p-4 backdrop-blur-sm sm:gap-6 sm:rounded-2xl sm:p-6 md:flex-row md:gap-6 ${
                isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
        >
            {/* Imagen más compacta */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                className="flex-shrink-0"
            >
                <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40 md:h-36 md:w-36">
                    <img
                        src={section.image}
                        alt={section.imageAlt}
                        className="h-full w-full rounded-lg object-cover shadow-md transition-transform duration-300 hover:scale-105 sm:rounded-xl"
                    />
                </div>
            </motion.div>

            {/* Texto optimizado */}
            <div className="flex flex-1 flex-col justify-center space-y-2 sm:space-y-3">
                <motion.h3
                    initial={{ opacity: 0, x: isImageLeft ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    className="text-lg font-bold tracking-tight sm:text-xl md:text-2xl"
                >
                    {section.title}
                </motion.h3>
                <motion.p
                    initial={{ opacity: 0, x: isImageLeft ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
                    className="text-sm leading-relaxed text-foreground/80 sm:text-base"
                >
                    {section.content}
                </motion.p>
            </div>
        </motion.div>
    )
}