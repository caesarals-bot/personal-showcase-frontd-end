import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase/config';
import type { User } from '../types/blog.types';
import { getUserRole, createUserDocument, shouldBeAdmin } from './roleService';

// Función para convertir un usuario de Firebase a nuestro tipo User
const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Obtener rol desde Firestore (con fallback si falla por CORS)
  let role: 'admin' | 'user' | 'guest' = 'user';
  try {
    role = await getUserRole(firebaseUser.uid);
  } catch (error) {
    console.warn('⚠️ No se pudo obtener rol desde Firestore. Usando rol por defecto.');
    // Determinar rol basado en email si no se puede obtener de Firestore
    role = shouldBeAdmin(firebaseUser.email || '') ? 'admin' : 'user';
  }

  return {
    id: firebaseUser.uid,
    displayName: firebaseUser.displayName || 'Usuario',
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || undefined,
    isVerified: firebaseUser.emailVerified,
    isActive: true,
    role,
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
  };
};

// Modo de desarrollo para pruebas (sin Firebase)
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';// Cambiar a false cuando Firebase esté configurado correctamente

// Registro de usuario
export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
  try {
    // Si estamos en modo desarrollo, simular un registro exitoso
    if (DEV_MODE) {
      console.log('Modo desarrollo: Simulando registro de usuario');
      // Simular un retraso para imitar la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Crear un usuario simulado
      const mockUser: User = {
        id: `mock-${Date.now()}`,
        displayName: name,
        email: email,
        isVerified: false,
        isActive: true,
        role: shouldBeAdmin(email) ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };

      // Guardar en localStorage para simular persistencia
      localStorage.setItem('mockUser', JSON.stringify(mockUser));

      return mockUser;
    }

    // Código original para Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Actualizar el perfil con el nombre
    await updateProfile(userCredential.user, {
      displayName: name
    });

    // Determinar rol inicial
    const initialRole = shouldBeAdmin(email) ? 'admin' : 'user';

    // ⚠️ TEMPORAL: Crear documento en Firestore (puede fallar por CORS en desarrollo)
    try {
      await createUserDocument(
        userCredential.user.uid,
        email,
        name,
        initialRole
      );
    } catch (firestoreError) {
      console.warn('⚠️ No se pudo crear documento en Firestore (CORS). El usuario se creó en Auth correctamente.', firestoreError);
      // Continuar sin fallar - el usuario existe en Auth
    }
    
    return await mapFirebaseUser(userCredential.user);
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    // Si el error es auth/operation-not-allowed, dar un mensaje más claro
    if (error instanceof Error && error.message.includes('auth/operation-not-allowed')) {
      throw new Error('La autenticación por email/password no está habilitada en Firebase. Contacta al administrador o usa el modo de desarrollo.');
    }
    throw error;
  }
};

// Inicio de sesión
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    // Si estamos en modo desarrollo, simular un inicio de sesión exitoso
    if (DEV_MODE) {
      console.log('Modo desarrollo: Simulando inicio de sesión');
      // Simular un retraso para imitar la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar si hay un usuario simulado en localStorage
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        const mockUser = JSON.parse(storedUser) as User;
        // Verificar si coincide el email
        if (mockUser.email === email) {
          return mockUser;
        }
      }

      // Si no hay usuario o no coincide, crear uno nuevo
      const mockUser: User = {
        id: `mock-${Date.now()}`,
        displayName: 'Usuario Demo',
        email: email,
        isVerified: true,
        isActive: true,
        role: shouldBeAdmin(email) ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      return mockUser;
    }

    // Código original para Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return await mapFirebaseUser(userCredential.user);
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    // Si el error es auth/operation-not-allowed, dar un mensaje más claro
    if (error instanceof Error && error.message.includes('auth/operation-not-allowed')) {
      throw new Error('La autenticación por email/password no está habilitada en Firebase. Contacta al administrador o usa el modo de desarrollo.');
    }
    throw error;
  }
};

// Cerrar sesión
export const logoutUser = async (): Promise<void> => {
  try {
    // Si estamos en modo desarrollo, simular cierre de sesión
    if (DEV_MODE) {
      console.log('Modo desarrollo: Simulando cierre de sesión');
      // Simular un retraso para imitar la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Eliminar el usuario simulado del localStorage
      localStorage.removeItem('mockUser');
      return;
    }

    // Código original para Firebase
    await signOut(auth);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

// Recuperar contraseña
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    throw error;
  }
};

// Obtener usuario actual
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};