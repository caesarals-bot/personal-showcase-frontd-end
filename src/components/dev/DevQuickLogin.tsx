import type { User } from '@/types/blog.types';

type MockRole = 'admin' | 'user' | 'guest';

const MOCK_USERS: Record<MockRole, User> = {
  admin: {
    id: 'mock-admin-dev',
    email: 'admin-dev@localhost',
    displayName: 'Admin (DEV)',
    role: 'admin',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    avatar: 'https://i.pravatar.cc/150?u=admin-dev',
    bio: 'Mock admin para desarrollo local'
  },
  user: {
    id: 'mock-user-dev',
    email: 'user-dev@localhost',
    displayName: 'User (DEV)',
    role: 'user',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    avatar: 'https://i.pravatar.cc/150?u=user-dev',
    bio: 'Mock user para desarrollo local'
  },
  guest: {
    id: 'mock-guest-dev',
    email: 'guest-dev@localhost',
    displayName: 'Guest (DEV)',
    role: 'guest',
    isVerified: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    avatar: 'https://i.pravatar.cc/150?u=guest-dev',
    bio: 'Mock guest para desarrollo local'
  }
};

export const DevQuickLogin = () => {
  // Solo visible en DEV mode. En producción (import.meta.env.DEV === false) retorna null.
  if (!import.meta.env.DEV) return null;

  const quickLogin = (role: MockRole) => {
    const mockUser = MOCK_USERS[role];
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    window.location.reload();
  };

  return (
    <div
      data-testid="dev-quick-login"
      className="border-2 border-dashed border-yellow-500 p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20"
    >
      <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
        DEV MODE — Login rápido (solo visible en desarrollo local)
      </p>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => quickLogin('admin')}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Entrar como Admin
        </button>
        <button
          type="button"
          onClick={() => quickLogin('user')}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Entrar como User
        </button>
        <button
          type="button"
          onClick={() => quickLogin('guest')}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Entrar como Guest
        </button>
      </div>
    </div>
  );
};
