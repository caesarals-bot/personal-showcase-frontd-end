// Navbar transparente, fijo en la parte superior con enlaces de navegación.
// Usa Tailwind para estilos (transparente + blur) y NavLink para estado activo.
import { Link, NavLink } from 'react-router'

// Componente que renderiza el navbar
const Navbar = () => {
    return (
        // Header fijo: ocupa la parte superior, con borde sutil y blur para legibilidad
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Contenedor del nav con ancho máximo y espaciado responsivo */}
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Marca/Logo: enlace a la página de inicio */}
                <div className="flex items-center gap-3">
                    <Link to="/" className="text-base font-semibold tracking-tight">
                        MiPortafolio
                    </Link>
                </div>
                {/* Menú principal (se oculta en móvil y aparece en md+) */}
                <ul className="hidden items-center gap-1 md:flex">
                    <li>
                        {/* NavLink cambia de estilo cuando la ruta está activa */}
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'
                                }`
                            }
                        >
                            Inicio
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/portfolio"
                            className={({ isActive }) =>
                                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'
                                }`
                            }
                        >
                            Portafolio
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/about"
                            className={({ isActive }) =>
                                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'
                                }`
                            }
                        >
                            Sobre mí
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/blog"
                            className={({ isActive }) =>
                                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'
                                }`
                            }
                        >
                            Blog
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/contactame"
                            className={({ isActive }) =>
                                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'
                                }`
                            }
                        >
                            Contáctame
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    )
}

export default Navbar
