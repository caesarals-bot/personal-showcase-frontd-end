// Layout raíz de páginas: renderiza el header (shadcn) y el contenido de la ruta actual.
// pt-16 compensa la altura del header fijo (h-16) para que el contenido no quede oculto.
import { Outlet } from "react-router-dom"
import NavbarShadcn from "./NavbarShadcn"
import ContactInfo from "@/shared/components/ContactInfo"
import BackgroundPaths from "@/shared/components/BackgroundPaths"
import { RouteErrorBoundary } from "@/components/error-boundary"
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner"
import { useEmailVerification } from "@/hooks/useEmailVerification"


const PagesLayout = () => {
    const { showBanner, dismissBanner, userEmail } = useEmailVerification();
    
    return (
        <div className="min-h-screen relative">
            {/* Fondo animado global */}
            <BackgroundPaths />
            
            {/* Header fijo construido con shadcn/ui */}
            <NavbarShadcn />
            
            {/* Banner de verificación de email */}
            <EmailVerificationBanner 
                isVisible={showBanner}
                onDismiss={dismissBanner}
                userEmail={userEmail}
            />
            
            {/* Información de contacto flotante */}
            <ContactInfo 
                position="top-left" 
                variant="floating"
                // showEmail={true}
                showSocials={true}
            />

            {/* Contenido principal debajo del header fijo */}
            <main className="relative z-10 pt-16">
                <RouteErrorBoundary routeName="Public Pages">
                    <Outlet />
                </RouteErrorBoundary>
            </main>
        </div>
    )
}

export default PagesLayout
