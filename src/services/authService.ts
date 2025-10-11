import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase/config';
import type { User } from '../types/blog.types';
import { /* getUserRole, createUserDocument, */ shouldBeAdmin } from './roleService'; // Firestore deshabilitado temporalmente

// Función para convertir un usuario de Firebase a nuestro tipo User
// NOTA: Comentada temporalmente para evitar CORS - se reemplazó por código inline
/* const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
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
}; */

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

    // ⚠️ DESHABILITADO: Firestore causa CORS en desarrollo
    // TODO: Habilitar cuando usemos emuladores o en producción
    /* try {
      await createUserDocument(
        userCredential.user.uid,
        email,
        name,
        initialRole
      );
    } catch (firestoreError) {
      console.warn('⚠️ No se pudo crear documento en Firestore (CORS). El usuario se creó en Auth correctamente.', firestoreError);
    } */
    console.log('✅ Usuario creado en Firebase Auth (Firestore deshabilitado temporalmente)');
    
    // Crear usuario manualmente sin llamar a getUserRole (evita CORS)
    return {
      id: userCredential.user.uid,
      displayName: name,
      email: email,
      avatar: userCredential.user.photoURL || undefined,
      isVerified: userCredential.user.emailVerified,
      isActive: true,
      role: initialRole,
      createdAt: userCredential.user.metadata.creationTime || new Date().toISOString()
    };
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
    
    // Determinar rol basado en email (Firestore deshabilitado temporalmente)
    const role = shouldBeAdmin(userCredential.user.email || '') ? 'admin' : 'user';
    console.log('✅ Usuario autenticado (Firestore deshabilitado temporalmente)');
    
    return {
      id: userCredential.user.uid,
      displayName: userCredential.user.displayName || 'Usuario',
      email: userCredential.user.email || '',
      avatar: userCredential.user.photoURL || undefined,
      isVerified: userCredential.user.emailVerified,
      isActive: true,
      role,
      createdAt: userCredential.user.metadata.creationTime || new Date().toISOString()
    };
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

// Login con Google
export const loginWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account' // Siempre mostrar selector de cuenta
    });

    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Determinar rol inicial (admin si es el email configurado)
    const initialRole = shouldBeAdmin(firebaseUser.email || '') ? 'admin' : 'user';

    // ⚠️ DESHABILITADO: Firestore causa CORS en desarrollo
    // TODO: Habilitar cuando usemos emuladores o en producción
    /* try {
      await createUserDocument(
        firebaseUser.uid,
        firebaseUser.email || '',
        firebaseUser.displayName || 'Usuario de Google',
        initialRole
      );
    } catch (firestoreError) {
      console.warn('⚠️ No se pudo crear/actualizar documento en Firestore. El usuario se autenticó correctamente.', firestoreError);
    } */
    console.log('✅ Usuario autenticado con Google (Firestore deshabilitado temporalmente)');

    // Retornar usuario sin llamar a getUserRole (evita CORS)
    return {
      id: firebaseUser.uid,
      displayName: firebaseUser.displayName || 'Usuario de Google',
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || undefined,
      isVerified: firebaseUser.emailVerified,
      isActive: true,
      role: initialRole,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    
    // Manejar errores específicos
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Inicio de sesión cancelado');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('El popup fue bloqueado. Permite popups para este sitio.');
    }
    
    throw new Error('Error al iniciar sesión con Google');
  }
};