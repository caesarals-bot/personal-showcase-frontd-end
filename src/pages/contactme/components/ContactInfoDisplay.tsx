import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

import { useContactData } from '@/hooks/useContactData'
import type { ContactInfoDisplayProps } from '@/types/contact-form.types'
import SocialIcon from '@/shared/components/SocialIcon'

export default function ContactInfoDisplay({
    showTitle = true,
    className
}: ContactInfoDisplayProps) {
    const { data: contactData,loading, error } = useContactData()

    if (loading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="h-6 w-32 animate-pulse rounded bg-foreground/10" />
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-5 w-5 animate-pulse rounded bg-foreground/10" />
                            <div className="h-4 w-40 animate-pulse rounded bg-foreground/10" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error || !contactData) {
        return (
            <div className={`text-center text-foreground/60 ${className}`}>
                <p>Error al cargar información de contacto</p>
            </div>
        )
    }

    const { contactInfo } = contactData

    const contactItems = [
        {
            icon: Mail,
            label: 'Email',
            value: contactInfo.email,
            href: `mailto:${contactInfo.email}`,
            color: 'text-blue-600 dark:text-blue-400',
        },
        {
            icon: Phone,
            label: 'Teléfono',
            value: contactInfo.phone,
            href: `tel:${contactInfo.phone}`,
            color: 'text-green-600 dark:text-green-400',
        },
        {
            icon: MapPin,
            label: 'Ubicación',
            value: contactInfo.location,
            color: 'text-red-600 dark:text-red-400',
        },
    ]

    const visibleSocialLinks = contactInfo.socialLinks.filter(link => link.isVisible)

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={className}
        >
            {showTitle && (
                <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-6 text-xl font-bold tracking-tight md:text-2xl"
                >
                    Información de Contacto
                </motion.h3>
            )}

            <div className="space-y-6">
                {/* Información básica de contacto */}
                <div className="space-y-4">
                    {contactItems.map((item, index) => {
                        const Icon = item.icon
                        const content = (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                className="flex items-center gap-3 group"
                            >
                                <div className={`rounded-lg p-2 bg-foreground/5 ${item.color} transition-colors group-hover:bg-foreground/10`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                                        {item.label}
                                    </p>
                                    <p className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                                        {item.value}
                                    </p>
                                </div>
                                {item.href && (
                                    <ExternalLink className="h-3 w-3 text-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </motion.div>
                        )

                        return item.href ? (
                            <motion.a
                                key={item.label}
                                href={item.href}
                                className="block rounded-lg p-2 -m-2 transition-colors hover:bg-foreground/5"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {content}
                            </motion.a>
                        ) : (
                            <div key={item.label} className="rounded-lg p-2 -m-2">
                                {content}
                            </div>
                        )
                    })}
                </div>

                {/* Redes sociales */}
                {visibleSocialLinks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="space-y-3"
                    >
                        <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                            Sígueme en
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {visibleSocialLinks.map((link, index) => (
                                <motion.a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 rounded-lg border border-border/20 bg-background/60 px-3 py-2 text-sm font-medium transition-all hover:border-border/40 hover:bg-background/80 hover:shadow-sm"
                                    style={{
                                        '--hover-color': link.color,
                                    } as React.CSSProperties}
                                >
                                    <SocialIcon
                                        icon={link.icon as any}
                                        className="h-4 w-4"
                                        color={link.color}
                                    />
                                    <span className="text-foreground/80 hover:text-foreground transition-colors">
                                        {link.name}
                                    </span>
                                    <ExternalLink className="h-3 w-3 text-foreground/40" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Mensaje adicional */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="rounded-lg border border-border/20 bg-background/40 p-4 backdrop-blur-sm"
                >
                    <p className="text-sm text-foreground/70 leading-relaxed">
                        <span className="font-medium text-foreground">¿Tienes una idea?</span>{' '}
                        Me encanta colaborar en proyectos interesantes. No dudes en contactarme
                        para discutir oportunidades de trabajo, colaboraciones o simplemente
                        para charlar sobre tecnología.
                    </p>
                </motion.div>
            </div>
        </motion.div>
    )
}
