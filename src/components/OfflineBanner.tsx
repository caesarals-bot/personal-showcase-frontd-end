/**
 * OfflineBanner Component
 * Banner que muestra el estado de conexión y fuente de datos
 */

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, Cloud, Database, RefreshCw, X } from 'lucide-react'
import { useState } from 'react'
import type { ConnectionState } from '@/services/connectionService'
import type { DataSource } from '@/hooks/useOfflineData'

interface OfflineBannerProps {
    connectionState: ConnectionState
    dataSource: DataSource
    onRetry?: () => void
    showDetails?: boolean
}

export default function OfflineBanner({
    connectionState,
    dataSource,
    onRetry,
    showDetails = false
}: OfflineBannerProps) {
    const [isDismissed, setIsDismissed] = useState(false)
    const [showFullDetails, setShowFullDetails] = useState(showDetails)

    // No mostrar si está online y los datos vienen de red o caché
    // El caché es transparente cuando hay conexión
    if (connectionState.isOnline && (dataSource === 'network' || dataSource === 'cache')) {
        return null
    }

    // No mostrar si fue dismisseado
    if (isDismissed) {
        return null
    }

    const getStatusConfig = () => {
        if (!connectionState.isOnline) {
            return {
                icon: WifiOff,
                title: 'Sin conexión',
                message: 'Mostrando contenido guardado',
                color: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
                iconColor: 'text-red-500'
            }
        }

        if (connectionState.status === 'degraded') {
            return {
                icon: Cloud,
                title: 'Conexión limitada',
                message: 'Algunos servicios no están disponibles',
                color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
                iconColor: 'text-yellow-500'
            }
        }

        if (dataSource === 'cache') {
            return {
                icon: Database,
                title: 'Contenido en caché',
                message: 'Mostrando versión guardada',
                color: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
                iconColor: 'text-blue-500'
            }
        }

        if (dataSource === 'default') {
            return {
                icon: Database,
                title: 'Contenido por defecto',
                message: 'Mostrando información básica',
                color: 'bg-gray-500/10 border-gray-500/30 text-gray-600 dark:text-gray-400',
                iconColor: 'text-gray-500'
            }
        }

        return {
            icon: Wifi,
            title: 'Conectado',
            message: 'Todo funcionando correctamente',
            color: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
            iconColor: 'text-green-500'
        }
    }

    const config = getStatusConfig()
    const Icon = config.icon

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
            >
                <div className={`rounded-lg border-2 ${config.color} backdrop-blur-md shadow-lg p-4`}>
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 ${config.iconColor}`}>
                            <Icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="font-semibold text-sm">
                                    {config.title}
                                </h3>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    {onRetry && !connectionState.isOnline && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={onRetry}
                                            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                            title="Reintentar"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </motion.button>
                                    )}
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsDismissed(true)}
                                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        title="Cerrar"
                                    >
                                        <X className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>

                            <p className="text-xs mt-1 opacity-90">
                                {config.message}
                            </p>

                            {/* Details (expandible) */}
                            {showFullDetails && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 pt-3 border-t border-current/20 text-xs space-y-1"
                                >
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Estado:</span>
                                        <span className="font-medium">{connectionState.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Fuente:</span>
                                        <span className="font-medium">{dataSource}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-75">Firestore:</span>
                                        <span className="font-medium">
                                            {connectionState.isFirestoreAvailable ? 'Disponible' : 'No disponible'}
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Toggle details */}
                            {!showDetails && (
                                <button
                                    onClick={() => setShowFullDetails(!showFullDetails)}
                                    className="text-xs mt-2 opacity-75 hover:opacity-100 transition-opacity underline"
                                >
                                    {showFullDetails ? 'Ocultar detalles' : 'Ver detalles'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
