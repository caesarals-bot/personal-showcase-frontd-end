// Navbar principal con shadcn/ui
// - Fijo en la parte superior con fondo transparente y blur
// - Menú de escritorio con NavigationMenu (shadcn)
// - Menú móvil desplegable (hamburguesa) con React Router Links

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut, Shield, LayoutDashboard } from 'lucide-react'
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import Logo from '@/shared/components/Logo'
import { ModeToggle } from '@/components/mode-toggle'
import { useTheme } from '@/components/theme-provider'

const NavbarShadcn = () => {
    const [open, setOpen] = useState(false)
    const { user, isAuthenticated, logout } = useAuthContext()
    const { theme } = useTheme()

    const handleLogout = async () => {
        await logout()
    }

    // Determinar color del logo según el tema
    const getLogoColor = () => {
        if (theme === 'dark') return '#ffffff'
        if (theme === 'light') return '#000000'
        // Si es 'system', detectar preferencia del sistema
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        return isDarkMode ? '#ffffff' : '#000000'
    }

    const getInitials = (name: string | undefined | null) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-gradient-to-r from-muted/80 via-background/80 to-muted/80 backdrop-blur-md supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-muted/60 supports-[backdrop-filter]:via-background/60 supports-[backdrop-filter]:to-muted/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" aria-label="Ir al inicio" className="flex items-center">
                    <Logo align="left" color={getLogoColor()} width={150} height={40} />
                </Link>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link to="/" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                            Inicio
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link to="/about" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                            Sobre mí
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link to="/portfolio" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                            Portfolio
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link to="/blog" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                            Blog
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link to="/contactame" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                            Contáctame
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* Theme Toggle - Desktop */}
                    <div className="hidden md:block">
                        <ModeToggle />
                    </div>

                    {isAuthenticated && user ? (
                        <div className="hidden md:flex items-center gap-2">
                            {user.role === 'admin' && (
                                <>
                                    <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Admin
                                    </Badge>
                                    <Link to="/admin" title="Panel de Administración">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                            <LayoutDashboard className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </>
                            )}
                            <div className="relative group">
                                <Avatar className="h-8 w-8 ring-2 ring-green-500/20 cursor-pointer">
                                    <AvatarImage src={user.avatar || undefined} alt={user.displayName || 'Usuario'} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {getInitials(user.displayName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                                    {user.displayName}
                                    {user.role === 'admin' && <span className="text-purple-500 ml-1">(Admin)</span>}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="text-muted-foreground hover:text-foreground"
                                title="Cerrar sesión"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                            >
                                <Link to="/auth/login">Iniciar Sesión</Link>
                            </Button>
                            <Button
                                size="sm"
                                asChild
                            >
                                <Link to="/auth/register">Registrarse</Link>
                            </Button>
                        </div>
                    )}

                    <button
                        type="button"
                        aria-label="Abrir menú"
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring md:hidden"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-6 w-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {open && (
                <div className="md:hidden">
                    <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <ul className="space-y-1 py-2">
                            <li>
                                <Link to="/" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground" onClick={() => setOpen(false)}>
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground" onClick={() => setOpen(false)}>
                                    Sobre mí
                                </Link>
                            </li>
                            <li>
                                <Link to="/portfolio" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground" onClick={() => setOpen(false)}>
                                    Portfolio
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground" onClick={() => setOpen(false)}>
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link to="/contactame" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground" onClick={() => setOpen(false)}>
                                    Contáctame
                                </Link>
                            </li>
                        </ul>

                        {/* Theme Toggle - Mobile */}
                        <div className="px-3 py-2">
                            <ModeToggle />
                        </div>

                        {isAuthenticated && user ? (
                            <div className="border-t border-border/40 mt-2 pt-2">
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <Avatar className="h-10 w-10 ring-2 ring-green-500/20">
                                        <AvatarImage src={user.avatar || undefined} alt={user.displayName || 'Usuario'} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {getInitials(user.displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">{user.displayName}</p>
                                            {user.role === 'admin' && (
                                                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-[10px] px-1.5 py-0">
                                                    <Shield className="h-2.5 w-2.5 mr-0.5" />
                                                    Admin
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="mt-2 border-t border-border/40 pt-2">
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent" onClick={() => setOpen(false)}>
                                            <LayoutDashboard className="h-4 w-4" />
                                            <span>Panel de Administración</span>
                                        </Link>
                                    )}
                                    <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent cursor-pointer text-red-500" onClick={handleLogout}>
                                        <LogOut className="h-4 w-4" />
                                        <span>Cerrar Sesión</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border-t border-border/40 mt-2 pt-2 px-3 pb-2">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        asChild
                                    >
                                        <Link to="/auth/login" onClick={() => setOpen(false)}>Iniciar Sesión</Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1"
                                        asChild
                                    >
                                        <Link to="/auth/register" onClick={() => setOpen(false)}>Registrarse</Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}

export default NavbarShadcn
