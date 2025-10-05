// Layout raíz de páginas: renderiza el header (shadcn) y el contenido de la ruta actual.
// pt-16 compensa la altura del header fijo (h-16) para que el contenido no quede oculto.
import { Outlet } from "react-router"
import NavbarShadcn from "./NavbarShadcn"
import ContactInfo from "@/shared/components/ContactInfo"
import BackgroundPaths from "@/shared/components/BackgroundPaths"


const PagesLayout = () => {
    return (
        <div className="min-h-screen relative">
            {/* Fondo animado global */}
            <BackgroundPaths />
            
            {/* Header fijo construido con shadcn/ui */}
            <NavbarShadcn />
            
            {/* Información de contacto flotante */}
            <ContactInfo 
                position="top-left" 
                variant="floating"
                showEmail={true}
                showSocials={true}
            />

            {/* Contenido principal debajo del header fijo */}
            <main className="relative z-10 pt-16">
                <Outlet />
            </main>
        </div>
    )
}

export default PagesLayout
