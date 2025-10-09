// Navbar principal con shadcn/ui
// - Fijo en la parte superior con fondo transparente y blur
// - Menú de escritorio con NavigationMenu (shadcn)
// - Menú móvil desplegable (hamburguesa) con React Router Links

import { useState } from 'react'
import { Link } from 'react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut, Shield } from 'lucide-react'
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import Logo from '@/shared/components/Logo'

const NavbarShadcn = () => {
    const [open, setOpen] = useState(false)
    const { user, isAuthenticated, logout } = useAuthContext()

    const handleLogout = async () => {
        await logout()
    }

    const getInitials = (name: string | undefined) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" aria-label="Ir al inicio" className="flex items-center">
                    <Logo align="left" color="#000000" width={150} height={40} />
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

                    {isAuthenticated && user && (
                        <div className="hidden md:flex items-center gap-2">
                            {user.role === 'admin' && (
                                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                </Badge>
                            )}
                            <div className="relative group">
                                <Avatar className="h-8 w-8 ring-2 ring-green-500/20 cursor-pointer">
                                    <AvatarImage src={user.avatar} alt={user.displayName} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {getInitials(user.displayName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                                    {user.displayName}
                                    {user.role === 'admin' && <span className="text-purple-500 ml-1">(Admin)</span>}
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover rotate-45"></div>
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
                                <Link to="/" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                    Sobre mí
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link to="/contactame" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                    Contáctame
                                </Link>
                            </li>
                        </ul>

                        {isAuthenticated && user ? (
                            <div className="border-t border-border/40 mt-2 pt-2">
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <Avatar className="h-10 w-10 ring-2 ring-green-500/20">
                                        <AvatarImage src={user.avatar} alt={user.displayName} />
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="text-muted-foreground"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span className="ml-2">Salir</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-t border-border/40 mt-2 pt-2 px-3 pb-2">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setOpen(false)
                                            window.location.href = '/auth/login'
                                        }}
                                    >
                                        Iniciar Sesión
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setOpen(false)
                                            window.location.href = '/auth/register'
                                        }}
                                    >
                                        Registrarse
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
