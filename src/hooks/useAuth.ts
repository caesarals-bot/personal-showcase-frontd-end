import { useState, useEffect } from 'react'
import type { User, AuthState } from '../types/blog.types'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import { loginUser, logoutUser, registerUser, loginWithGoogle } from '../services/authService'
// import { getUserRole } from '../services/roleService' // Comentado temporalmente - CORS en desarrollo

// Constante para modo desarrollo (debe coincidir con authService.ts)
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// Hook actualizado para usar Firebase Auth o modo desarrollo
export function useAuth(): AuthState & {
    login: (email: string, password: string) => Promise<void>
    loginWithGoogle: () => Promise<void>
    logout: () => Promise<void>
    register: (userData: { email: string, name: string, password: string }) => Promise<void>
} {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // En modo desarrollo, verificar si hay un usuario en localStorage
        if (DEV_MODE) {
            const storedUser = localStorage.getItem('mockUser');
            if (storedUser) {
                try {
                    // Validar que sea un string JSON válido antes de parsear
                    if (storedUser.startsWith('{') || storedUser.startsWith('[')) {
                        const userData = JSON.parse(storedUser) as User;
                        setUser(userData);
                    } else {
                        console.warn('⚠️ localStorage contenía datos inválidos. Limpiando...');
                        localStorage.removeItem('mockUser');
                    }
                } catch (err) {
                    console.error('Error al parsear usuario almacenado:', err);
                    localStorage.removeItem('mockUser');
                }
            } else {
                // Si no hay usuario en localStorage, configurar usuario administrador por defecto
                const adminUser: User = {
                    id: 'admin-mock-01',
                    email: 'caesarals@gmail.com',
                    displayName: 'César Alvarado',
                    role: 'admin',
                    isVerified: true,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    firstName: 'César',
                    lastName: 'Alvarado',
                    userName: 'caesarals',
                    avatar: 'https://i.pravatar.cc/150?u=admin',
                    bio: 'Administrador del sitio'
                };
                localStorage.setItem('mockUser', JSON.stringify(adminUser));
                setUser(adminUser);
                // Usuario administrador configurado automáticamente en modo desarrollo
            }
            setIsLoading(false);
            return () => {}; // No hay nada que limpiar en modo desarrollo
        }

        // Código original para Firebase
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setIsLoading(true)
            if (firebaseUser) {
                // Determinar rol basado en email (sin Firestore por ahora)
                const { shouldBeAdmin } = await import('../services/roleService');
                const role = shouldBeAdmin(firebaseUser.email || '') ? 'admin' : 'user';
                
                const userData: User = {
                    id: firebaseUser.uid,
                    displayName: firebaseUser.displayName || 'Usuario',
                    email: firebaseUser.email || '',
                    avatar: firebaseUser.photoURL || undefined,
                    isVerified: firebaseUser.emailVerified,
                    isActive: true,
                    role,
                    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
                }
                setUser(userData)
                setError(null)
            } else {
                setUser(null)
            }
            setIsLoading(false)
        })

        // Limpiar el listener cuando el componente se desmonte
        return () => unsubscribe()
    }, [])

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            setError(null)
            const userData = await loginUser(email, password)
            setUser(userData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (userData: { email: string, name: string, password: string }) => {
        try {
            setIsLoading(true)
            setError(null)
            const newUser = await registerUser(userData.email, userData.password, userData.name)
            setUser(newUser)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrarse')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const loginGoogle = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const userData = await loginWithGoogle()
            setUser(userData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión con Google')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            setIsLoading(true)
            await logoutUser()
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
        loginWithGoogle: loginGoogle,
        logout,
        register
    }
}
