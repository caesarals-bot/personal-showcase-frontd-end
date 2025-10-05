import { motion } from 'framer-motion'
import TimelineItem from './TimeLineItem'
import type { TimelineData } from '@/types/timeline.types'

interface TimelineProps {
    data: TimelineData
}

export default function Timeline({ data }: TimelineProps) {
    return (
        <div className="relative">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-6 text-center lg:text-left"
            >
                <h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                    Mi Trayectoria Profesional
                </h2>
                <p className="text-sm text-foreground/70 lg:text-base">
                    Un viaje a través de mis experiencias y logros
                </p>
            </motion.div>

            {/* Timeline Items */}
            <div className="space-y-4 md:space-y-6">
                {data.items.map((item, index) => (
                    <TimelineItem
                        key={item.id}
                        item={item}
                        index={index}
                        isLast={index === data.items.length - 1}
                    />
                ))}
            </div>
        </div>
    )
}