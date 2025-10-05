import { motion } from 'framer-motion'
import type { TimelineItem as TimelineItemType } from '@/types/timeline.types'

interface TimelineItemProps {
    item: TimelineItemType
    index: number
    isLast: boolean
}

const typeColors = {
    work: 'bg-blue-500',
    education: 'bg-green-500',
    certification: 'bg-purple-500',
    project: 'bg-orange-500'
}

const typeIcons = {
    work: '💼',
    education: '🎓',
    certification: '📜',
    project: '🚀'
}

export default function TimelineItem({ item, index, isLast }: TimelineItemProps) {
    const isEven = index % 2 === 0

    return (
        <div className={`flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'} gap-4 md:gap-8`}>
            {/* Tarjeta */}
            <motion.div
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex-1 max-w-md"
            >
                <div className="rounded-xl border border-border/20 bg-background/60 p-4 shadow-sm backdrop-blur-sm hover:shadow-md hover:bg-background/80 transition-all duration-300 lg:p-5">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${typeColors[item.type]} text-white text-lg`}>
                                {typeIcons[item.type]}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
                                {item.company && (
                                    <p className="text-sm text-foreground/70">{item.company}</p>
                                )}
                            </div>
                        </div>
                        <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium">
                            {item.period}
                        </span>
                    </div>

                    {/* Descripción */}
                    <p className="mb-4 text-sm leading-relaxed text-foreground/80">
                        {item.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                        {item.skills.map((skill) => (
                            <span
                                key={skill}
                                className="rounded-lg bg-foreground/5 px-2 py-1 text-xs font-medium text-foreground/70"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Línea central con punto */}
            <div className="flex flex-col items-center">
                {/* Punto */}
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
                    className={`h-4 w-4 rounded-full ${typeColors[item.type]} ring-4 ring-background shadow-lg z-10`}
                />

                {/* Línea vertical */}
                {!isLast && (
                    <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                        className="w-0.5 bg-border/40 flex-1 min-h-16"
                    />
                )}
            </div>

            {/* Espaciador para mantener simetría */}
            <div className="flex-1 max-w-md" />
        </div>
    )
}