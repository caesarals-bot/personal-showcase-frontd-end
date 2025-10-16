import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useContactData } from '@/hooks/useContactData'
import SocialIcon from './SocialIcon'

interface ContactInfoProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    showSocials?: boolean
    variant?: 'floating' | 'inline'
}

export default function ContactInfo({
    position = 'top-left',
    showSocials = true,
    variant = 'floating'
}: ContactInfoProps) {
    const { data, loading } = useContactData()

    // Ocultar en la página de contacto
    if (typeof window !== 'undefined' && window.location.pathname === '/contactame') {
        return null
    }

    // No mostrar mientras carga
    if (loading) return null

    // Si hay datos, usar las redes sociales de Firebase
    const visibleSocials = data?.contactInfo?.socialLinks?.filter(link => link.isVisible) || []

    const positionClasses = {
        'top-left': 'top-19 sm:top-20 left-4 sm:left-6 lg:left-8',
        'top-right': 'top-19 sm:top-20 right-4 sm:right-6 lg:right-8',
        'bottom-left': 'bottom-4 left-4 sm:left-6 lg:left-8',
        'bottom-right': 'bottom-4 right-4 sm:right-6 lg:right-8'
    }

    const containerClass = variant === 'floating'
        ? `fixed ${positionClasses[position]} z-40`
        : 'relative'

    return (
        <motion.a
            href="/contactame"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${containerClass} block group`}
            title="Go to Contact page"
        >
            <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-border dark:border-primary/30 bg-transparent dark:bg-transparent p-3 backdrop-blur-md shadow-lg hover:shadow-2xl dark:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-300 cursor-pointer ring-0 hover:ring-2 hover:ring-primary/20 dark:hover:ring-primary/40">
                {/* Redes sociales o ícono de email */}
                {showSocials && visibleSocials.length > 0 ? (
                    <div className="flex gap-1">
                        {visibleSocials.map((social) => (
                            <motion.div
                                key={social.id}
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center rounded-lg p-2 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors duration-200"
                                style={{ color: social.color }}
                            >
                                <SocialIcon
                                    icon={social.icon}
                                    size={18}
                                    color={social.color || 'currentColor'}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center rounded-lg p-2 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors duration-200"
                    >
                        <Mail className="h-5 w-5 text-primary" />
                    </motion.div>
                )}

                {/* Texto "Contact me" */}
                <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="oswald oswald-500 text-xs text-foreground/90 dark:text-foreground/95 inline group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200"
                >
                    Contact me
                </motion.span>
            </div>
        </motion.a>
    )
}