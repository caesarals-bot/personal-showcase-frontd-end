// Layout raíz de páginas: renderiza el header (shadcn) y el contenido de la ruta actual.
// pt-16 compensa la altura del header fijo (h-16) para que el contenido no quede oculto.
import { Outlet } from "react-router"
import NavbarShadcn from "./NavbarShadcn"

const PagesLayout = () => {
    return (
        <div className="min-h-screen">
            {/* Header fijo construido con shadcn/ui */}
            <NavbarShadcn />

            {/* Contenido principal debajo del header fijo */}
            <main className="pt-16">
                <Outlet />
            </main>
        </div>
    )
}

export default PagesLayout
