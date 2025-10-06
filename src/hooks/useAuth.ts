import { useState, useEffect } from 'react'
import type { User, AuthState } from '@/types/blog.types'

// Hook simplificado sin Context - solo datos mock
export function useAuth(): AuthState & {
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    register: (userData: Omit<User, 'id' | 'createdAt' | 'isVerified' | 'role'>) => Promise<void>
} {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const initAuth = async () => {
            try {
                setIsLoading(true)
                await new Promise(resolve => setTimeout(resolve, 800))
                const mockUser: User = {
                    id: 'user-1',
                    name: 'César Londoño',
                    email: 'cesar@example.com',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                    bio: 'Desarrollador Full Stack',
                    isVerified: true,
                    role: 'admin',
                    createdAt: '2024-01-01T00:00:00Z',
                    social: {
                        github: 'cesarlondono',
                        linkedin: 'cesar-londono',
                        twitter: '@cesarlondono'
                    }
                }
                setUser(mockUser)
                setError(null)
            } catch (err) {
                setError('Error al verificar autenticación')
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        initAuth()
    }, [])

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            setError(null)
            await new Promise(resolve => setTimeout(resolve, 1000))
            if (!email || !password) {
                throw new Error('Email y contraseña son requeridos')
            }
            const loggedUser: User = {
                id: 'user-1',
                name: 'César Londoño',
                email,
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                isVerified: true,
                role: 'user',
                createdAt: new Date().toISOString()
            }
            setUser(loggedUser)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (userData: Omit<User, 'id' | 'createdAt' | 'isVerified' | 'role'>) => {
        try {
            setIsLoading(true)
            setError(null)
            await new Promise(resolve => setTimeout(resolve, 1500))
            const newUser: User = {
                ...userData,
                id: `user-${Date.now()}`,
                createdAt: new Date().toISOString(),
                isVerified: false,
                role: 'user'
            }
            setUser(newUser)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrarse')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            setIsLoading(true)
            await new Promise(resolve => setTimeout(resolve, 500))
            setUser(null)
            setError(null)
        } catch (err) {
            setError('Error al cerrar sesión')
        } finally {
            setIsLoading(false)
        }
    }

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        register
    }
}
