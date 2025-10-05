import { motion } from 'framer-motion'
import { useContactData } from '@/hooks/useContactData'
import SocialIcon from './SocialIcon'

interface ContactInfoProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    showEmail?: boolean
    showSocials?: boolean
    variant?: 'floating' | 'inline'
}

export default function ContactInfo({
    position = 'top-left',
    showEmail = false,
    showSocials = true,
    variant = 'floating'
}: ContactInfoProps) {
    const { data, loading, error } = useContactData()

    // Ocultar en la página de contacto
    if (typeof window !== 'undefined' && window.location.pathname === '/contactame') {
        return null
    }

    if (loading || error || !data) return null

    const { contactInfo } = data
    const visibleSocials = contactInfo.socialLinks.filter(link => link.isVisible)

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
            className={`${containerClass} block`}
            title="Go to Contact page"
        >
            <div className="flex flex-col items-center gap-1 rounded-xl border border-border/40 bg-background/80 p-3 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                {/* Redes sociales */}
                {showSocials && visibleSocials.length > 0 && (
                    <div className="flex gap-1">
                        {visibleSocials.map((social) => (
                            <div
                                key={social.id}
                                className="flex items-center justify-center rounded-lg p-2"
                                style={{ color: social.color }}
                            >
                                <SocialIcon
                                    icon={social.icon}
                                    size={18}
                                    color={social.color || 'currentColor'}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Texto "Contact me" */}
                <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="oswald oswald-500 text-xs text-foreground/70 hidden sm:inline"
                >
                    Contact me
                </motion.span>
            </div>
        </motion.a>
    )
}