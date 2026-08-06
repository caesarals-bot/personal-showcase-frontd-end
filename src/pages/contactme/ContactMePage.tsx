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
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-10 text-center md:mb-12"
                >
                    <div className="mb-4 flex justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="rounded-full bg-primary/10 p-3"
                        >
                            <MessageCircle className="h-7 w-7 text-primary" />
                        </motion.div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
                    >
                        <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Hablemos
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mx-auto max-w-2xl text-base text-foreground/70 md:text-xl"
                    >
                        ¿Tienes un proyecto en mente? ¿Quieres colaborar? ¿O simplemente
                        quieres charlar sobre tecnología? Me encantaría escucharte.
                    </motion.p>
                </motion.div>

                {/* Contenido principal */}
                <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-6">
                    {/* Información de contacto + banner en vivo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-col gap-6 lg:col-span-5"
                    >
                        <div className="rounded-3xl border border-editorial-line/60 bg-white p-5 shadow-xl lg:p-6">
                            <ContactInfoDisplay />
                        </div>

                        {/* Card: ¿Prefieres hablar en vivo? (integrada en la columna de info) */}
                        <div className="flex flex-col gap-4 rounded-3xl border border-editorial-line/60 bg-editorial-cream p-5 text-editorial-ink shadow-xl lg:p-6">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-editorial-terracotta p-3">
                                    <CalendarClock className="size-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-editorial text-lg font-bold tracking-tight">
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
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-editorial-teal bg-editorial-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:bg-editorial-teal-deep hover:shadow-md active:scale-[0.98]"
                            >
                                Agenda una reunión
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Formulario de contacto */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="lg:col-span-7"
                    >
                        <div className="h-full rounded-3xl border border-editorial-line/60 bg-white p-5 shadow-xl lg:p-6">
                            <div className="mb-6">
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

                            <ContactForm />
                        </div>
                    </motion.div>
                </div>

                {/* Sección: ¿Prefieres otro medio? */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-10 text-center md:mt-12"
                >
                    <div className="rounded-3xl border border-editorial-line/60 bg-white/60 p-5 shadow-xl backdrop-blur-md md:p-6">
                        <h3 className="mb-3 text-xl font-bold tracking-tight md:text-2xl">
                            ¿Prefieres otro medio?
                        </h3>
                        <p className="mx-auto max-w-2xl text-sm text-foreground/70 md:text-base">
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
