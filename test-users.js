// Script temporal para probar getUsers()
console.log('Testing getUsers function...');

// Simular el entorno de Vite
process.env.VITE_USE_FIREBASE = 'false';

// Importar la función (esto es solo para verificar la lógica)
const mockUsers = [
    {
        id: 'admin-mock-01',
        email: 'admin@mock.com',
        displayName: 'Admin User',
        role: 'admin',
        isVerified: true,
        createdAt: new Date().toISOString(),
        firstName: 'Admin',
        lastName: 'User',
        userName: 'adminuser',
        avatar: 'https://i.pravatar.cc/150?u=admin',
        bio: 'Soy el administrador de este sitio.',
        isActive: true
    },
    {
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
        bio: 'Desarrollador frontend.',
        isActive: true
    }
];

console.log('Mock users:', mockUsers);
console.log('Total users:', mockUsers.length);
console.log('Environment VITE_USE_FIREBASE:', process.env.VITE_USE_FIREBASE);