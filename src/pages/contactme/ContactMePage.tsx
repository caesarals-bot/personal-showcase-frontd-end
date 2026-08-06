import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock, MessageCircle } from 'lucide-react'

import ContactForm from './components/ContactForm'
import ContactInfoDisplay from './components/ContactInfoDisplay'
import SEO from '@/components/SEO'

const ContactMePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
            <SEO
                title="Contacto"
                description="Ponte en contacto con César Londoño para colaboraciones, proyectos freelance, oportunidades laborales o simplemente para charlar sobre tecnología."
                keywords={['contacto', 'colaboración', 'freelance', 'proyectos', 'consultoría']}
                type="website"
            />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <div className="mb-4 flex justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="rounded-full bg-primary/10 p-4"
                        >
                            <MessageCircle className="h-8 w-8 text-primary" />
                        </motion.div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
                    >
                        <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Hablemos
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mx-auto max-w-2xl text-lg text-foreground/70 md:text-xl"
                    >
                        ¿Tienes un proyecto en mente? ¿Quieres colaborar? ¿O simplemente
                        quieres charlar sobre tecnología? Me encantaría escucharte.
                    </motion.p>
                </motion.div>

                {/* Contenido principal */}
                <div className="grid grid-cols-1 gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
                    {/* Información de contacto */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="lg:col-span-5"
                    >
                        <div className="lg:sticky lg:top-24">
                            <ContactInfoDisplay className="rounded-3xl border border-editorial-line/60 bg-white p-6 shadow-xl lg:p-8" />
                        </div>
                    </motion.div>

                    {/* Formulario de contacto */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="lg:col-span-7"
                    >
                        <div className="rounded-3xl border border-editorial-line/60 bg-white p-6 shadow-xl lg:p-8">
                            <div className="mx-auto mb-6 w-full max-w-xl">
                                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-editorial-ink-muted">
                                    Formulario de contacto
                                </p>
                                <h2 className="font-editorial text-2xl font-bold tracking-tight text-editorial-ink md:text-3xl">
                                    Envíame un mensaje
                                </h2>
                                <p className="mt-1 text-sm text-editorial-ink-muted">
                                    Completa el formulario y te responderé lo antes posible.
                                    Los campos marcados con * son obligatorios.
                                </p>
                            </div>

                            <div className="mx-auto w-full max-w-xl">
                                <ContactForm />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Card: Agenda una reunión */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="mt-8"
                >
                    <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-editorial-line/60 bg-editorial-cream p-6 text-editorial-ink shadow-xl sm:flex-row sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="hidden rounded-full bg-editorial-terracotta p-3 sm:block">
                                <CalendarClock className="size-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-editorial text-xl font-bold tracking-tight md:text-2xl">
                                    ¿Prefieres hablar en vivo?
                                </h3>
                                <p className="mt-1 text-sm text-editorial-ink-muted">
                                    Reserva una reunión de 30 minutos directo en mi
                                    calendario.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/agenda"
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-editorial-teal bg-editorial-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:bg-editorial-teal-deep hover:shadow-md active:scale-[0.98]"
                        >
                            Agenda una reunión
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </motion.div>

                {/* Sección adicional */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-12 text-center"
                >
                    <div className="rounded-3xl border border-editorial-line/60 bg-white/60 p-8 shadow-xl backdrop-blur-md">
                        <h3 className="mb-4 text-xl font-bold tracking-tight md:text-2xl">
                            ¿Prefieres otro medio?
                        </h3>
                        <p className="mx-auto max-w-2xl text-foreground/70">
                            También puedes encontrarme en mis redes sociales o enviarme un email
                            directamente. Siempre estoy abierto a nuevas oportunidades y
                            conversaciones interesantes.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default ContactMePage
