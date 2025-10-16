/**
 * User Service - Gestión de usuarios con Firebase
 * Operaciones CRUD en Firestore
 */

import { collection, doc, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { User } from '@/types/blog.types';
import { MOCK_USERS } from '@/data/users.data';

// Flag para usar Firebase
const USE_FIREBASE = true;

// Base de datos en memoria (fallback)
let usersDB: User[] = [...MOCK_USERS];

// Simulación de delay de red
const DELAY_MS = 300;
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

/**
 * Obtener todos los usuarios
 */
export async function getUsers(): Promise<User[]> {
  if (!USE_FIREBASE) {
    await delay();
    return [...usersDB].sort((a, b) => a.displayName.localeCompare(b.displayName));
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
    
    return users.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    return [];
  }
}

/**
 * Obtener un usuario por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  await delay();
  return usersDB.find(user => user.id === id) || null;
}

/**
 * Obtener un usuario por email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  await delay();
  return usersDB.find(user => user.email === email) || null;
}

/**
 * Obtener un usuario por username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  await delay();
  return usersDB.find(user => user.userName === username) || null;
}

/**
 * Crear un nuevo usuario
 */
export async function createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
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
    return {
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
  await delay();
  
  const index = usersDB.findIndex(user => user.id === id);
  if (index === -1) {
    throw new Error('Usuario no encontrado');
  }

  usersDB.splice(index, 1);
}

/**
 * Alternar estado activo de un usuario
 */
export async function toggleUserActive(id: string): Promise<User> {
  await delay();
  
  const user = usersDB.find(u => u.id === id);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  user.isActive = !user.isActive;
  user.updatedAt = new Date().toISOString();
  
  return user;
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

/**
 * Resetear la base de datos a los valores iniciales
 */
export function resetUsersDB(): void {
  usersDB = [...MOCK_USERS];
}
