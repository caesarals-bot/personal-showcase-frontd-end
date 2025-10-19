import type { User, Author } from '@/types/blog.types';

export const mockAdminUser: User = {
    id: 'admin-mock-01',
    email: 'caesarals@gmail.com',
    displayName: 'César Alvarado',
    role: 'admin',
    isVerified: true,
    createdAt: new Date().toISOString(),
    firstName: 'Admin',
    lastName: 'User',
    userName: 'adminuser',
    avatar: 'https://i.pravatar.cc/150?u=admin',
    bio: 'Soy el administrador de este sitio. Estoy aquí para probar cosas.',
    isActive: true,
    socialLinks: {
        github: 'https://github.com/admin',
        linkedin: 'https://linkedin.com/in/admin'
    }
};

const mockUser1: User = {
    id: 'user-mock-01',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    role: 'user',
    isVerified: true,
    createdAt: '2024-01-15T10:00:00Z',
    firstName: 'John',
    lastName: 'Doe',
    userName: 'johndoe',
    avatar: 'https://i.pravatar.cc/150?u=johndoe',
    bio: 'Desarrollador frontend apasionado por React y TypeScript.',
    isActive: true,
    socialLinks: {
        github: 'https://github.com/johndoe',
        twitter: 'https://twitter.com/johndoe'
    }
};

const mockUser2: User = {
    id: 'user-mock-02',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    role: 'user',
    isVerified: true,
    createdAt: '2024-02-20T14:30:00Z',
    firstName: 'Jane',
    lastName: 'Smith',
    userName: 'janesmith',
    avatar: 'https://i.pravatar.cc/150?u=janesmith',
    bio: 'Backend developer y entusiasta de Node.js.',
    isActive: true,
    socialLinks: {
        linkedin: 'https://linkedin.com/in/janesmith',
        website: 'https://janesmith.dev'
    }
};

const mockUser3: User = {
    id: 'user-mock-03',
    email: 'carlos.dev@example.com',
    displayName: 'Carlos Developer',
    role: 'user',
    isVerified: false,
    createdAt: '2024-03-10T09:15:00Z',
    firstName: 'Carlos',
    lastName: 'Developer',
    userName: 'carlosdev',
    avatar: 'https://i.pravatar.cc/150?u=carlosdev',
    bio: 'Nuevo en el desarrollo web, aprendiendo cada día.',
    isActive: true,
};

const mockGuest: User = {
    id: 'guest-mock-01',
    email: 'guest@example.com',
    displayName: 'Guest User',
    role: 'guest',
    isVerified: false,
    createdAt: '2024-04-01T16:00:00Z',
    firstName: 'Guest',
    lastName: 'User',
    userName: 'guestuser',
    avatar: 'https://i.pravatar.cc/150?u=guest',
    bio: 'Usuario invitado para pruebas.',
    isActive: false,
};

export const mockAuthor: Author = {
    id: mockAdminUser.id,
    name: mockAdminUser.displayName,
    avatar: mockAdminUser.avatar
};

export const MOCK_USERS: User[] = [
    mockAdminUser,
    mockUser1,
    mockUser2,
    mockUser3,
    mockGuest
];
