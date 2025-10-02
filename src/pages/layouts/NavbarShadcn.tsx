// Navbar principal con shadcn/ui
// - Fijo en la parte superior con fondo transparente y blur
// - Menú de escritorio con NavigationMenu (shadcn)
// - Menú móvil desplegable (hamburguesa) sin dependencias extra
// NOTA: Se usan <a href> por la restricción de no importar desde 'react-router-dom'

import { useState } from 'react'
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import Logo from '@/shared/components/Logo'

const NavbarShadcn = () => {
    // Estado para abrir/cerrar el menú móvil
    const [open, setOpen] = useState(false)

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Marca/Logo: enlaza a inicio */}
                <a href="/" aria-label="Ir al inicio" className="flex items-center">
                    <Logo align="left" color="#000000" width={150} height={40} />
                </a>

                {/* Botón hamburguesa (visible en móvil) */}
                <button
                    type="button"
                    aria-label="Abrir menú"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="inline-flex items-center justify-center rounded-md p-2 text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring md:hidden"
                >
                    {/* Ícono hamburger (SVG) */}
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

                {/* Menú escritorio (md+) basado en shadcn/ui */}
                <div className="hidden md:block">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a href="/" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                        Inicio
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a href="/portfolio" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                        Portafolio
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a href="/about" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                        Sobre mí
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a href="/blog" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                        Blog
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a href="/contactame" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                        Contáctame
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>

            {/* Menú móvil desplegable (se muestra bajo el header) */}
            {open && (
                <div className="md:hidden">
                    <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <ul className="space-y-1 py-2">
                            <li>
                                <a href="/" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                    Inicio
                                </a>
                            </li>
                            <li>
                                <a href="/portfolio" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                    Portafolio
                                </a>
                            </li>
                            <li>
                                <a href="/about" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                    Sobre mí
                                </a>
                            </li>
                            <li>
                                <a href="/blog" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="/contactame" className="block rounded-md px-3 py-2 text-sm font-medium hover:text-foreground">
                                    Contáctame
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </header>
    )
}

export default NavbarShadcn
