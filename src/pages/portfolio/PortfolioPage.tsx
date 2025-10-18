import { Portfolio } from '@/components/portfolio/Portfolio'
import SEO from '@/components/SEO'

export default function PortfolioPage() {
  return (
    <>
      <SEO 
        title="Portfolio - Proyectos y Trabajos"
        description="Explora mi portfolio de proyectos web y aplicaciones. Cada proyecto muestra mi experiencia en desarrollo frontend y backend."
      />
      <Portfolio />
    </>
  )
}