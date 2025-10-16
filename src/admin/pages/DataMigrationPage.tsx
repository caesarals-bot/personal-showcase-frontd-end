/**
 * DataMigrationPage - Página para migrar datos iniciales a Firebase
 * 
 * Características:
 * - Crear documento profile/about con datos de ejemplo
 * - Crear documentos de timeline con experiencias de ejemplo
 * - Botones individuales para cada migración
 * - Feedback visual de éxito/error
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { createProfile, getProfile } from '@/services/aboutService';
import { createTimelineItem, getTimelineItems } from '@/services/timelineService';
import type { Profile } from '@/types/about.types';

export default function DataMigrationPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreateProfile = async () => {
        setLoading('profile');
        setSuccess(null);
        setError(null);

        try {
            // Verificar si ya existe
            const existing = await getProfile();
            if (existing) {
                setError('Ya existe un perfil. Edítalo desde la página de Profile.');
                setLoading(null);
                return;
            }

            // Datos reales del perfil
            const profileData: Omit<Profile, 'id' | 'updatedAt'> = {
                fullName: "César Londoño",
                title: "Full Stack Developer & Tech Enthusiast",
                bio: "Curioso, inquieto y apasionado por la tecnología desde pequeño, transformé el juego en vocación. Soy Técnico Nivel Superior en Informática y futuro Ingeniero, navegando entre el front-end y el back-end con las herramientas que hoy construyen el mundo: HTML, CSS, JavaScript, React, Vue, Node.js y Ruby on Rails. Creo que el código limpio es más que técnica: es respeto por quienes lo heredan. Trabajo en equipo porque sé que las mejores ideas nacen en la diversidad, y busco la estabilidad sin dejar de innovar, porque el aprendizaje nunca termina.",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cesar",
                skills: [
                    "React",
                    "Vue.js",
                    "TypeScript",
                    "JavaScript",
                    "Node.js",
                    "Ruby on Rails",
                    "HTML",
                    "CSS",
                    "TailwindCSS",
                    "Firebase",
                    "PostgreSQL",
                    "MySQL",
                    "SQL",
                    "Git",
                    "GitHub",
                    "Java",
                    "Kotlin"
                ],
                languages: [
                    { name: "Español", level: "Nativo" }
                ],
                interests: [
                    "Desarrollo Web",
                    "Tecnología",
                    "Innovación",
                    "Aprendizaje continuo"
                ],
                contact: {
                    email: "cesar@ejemplo.com",
                    phone: "+54 9 11 1234-5678",
                    location: "Buenos Aires, Argentina"
                },
                social: {
                    github: "https://github.com/tu-usuario",
                    linkedin: "https://linkedin.com/in/tu-perfil",
                    twitter: "https://twitter.com/tu-usuario"
                }
            };

            await createProfile(profileData);
            setSuccess('✅ Perfil creado exitosamente! Ahora edita las URLs de redes sociales en la página de Profile.');
            setLoading(null);
        } catch (err: any) {
            setError(`Error al crear perfil: ${err.message}`);
            setLoading(null);
        }
    };

    const handleCreateTimeline = async () => {
        setLoading('timeline');
        setSuccess(null);
        setError(null);

        try {
            // Verificar si ya existen items
            const existing = await getTimelineItems();
            if (existing.length > 0) {
                setError('Ya existen items en la timeline. Edítalos desde la página de Timeline.');
                setLoading(null);
                return;
            }

            // Datos reales de timeline
            const timelineItems = [
                {
                    title: "Ingenieria Informatica",
                    company: "Iacc Chile",
                    period: "2025 en formacion",
                    description: "Estoy avanzando en Ingeniería en Informática mediante Continuidad de Estudios (RAP) en IACC, reconociendo aprendizajes previos y consolidando mi desarrollo profesional para obtener el título.",
                    skills: ["Java y mucho otros en formacion"],
                    type: "education" as const
                },
                {
                    title: "DESARROLLO RUBY ON RAILS PARA EMPRENDIMIENTOS DE TIPO START-UP",
                    company: "Talento Digital para Chile",
                    period: "2023",
                    description: "Curso de desarrollo Ruby on Rails para startups, capacita para crear MVPs funcionales con enfoque ágil, manejando todo el ciclo de vida del producto, bases de datos y presentación a inversores.",
                    skills: ["Ruby on Rails", "HTML", "CSS", "PostgreSQL", "Git", "GitHub", "Agile", "Scrum", "Kanban", "Testing", "Deployment", "Docker"],
                    type: "certification" as const
                },
                {
                    title: "Desarrollador Aplicaciones Frontend Trainee",
                    company: "Sence AWAKELAB",
                    period: "2022",
                    description: "Trainee en desarrollo frontend (430 horas) en Awakelab, Chile. Formación práctica en Vue.js y SQL, enfocada en creación, gestión y optimización de aplicaciones web modernas e interactivas.",
                    skills: ["Vue.js", "TypeScript", "PostgreSQL", "Jira", "Git", "GitHub", "Agile", "Testing", "Deployment"],
                    type: "certification" as const
                },
                {
                    title: "Aceleración de Alkemy",
                    period: "2021",
                    description: "Participé en la nivelación Alkemy, donde creé un proyecto React aplicando metodologías ágiles, demostrando dominio técnico, capacidad de trabajo colaborativo y solución creativa en entornos de desarrollo profesional.",
                    skills: ["React", "Redux", "React Router", "Lazy Loading", "Hooks", "Testing"],
                    type: "certification" as const
                },
                {
                    title: "Procesos de analisis de datos",
                    company: "Sence Chile (Servicio Nacional de Capacitación y Empleo)",
                    period: "2021",
                    description: "Curso SENCE de análisis de datos enfocado en recolección, procesamiento, interpretación y visualización de información, usando herramientas digitales y estadísticas, para apoyar la toma de decisiones en contextos laborales y productivos.",
                    skills: ["SQL", "ETL", "Visual Studio", "Modelado de datos"],
                    type: "certification" as const
                },
                {
                    title: "Bases De Datos Generalidades Y Sistemas De Gestion",
                    company: "SENA Colombia",
                    period: "2020",
                    description: "Curso corto del SENA sobre bases de datos, generalidades y sistemas de gestión. Aprendí modelado, consulta, administración de datos con SQL y fundamentos clave de los principales DBMS actuales.",
                    skills: ["SQL", "DBMS", "Modelado", "Consulta", "Administración de datos"],
                    type: "certification" as const
                },
                {
                    title: "Técnico Superior en Informática",
                    company: "IACC",
                    period: "2017 - 2020",
                    description: "Técnico de Nivel Superior en Informática (IACC), especializado en desarrollo y soporte de sistemas, bases de datos y aplicaciones. Capacitado para resolver problemas complejos, gestionar equipos y aplicar buenas prácticas, calidad y seguridad en entornos dinámicos. Destaca por su autonomía, trabajo colaborativo, pensamiento crítico y adaptación a la transformación digital.",
                    skills: ["Java", "MySQL", "HTML", "CSS", "JavaScript", "SQL"],
                    type: "education" as const
                }
            ];

            // Crear todos los items
            for (const item of timelineItems) {
                await createTimelineItem(item);
            }

            setSuccess(`✅ Timeline creada exitosamente! Se crearon ${timelineItems.length} items.`);
            setLoading(null);
        } catch (err: any) {
            setError(`Error al crear timeline: ${err.message}`);
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Migración de Datos</h1>
                <p className="text-muted-foreground">
                    Crea datos de ejemplo en Firebase para empezar rápidamente
                </p>
            </div>

            {/* Alertas */}
            {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                        {success}
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Cards de migración */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Profile / About
                        </CardTitle>
                        <CardDescription>
                            Crea el documento profile/about con datos de ejemplo
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm space-y-2">
                            <p className="font-medium">Incluye:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Nombre: César Londoño</li>
                                <li>Título: Full Stack Developer</li>
                                <li>Bio completa (tu biografía real)</li>
                                <li>17 Skills (React, Vue, Ruby on Rails, etc.)</li>
                                <li>Contacto: Buenos Aires, Argentina</li>
                                <li>Redes sociales (URLs placeholder - editar después)</li>
                            </ul>
                        </div>
                        <Button
                            onClick={handleCreateProfile}
                            disabled={loading !== null}
                            className="w-full"
                        >
                            {loading === 'profile' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Database className="mr-2 h-4 w-4" />
                                    Crear Profile
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            ⚠️ Después de crear, edita las URLs de redes sociales en la página de Profile
                        </p>
                    </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Timeline
                        </CardTitle>
                        <CardDescription>
                            Crea items de ejemplo en la timeline
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm space-y-2">
                            <p className="font-medium">Incluye 7 items:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>2 Educación (IACC en formación + Técnico Superior)</li>
                                <li>5 Certificaciones (Ruby on Rails, Vue.js, React, etc.)</li>
                            </ul>
                        </div>
                        <Button
                            onClick={handleCreateTimeline}
                            disabled={loading !== null}
                            className="w-full"
                        >
                            {loading === 'timeline' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Database className="mr-2 h-4 w-4" />
                                    Crear Timeline
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            💡 Después puedes editar o eliminar items desde la página de Timeline
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Instrucciones */}
            <Card>
                <CardHeader>
                    <CardTitle>📋 Instrucciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Orden recomendado:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Click en "Crear Profile" para crear tu perfil con datos de ejemplo</li>
                            <li>Click en "Crear Timeline" para crear tu experiencia laboral/educativa</li>
                            <li>Ve a la página "Profile" y edita:
                                <ul className="list-disc list-inside ml-6 mt-1">
                                    <li>Tu nombre completo</li>
                                    <li>Tu título profesional</li>
                                    <li>Tu biografía</li>
                                    <li>Tus skills reales</li>
                                    <li><strong>Las URLs de tus redes sociales</strong></li>
                                    <li>Tu email y teléfono</li>
                                </ul>
                            </li>
                            <li>Ve a la página "Timeline" y edita los items con tu experiencia real</li>
                            <li>¡Listo! Tu sitio estará completo</li>
                        </ol>
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Nota:</strong> Los botones solo funcionan si NO existen datos previos. 
                            Si ya creaste datos, edítalos directamente desde las páginas correspondientes.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
}
