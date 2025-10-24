import { createContext, useContext, type ReactNode } from 'react'
import { useAuth as useAuthLogic } from '@/hooks/useAuth'
import type { User } from '@/types/blog.types'
import InactiveUserNotification from '@/components/InactiveUserNotification'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    register: (userData: { email: string, name: string, password: string }) => Promise<void>
    resendVerificationEmail: () => Promise<void>
    checkEmailVerified: () => boolean
    reloadUser: () => Promise<void>
    clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuthLogic()

    // Verificar si el error es de cuenta desactivada
    const isInactiveUserError = auth.error?.includes('cuenta ha sido desactivada') || 
                               auth.error?.includes('Tu cuenta ha sido desactivada')

    const handleCloseInactiveNotification = () => {
        // Limpiar el error para cerrar la notificación
        auth.clearError()
    }

    return (
        <AuthContext.Provider value={auth}>
            {children}
            {isInactiveUserError && (
                <InactiveUserNotification 
                    message={auth.error || undefined}
                    onClose={handleCloseInactiveNotification}
                />
            )}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider')
    }
    return context
}