import { motion } from 'framer-motion'
import { MessageCircle, Send } from 'lucide-react'

import ContactForm from './components/ContactForm'
import ContactInfoDisplay from './components/ContactInfoDisplay'

const ContactMePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
            <div className="container mx-auto px-4 py-8 lg:py-12">
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
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
                    {/* Información de contacto */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="lg:col-span-1"
                    >
                        <div className="sticky top-8">
                            <ContactInfoDisplay className="rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow lg:p-8" />
                        </div>
                    </motion.div>

                    {/* Formulario de contacto */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="lg:col-span-2"
                    >
                        <div className="rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow lg:p-8">
                            <div className="mb-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Send className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                                        Envíame un mensaje
                                    </h2>
                                </div>
                                <p className="text-foreground/70">
                                    Completa el formulario y te responderé lo antes posible.
                                    Todos los campos marcados con * son obligatorios.
                                </p>
                            </div>

                            <ContactForm />
                        </div>
                    </motion.div>
                </div>

                {/* Sección adicional */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-12 text-center"
                >
                    <div className="rounded-2xl border border-border/50 bg-card/60 p-8 backdrop-blur-md shadow-md">
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
