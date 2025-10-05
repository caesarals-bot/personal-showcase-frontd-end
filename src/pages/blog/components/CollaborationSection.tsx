import { motion } from 'framer-motion'
import { Mail, MessageCircle, Users, Lightbulb, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CollaborationSectionProps {
    onContactClick: () => void
}

export default function CollaborationSection({ onContactClick }: CollaborationSectionProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16"
        >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Invitación a colaborar */}
                <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
                    <CardHeader>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-3">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                                Colaboración
                            </Badge>
                        </div>
                        <CardTitle className="text-2xl">
                            ¿Tienes una idea genial?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Siempre estoy abierto a colaborar en proyectos interesantes.
                            Si tienes una idea, un proyecto o simplemente quieres charlar
                            sobre tecnología, ¡me encantaría escucharte!
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                <span>Proyectos de código abierto</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span>Colaboraciones técnicas</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MessageCircle className="h-4 w-4 text-green-500" />
                                <span>Consultoría y mentoría</span>
                            </div>
                        </div>

                        <Button
                            onClick={onContactClick}
                            className="w-full group"
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Hablemos de tu proyecto
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Invitación a comentar */}
                <Card className="border-border/50 bg-gradient-to-br from-secondary/5 to-secondary/10 backdrop-blur-sm">
                    <CardHeader>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-secondary/10 p-3">
                                <MessageCircle className="h-6 w-6 text-secondary-foreground" />
                            </div>
                            <Badge variant="outline" className="border-secondary/50">
                                Comunidad
                            </Badge>
                        </div>
                        <CardTitle className="text-2xl">
                            Únete a la conversación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Para comentar y participar en las discusiones, necesitas
                            crear una cuenta. Es rápido, gratuito y te permitirá
                            interactuar con otros desarrolladores.
                        </p>

                        <div className="rounded-lg bg-muted/50 p-4">
                            <h4 className="font-medium mb-2">Con una cuenta puedes:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Comentar en los artículos</li>
                                <li>• Dar like a tus posts favoritos</li>
                                <li>• Guardar artículos para leer después</li>
                                <li>• Recibir notificaciones de nuevos posts</li>
                            </ul>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                                Iniciar Sesión
                            </Button>
                            <Button className="flex-1">
                                Registrarse
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Estadísticas del blog */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8"
            >
                <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">15+</div>
                                <div className="text-sm text-muted-foreground">Artículos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">5.2k</div>
                                <div className="text-sm text-muted-foreground">Lectores</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">1.8k</div>
                                <div className="text-sm text-muted-foreground">Likes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">320</div>
                                <div className="text-sm text-muted-foreground">Comentarios</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.section>
    )
}
