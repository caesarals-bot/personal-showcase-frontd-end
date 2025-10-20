/**
 * User Service - Gestión de usuarios con Firebase
 * Operaciones CRUD en Firestore
 */

import { collection, doc, getDocs, getDoc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { User } from '@/types/blog.types';
import { MOCK_USERS } from '@/data/users.data';

// Flag para usar Firebase
const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';

// Base de datos en memoria (fallback)
let usersDB: User[] = [...MOCK_USERS];

// Simulación de delay de red
const DELAY_MS = 300;
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

// Sistema de caché
const CACHE_KEY = 'users_cache';
const CACHE_EXPIRY_KEY = 'users_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtener usuarios del caché local
 */
function getUsersFromCache(): User[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    
    if (!cached || !expiry) return null;
    
    if (Date.now() > parseInt(expiry)) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
      return null;
    }
    
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

/**
 * Guardar usuarios en el caché local
 */
function saveUsersToCache(users: User[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(users));
    localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
  } catch {
    // Ignorar errores de localStorage
  }
}

/**
 * Limpiar caché de usuarios
 */
function clearUsersCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_EXPIRY_KEY);
}

/**
 * Obtener todos los usuarios
 */
export async function getUsers(): Promise<User[]> {
  if (!USE_FIREBASE) {
    await delay();
    return [...usersDB].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  // Intentar obtener del caché primero
  const cachedUsers = getUsersFromCache();
  if (cachedUsers) {
    return cachedUsers.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users: User[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName || data.email?.split('@')[0] || 'Usuario',
        firstName: data.firstName,
        lastName: data.lastName,
        userName: data.userName,
        avatar: data.avatar,
        bio: data.bio,
        isVerified: data.isVerified || false,
        isActive: data.isActive !== false,
        role: data.role || 'user',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        socialLinks: data.socialLinks
      };
    });
    
    // Guardar en caché
    saveUsersToCache(users);
    
    return users.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    console.error('Error getting users from Firebase:', error);
    return [];
  }
}

/**
 * Obtener un usuario por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  if (!USE_FIREBASE) {
    await delay();
    return usersDB.find(user => user.id === id) || null;
  }

  try {
    const userRef = doc(db, 'users', id);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    return {
      id: userDoc.id,
      email: userData.email,
      displayName: userData.displayName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userName: userData.userName,
      avatar: userData.avatar,
      bio: userData.bio,
      isVerified: userData.isVerified,
      isActive: userData.isActive,
      role: userData.role,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
      updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || userData.updatedAt,
      socialLinks: userData.socialLinks
    };
  } catch (error) {
    // Error getting user by ID - returning null
    return null;
  }
}

/**
 * Obtener un usuario por email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!USE_FIREBASE) {
    await delay();
    return usersDB.find(user => user.email === email) || null;
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    return {
      id: userDoc.id,
      email: userData.email,
      displayName: userData.displayName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userName: userData.userName,
      avatar: userData.avatar,
      bio: userData.bio,
      isVerified: userData.isVerified,
      isActive: userData.isActive,
      role: userData.role,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
      updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || userData.updatedAt,
      socialLinks: userData.socialLinks
    };
  } catch (error) {
    // Error getting user by email - returning null
    return null;
  }
}

/**
 * Obtener un usuario por username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  if (!USE_FIREBASE) {
    await delay();
    return usersDB.find(user => user.userName === username) || null;
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('userName', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    return {
      id: userDoc.id,
      email: userData.email,
      displayName: userData.displayName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userName: userData.userName,
      avatar: userData.avatar,
      bio: userData.bio,
      isVerified: userData.isVerified,
      isActive: userData.isActive,
      role: userData.role,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
      updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || userData.updatedAt,
      socialLinks: userData.socialLinks
    };
  } catch (error) {
    // Error getting user by username - returning null
    return null;
  }
}

/**
 * Crear un nuevo usuario
 */
export async function createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  if (!USE_FIREBASE) {
    await delay();
    
    // Validar que el email no exista
    const existsByEmail = usersDB.some(user => user.email === data.email);
    if (existsByEmail) {
      throw new Error(`Ya existe un usuario con el email: ${data.email}`);
    }

    // Validar que el username no exista (si se proporciona)
    if (data.userName) {
      const existsByUsername = usersDB.some(user => user.userName === data.userName);
      if (existsByUsername) {
        throw new Error(`Ya existe un usuario con el username: ${data.userName}`);
      }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...data,
    };

    usersDB.push(newUser);
    return newUser;
  }

  try {
    // Validar que el email no exista en Firebase
    const existingUserByEmail = await getUserByEmail(data.email);
    if (existingUserByEmail) {
      throw new Error(`Ya existe un usuario con el email: ${data.email}`);
    }

    // Validar que el username no exista (si se proporciona)
    if (data.userName) {
      const existingUserByUsername = await getUserByUsername(data.userName);
      if (existingUserByUsername) {
        throw new Error(`Ya existe un usuario con el username: ${data.userName}`);
      }
    }

    const usersRef = collection(db, 'users');
    const newUserData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(usersRef, newUserData);
    
    const newUser: User = {
      id: docRef.id,
      createdAt: new Date().toISOString(),
      ...data,
    };

    // Limpiar caché después de crear usuario
    clearUsersCache();

    return newUser;
  } catch (error) {
    // Error creating user - rethrowing
    throw error;
  }
}

/**
 * Actualizar un usuario existente
 */
export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  if (!USE_FIREBASE) {
    await delay();
    
    const index = usersDB.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }

    usersDB[index] = {
      ...usersDB[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return usersDB[index];
  }

  try {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
    
    const updatedDoc = await getDoc(userRef);
    if (!updatedDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }
    
    const userData = updatedDoc.data();
    const updatedUser = {
      id: updatedDoc.id,
      email: userData.email,
      displayName: userData.displayName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userName: userData.userName,
      avatar: userData.avatar,
      bio: userData.bio,
      isVerified: userData.isVerified,
      isActive: userData.isActive,
      role: userData.role,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
      updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || userData.updatedAt,
      socialLinks: userData.socialLinks
    };

    // Limpiar caché después de actualizar usuario
    clearUsersCache();

    return updatedUser;
  } catch (error) {
    throw error;
  }
}

/**
 * Cambiar rol de un usuario (función específica para admin)
 */
export async function changeUserRole(userId: string, newRole: 'admin' | 'collaborator' | 'user' | 'guest'): Promise<void> {
  try {
    await updateUser(userId, { role: newRole });
  } catch (error) {
    throw error;
  }
}


/**
 * Eliminar un usuario
 */
export async function deleteUser(id: string): Promise<void> {
  if (!USE_FIREBASE) {
    await delay();
    
    const index = usersDB.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }

    usersDB.splice(index, 1);
    return;
  }

  try {
    const userRef = doc(db, 'users', id);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }
    
    await deleteDoc(userRef);
    
    // Limpiar caché después de eliminar usuario
    clearUsersCache();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Alternar estado activo de un usuario
 */
export async function toggleUserActive(id: string): Promise<User> {
  if (!USE_FIREBASE) {
    await delay();
    
    const user = usersDB.find(u => u.id === id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.isActive = !user.isActive;
    user.updatedAt = new Date().toISOString();
    
    return user;
  }

  try {
    // Primero obtenemos el usuario actual
    const currentUser = await getUserById(id);
    if (!currentUser) {
      throw new Error('Usuario no encontrado');
    }

    // Alternamos el estado activo
    const updatedUser = await updateUser(id, { 
      isActive: !currentUser.isActive 
    });

    return updatedUser;
  } catch (error) {
    console.error('Error toggling user active status:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de usuarios
 */
export async function getUsersStats(): Promise<{
  total: number;
  admins: number;
  users: number;
  guests: number;
  verified: number;
  active: number;
}> {
  if (!USE_FIREBASE) {
    await delay();
    
    return {
      total: usersDB.length,
      admins: usersDB.filter(u => u.role === 'admin').length,
      users: usersDB.filter(u => u.role === 'user').length,
      guests: usersDB.filter(u => u.role === 'guest').length,
      verified: usersDB.filter(u => u.isVerified).length,
      active: usersDB.filter(u => u.isActive).length,
    };
  }

  try {
    const allUsers = await getUsers();
    
    return {
      total: allUsers.length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      users: allUsers.filter(u => u.role === 'user').length,
      guests: allUsers.filter(u => u.role === 'guest').length,
      verified: allUsers.filter(u => u.isVerified).length,
      active: allUsers.filter(u => u.isActive).length,
    };
  } catch (error) {
    // Error getting users stats - returning default values
    return {
      total: 0,
      admins: 0,
      users: 0,
      guests: 0,
      verified: 0,
      active: 0,
    };
  }
}

/**
 * Resetear la base de datos a los valores iniciales
 */
export function resetUsersDB(): void {
  usersDB = [...MOCK_USERS];
}
