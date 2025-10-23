import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase/config';
import type { User } from '../types/blog.types';
import { createUserDocument, shouldBeAdmin } from './roleService';

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

    // Enviar email de verificación
    try {
      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/auth/login?verified=true`,
        handleCodeInApp: false
      });
      console.log('✅ Email de verificación enviado exitosamente');
    } catch (verificationError) {
      console.warn('⚠️ Error al enviar email de verificación:', verificationError);
      // No lanzar error - el usuario se registró exitosamente
    }

    // Determinar rol inicial
    const initialRole = shouldBeAdmin(email) ? 'admin' : 'user';

    // Crear documento de usuario en Firestore
    try {
      await createUserDocument(
        userCredential.user.uid,
        email,
        name,
        initialRole
      );
    } catch (firestoreError) {
      console.error('⚠️ Error al crear documento en Firestore:', firestoreError);
      // Continuar aunque falle Firestore - el usuario ya está en Auth
    }
    
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

// Reenviar email de verificación
export const resendEmailVerification = async (): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    if (user.emailVerified) {
      throw new Error('El email ya está verificado');
    }

    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth/login?verified=true`,
      handleCodeInApp: false
    });

    console.log('✅ Email de verificación reenviado exitosamente');
  } catch (error) {
    console.error('Error al reenviar email de verificación:', error);
    throw error;
  }
};

// Verificar si el email del usuario actual está verificado
export const isEmailVerified = (): boolean => {
  const user = getCurrentUser();
  return user?.emailVerified || false;
};

// Recargar información del usuario (útil después de verificar email)
export const reloadUserInfo = async (): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (user) {
      await user.reload();
    }
  } catch (error) {
    console.error('Error al recargar información del usuario:', error);
    throw error;
  }
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

    // Crear documento de usuario en Firestore
    try {
      await createUserDocument(
        firebaseUser.uid,
        firebaseUser.email || '',
        firebaseUser.displayName || 'Usuario de Google',
        initialRole
      );
    } catch (firestoreError) {
      // No se pudo crear/actualizar documento en Firestore. El usuario se autenticó correctamente.
    }

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

// Reautenticar usuario con contraseña actual
export const reauthenticateUser = async (currentPassword: string): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.email) {
      throw new Error('No hay usuario autenticado');
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
  } catch (error: any) {
    console.error('Error al reautenticar usuario:', error);
    
    if (error.code === 'auth/wrong-password') {
      throw new Error('La contraseña actual es incorrecta');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos fallidos. Intenta más tarde.');
    }
    
    throw new Error('Error al verificar la contraseña actual');
  }
};

// Cambiar contraseña del usuario autenticado
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    // Primero reautenticar al usuario
    await reauthenticateUser(currentPassword);

    // Luego cambiar la contraseña
    await updatePassword(user, newPassword);
    
    console.log('✅ Contraseña actualizada exitosamente');
  } catch (error: any) {
    console.error('Error al cambiar contraseña:', error);
    
    if (error.code === 'auth/weak-password') {
      throw new Error('La nueva contraseña es muy débil');
    }
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Por seguridad, necesitas iniciar sesión nuevamente antes de cambiar tu contraseña');
    }
    
    throw error;
  }
};