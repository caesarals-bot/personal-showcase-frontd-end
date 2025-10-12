import { motion } from 'framer-motion';
import { Construction, Rocket, Code2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const PortfolioPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-8"
                >
                    {/* Icon Animation */}
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                        }}
                        className="flex justify-center"
                    >
                        <div className="relative">
                            <Construction className="h-24 w-24 text-primary" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-2 -right-2"
                            >
                                <Sparkles className="h-8 w-8 text-yellow-500" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Portfolio
                        </h1>
                        <p className="text-3xl md:text-4xl font-semibold text-muted-foreground">
                            En Construcción
                        </p>
                    </div>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Estoy trabajando en algo increíble. Esta sección estará disponible pronto con mis proyectos más destacados.
                    </p>

                    {/* Features Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                        {[
                            { icon: Code2, title: 'Proyectos', desc: 'Aplicaciones web y móviles' },
                            { icon: Rocket, title: 'Tecnologías', desc: 'Stack moderno y escalable' },
                            { icon: Sparkles, title: 'Diseño', desc: 'UI/UX profesional' }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <Card className="border-2 hover:border-primary/50 transition-colors">
                                    <CardContent className="pt-6 space-y-4">
                                        <feature.icon className="h-10 w-10 text-primary mx-auto" />
                                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Skeleton Preview */}
                    <div className="max-w-4xl mx-auto mt-16 space-y-4">
                        <h3 className="text-xl font-semibold text-muted-foreground mb-6">
                            Vista Previa de Proyectos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((item) => (
                                <Card key={item}>
                                    <CardContent className="p-6 space-y-4">
                                        <Skeleton className="h-48 w-full rounded-lg" />
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-20" />
                                            <Skeleton className="h-8 w-20" />
                                            <Skeleton className="h-8 w-20" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="pt-12 space-y-4"
                    >
                        <p className="text-muted-foreground">
                            Mientras tanto, puedes conocer más sobre mí o contactarme
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button asChild size="lg">
                                <Link to="/about">
                                    Sobre Mí
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link to="/contact">
                                    Contacto
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" size="lg">
                                <Link to="/blog">
                                    Ver Blog
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Estimated Launch */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="pt-8"
                    >
                        <p className="text-sm text-muted-foreground">
                            Fecha estimada de lanzamiento: <span className="font-semibold text-primary">Próximamente</span>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default PortfolioPage;
