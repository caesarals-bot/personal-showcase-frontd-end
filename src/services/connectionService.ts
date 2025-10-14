/**
 * Connection Service
 * Servicio para detectar el estado de conexión a internet y Firestore
 */

type ConnectionStatus = 'online' | 'offline' | 'degraded'

interface ConnectionState {
    isOnline: boolean
    isFirestoreAvailable: boolean
    status: ConnectionStatus
    lastChecked: Date
}

class ConnectionService {
    private listeners: Set<(state: ConnectionState) => void> = new Set()
    private currentState: ConnectionState = {
        isOnline: navigator.onLine,
        isFirestoreAvailable: false,
        status: navigator.onLine ? 'online' : 'offline',
        lastChecked: new Date()
    }

    constructor() {
        this.initialize()
    }

    /**
     * Inicializar listeners de conexión
     */
    private initialize() {
        // Listener para cambios de conexión
        window.addEventListener('online', () => this.handleConnectionChange(true))
        window.addEventListener('offline', () => this.handleConnectionChange(false))

        // Check inicial
        this.checkConnection()
    }

    /**
     * Manejar cambios de conexión
     */
    private handleConnectionChange(isOnline: boolean) {
        this.currentState = {
            ...this.currentState,
            isOnline,
            status: isOnline ? 'online' : 'offline',
            lastChecked: new Date()
        }

        // Si volvemos online, verificar Firestore
        if (isOnline) {
            this.checkFirestoreAvailability()
        }

        this.notifyListeners()
    }

    /**
     * Verificar disponibilidad de Firestore
     */
    private async checkFirestoreAvailability(): Promise<boolean> {
        try {
            // Intentar hacer un ping simple a Firebase
            // Por ahora retornamos false ya que no está completamente configurado
            const hasFirebaseConfig = !!(
                import.meta.env.VITE_FIREBASE_API_KEY &&
                import.meta.env.VITE_FIREBASE_PROJECT_ID
            )

            this.currentState.isFirestoreAvailable = hasFirebaseConfig
            return hasFirebaseConfig
        } catch (error) {
            this.currentState.isFirestoreAvailable = false
            return false
        }
    }

    /**
     * Verificar estado de conexión completo
     */
    async checkConnection(): Promise<ConnectionState> {
        const isOnline = navigator.onLine

        if (isOnline) {
            await this.checkFirestoreAvailability()
        }

        // Determinar status
        let status: ConnectionStatus = 'offline'
        if (isOnline && this.currentState.isFirestoreAvailable) {
            status = 'online'
        } else if (isOnline && !this.currentState.isFirestoreAvailable) {
            status = 'degraded' // Online pero sin Firestore
        }

        this.currentState = {
            isOnline,
            isFirestoreAvailable: this.currentState.isFirestoreAvailable,
            status,
            lastChecked: new Date()
        }

        this.notifyListeners()
        return this.currentState
    }

    /**
     * Obtener estado actual de conexión
     */
    getConnectionStatus(): ConnectionState {
        return { ...this.currentState }
    }

    /**
     * Verificar si está online
     */
    isOnline(): boolean {
        return this.currentState.isOnline
    }

    /**
     * Verificar si Firestore está disponible
     */
    isFirestoreAvailable(): boolean {
        return this.currentState.isFirestoreAvailable
    }

    /**
     * Suscribirse a cambios de conexión
     */
    onConnectionChange(callback: (state: ConnectionState) => void): () => void {
        this.listeners.add(callback)

        // Retornar función para desuscribirse
        return () => {
            this.listeners.delete(callback)
        }
    }

    /**
     * Notificar a todos los listeners
     */
    private notifyListeners() {
        this.listeners.forEach(listener => {
            listener(this.currentState)
        })
    }

    /**
     * Limpiar listeners
     */
    destroy() {
        window.removeEventListener('online', () => this.handleConnectionChange(true))
        window.removeEventListener('offline', () => this.handleConnectionChange(false))
        this.listeners.clear()
    }
}

// Exportar instancia singleton
export const connectionService = new ConnectionService()

// Exportar tipos
export type { ConnectionStatus, ConnectionState }
