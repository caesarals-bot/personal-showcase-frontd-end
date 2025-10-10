/**
 * User Service - Gestión local de usuarios (sin Firebase)
 * Operaciones CRUD en memoria usando datos de la carpeta data/
 */

import type { User } from '@/types/blog.types';
import { MOCK_USERS } from '@/data/users.data';

// Base de datos en memoria
let usersDB: User[] = [...MOCK_USERS];

// Simulación de delay de red
const DELAY_MS = 300;
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

/**
 * Obtener todos los usuarios
 */
export async function getUsers(): Promise<User[]> {
  await delay();
  return [...usersDB].sort((a, b) => a.displayName.localeCompare(b.displayName));
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
  console.log('[UserService] Usuario creado:', newUser);
  return newUser;
}

/**
 * Actualizar un usuario existente
 */
export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  await delay();
  
  const index = usersDB.findIndex(user => user.id === id);
  if (index === -1) {
    throw new Error('Usuario no encontrado');
  }

  // Si se actualiza el email, validar que no exista
  if (data.email && data.email !== usersDB[index].email) {
    const exists = usersDB.some(user => user.email === data.email);
    if (exists) {
      throw new Error(`Ya existe un usuario con el email: ${data.email}`);
    }
  }

  // Si se actualiza el username, validar que no exista
  if (data.userName && data.userName !== usersDB[index].userName) {
    const exists = usersDB.some(user => user.userName === data.userName);
    if (exists) {
      throw new Error(`Ya existe un usuario con el username: ${data.userName}`);
    }
  }

  usersDB[index] = {
    ...usersDB[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  console.log('[UserService] Usuario actualizado:', usersDB[index]);
  return usersDB[index];
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

  const deleted = usersDB.splice(index, 1)[0];
  console.log('[UserService] Usuario eliminado:', deleted);
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
  
  console.log('[UserService] Estado del usuario cambiado:', user);
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
  console.log('[UserService] Base de datos reseteada');
}
