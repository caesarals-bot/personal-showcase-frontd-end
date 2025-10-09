/**
 * AdminLayout - Layout principal del panel de administración
 * 
 * Características:
 * - Sidebar con navegación
 * - Header con información del usuario
 * - Área de contenido principal
 * - Responsive (sidebar colapsable en móvil)
 */

import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Users,
  UserCircle,
  Briefcase,
  Settings,
  Menu,
  X,
  LogOut,
  Shield
} from 'lucide-react'
import type { AdminNavItem } from '@/types/admin.types'

/**
 * Items de navegación del panel de admin
 */
const navItems: AdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/admin'
  },
  {
    id: 'posts',
    label: 'Posts',
    icon: 'FileText',
    path: '/admin/posts'
  },
  {
    id: 'categories',
    label: 'Categorías',
    icon: 'FolderOpen',
    path: '/admin/categories'
  },
  {
    id: 'tags',
    label: 'Tags',
    icon: 'Tags',
    path: '/admin/tags'
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: 'Users',
    path: '/admin/users'
  },
  {
    id: 'profile',
    label: 'Perfil (About)',
    icon: 'UserCircle',
    path: '/admin/profile'
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: 'Briefcase',
    path: '/admin/portfolio'
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: 'Settings',
    path: '/admin/settings'
  }
]

/**
 * Mapeo de nombres de iconos a componentes
 */
const iconMap: Record<string, any> = {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Users,
  UserCircle,
  Briefcase,
  Settings
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuthContext()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return 'A'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo/Header del Sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Usuario en el Sidebar */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} alt={user?.displayName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(user?.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido Principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between h-full px-6">
            {/* Botón de menú móvil */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Título de la página */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-semibold">
                {navItems.find(item => item.path === location.pathname)?.label || 'Admin'}
              </h1>
            </div>

            {/* Acciones del header */}
            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  Ver Sitio
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Área de Contenido */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
