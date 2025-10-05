// HomePage: sección hero con logo, foto y texto dinámico.
// - Logo: SVG desde /public, centrado sobre la foto (negro para máximo contraste)
// - Foto: centrada, con borde sutil y sombra
// - Texto dinámico: alterna entre "Desarrollador web" y "Ingeniero informático" usando Oswald 500
// - Animación: efecto flip 3D (ver utilidades en src/index.css)

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import Logo from '@/shared/components/Logo'

const HomePage = () => {
    // Fases del texto: 0 = Desarrollador web, 1 = Ingeniero informático
    const [phase, setPhase] = useState<0 | 1>(0)
    const [anim, setAnim] = useState<'in' | 'out'>('in')

    // Textos a alternar (bucle infinito)
    const texts = useMemo(() => [
        'Desarrollador web',
        'Ingeniero informático',
    ], [])

    // Control de animación: mostrar, salir y alternar
    useEffect(() => {
        let t: number
        const show = 2000 // ms visibles
        const hide = 600  // ms de salida

        if (anim === 'in') {
            t = window.setTimeout(() => setAnim('out'), show)
        } else {
            t = window.setTimeout(() => {
                setPhase((p) => (p === 0 ? 1 : 0))
                setAnim('in')
            }, hide)
        }

        return () => window.clearTimeout(t)
    }, [anim])

    return (
        <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-4 text-center">
            {/* Contenedor relativo para superponer elementos respecto a la foto */}
            <div className="relative">
                {/* Logo centrado encima de la foto */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mx-auto mb-2 w-64 max-w-[90vw] sm:w-[30rem]"
                >
                    <Logo align="center" color="#000000" width={480} height={136} className="mb-2" />
                </motion.div>

                {/* Foto principal */}
                <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    src="/mia (1).png"
                    alt="Foto de Cesar Londoño"
                    className="mx-auto h-64 w-64 rounded-3xl border border-border/40 object-cover shadow-lg sm:h-72 sm:w-72"
                />
            </div>

            {/* Texto dinámico con fuente Oswald 500 y efecto flip 3D + corchetes */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="relative mt-6 min-h-[2.25rem] flip-perspective"
            >
                <div className="inline-flex items-center gap-2">
                    {/* Corchete izquierdo */}
                    <span className="oswald oswald-500 text-2xl text-foreground/70">[</span>

                    {/* Palabra animada */}
                    <p
                        className={`oswald oswald-600 text-2xl will-change-transform inline-block ${
                            anim === 'in' ? 'flip-in-up' : 'flip-out-up'
                        }`}
                    >
                        {texts[phase]}
                    </p>

                    {/* Corchete derecho */}
                    <span className="oswald oswald-500 text-2xl text-foreground/70">]</span>
                </div>
            </motion.div>

            {/* Lema debajo del texto animado */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="mt-2 max-w-xl text-sm text-foreground/70"
            >
                Creando experiencias digitales memorables que fusionan diseño y tecnología para resolver problemas complejos.
            </motion.p>

            {/* Acento visual opcional bajo el texto */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="relative mt-2 flex items-center justify-center"
            >
                <span
                    aria-hidden
                    className="absolute -z-10 h-24 w-24 rounded-full border border-border/50 animate-[spin_12s_linear_infinite]"
                />
            </motion.div>
        </section>
    )
}

export default HomePage