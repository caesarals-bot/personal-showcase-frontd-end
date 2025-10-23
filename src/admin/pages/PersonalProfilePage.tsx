/**
 * PersonalProfilePage - Página para editar los datos personales del perfil
 * 
 * Permite editar todos los datos del perfil principal que se migran:
 * - Información personal (nombre, título, bio, avatar)
 * - Skills y tecnologías
 * - Idiomas y niveles
 * - Intereses profesionales
 * - Información de contacto
 * - Enlaces de redes sociales
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Github, 
    Linkedin, 
    Twitter, 
    Plus, 
    X, 
    Save, 
    Loader2,
    AlertCircle,
    CheckCircle,
    Code,
    Globe,
    Heart,
    Upload
} from 'lucide-react';
import { getProfile, updateProfile } from '@/services/aboutService';
import type { Profile } from '@/types/about.types';

// Usamos directamente el tipo Profile de about.types.ts para mantener compatibilidad
type PersonalProfileFormData = Omit<Profile, 'id' | 'updatedAt'>;

export default function PersonalProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Form data
    const [formData, setFormData] = useState<PersonalProfileFormData>({
        fullName: '',
        title: '',
        bio: '',
        avatar: '',
        resume: '',
        skills: [],
        languages: [],
        interests: [],
        contact: {
            email: '',
            phone: '',
            location: ''
        },
        social: {
            github: '',
            linkedin: '',
            twitter: '',
            instagram: '',
            website: ''
        }
    });

    // Temporary inputs for adding new items
    const [newSkill, setNewSkill] = useState('');
    const [newLanguage, setNewLanguage] = useState({ name: '', level: '' });
    const [newInterest, setNewInterest] = useState('');
    const [newSocialNetwork, setNewSocialNetwork] = useState({ name: '', url: '' });

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const profile = await getProfile();
            
            if (profile) {
                setProfile(profile);
                setFormData({
                    fullName: profile.fullName || '',
                    title: profile.title || '',
                    bio: profile.bio || '',
                    avatar: profile.avatar || '',
                    resume: profile.resume || '',
                    skills: profile.skills || [],
                    languages: profile.languages || [],
                    interests: profile.interests || [],
                    contact: {
                        email: profile.contact?.email || '',
                        phone: profile.contact?.phone || '',
                        location: profile.contact?.location || ''
                    },
                    social: {
                        github: profile.social?.github || '',
                        linkedin: profile.social?.linkedin || '',
                        twitter: profile.social?.twitter || '',
                        instagram: profile.social?.instagram || '',
                        website: profile.social?.website || '',
                        additional: profile.social?.additional || []
                    }
                });
            }
        } catch (error) {
            console.error('Error al cargar datos del perfil:', error);
            setError(`Error al cargar el perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };



    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            if (!profile) {
                setError('No se encontró el perfil para actualizar');
                return;
            }

            const updatedProfile: Profile = {
                ...profile,
                ...formData,
                updatedAt: new Date().toISOString()
            };

            await updateProfile(updatedProfile);
            setSuccess('✅ Perfil actualizado exitosamente');
            setProfile(updatedProfile);
            
            // Recargar datos para asegurar sincronización
            await loadProfileData();
        } catch (err: any) {
            setError(`Error al guardar: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Skills management
    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    // Languages management
    const addLanguage = () => {
        if (newLanguage.name.trim() && newLanguage.level.trim()) {
            const exists = formData.languages?.some(lang => 
                lang.name.toLowerCase() === newLanguage.name.toLowerCase()
            );
            
            if (!exists) {
                setFormData({
                    ...formData,
                    languages: [...(formData.languages || []), { ...newLanguage }]
                });
                setNewLanguage({ name: '', level: '' });
            }
        }
    };

    const removeLanguage = (index: number) => {
        setFormData({
            ...formData,
            languages: formData.languages?.filter((_, i) => i !== index) || []
        });
    };

    // Interests management
    const addInterest = () => {
        if (newInterest.trim() && !formData.interests?.includes(newInterest.trim())) {
            setFormData({
                ...formData,
                interests: [...(formData.interests || []), newInterest.trim()]
            });
            setNewInterest('');
        }
    };

    const removeInterest = (interestToRemove: string) => {
        setFormData({
            ...formData,
            interests: formData.interests?.filter(interest => interest !== interestToRemove) || []
        });
    };

    // Additional social networks management
    const addSocialNetwork = () => {
        if (newSocialNetwork.name.trim() && newSocialNetwork.url.trim()) {
            const exists = formData.social.additional?.some(social => 
                social.name.toLowerCase() === newSocialNetwork.name.toLowerCase()
            );
            
            if (!exists) {
                setFormData({
                    ...formData,
                    social: {
                        ...formData.social,
                        additional: [
                            ...(formData.social.additional || []),
                            { ...newSocialNetwork }
                        ]
                    }
                });
                setNewSocialNetwork({ name: '', url: '' });
            }
        }
    };

    const removeSocialNetwork = (index: number) => {
        setFormData({
            ...formData,
            social: {
                ...formData.social,
                additional: formData.social.additional?.filter((_, i) => i !== index) || []
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Cargando perfil...</span>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Datos Personales</h1>
                        <p className="text-muted-foreground">Gestiona tu información personal y profesional</p>
                    </div>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No se encontró un perfil. Ve a la página de <strong>Migrar Datos</strong> para crear tu perfil inicial.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Perfil Personal
                        </h1>
                        <p className="text-gray-600">
                            Gestiona tu información personal y profesional
                        </p>
                    </div>
                </div>
            </div>
            <div className="space-y-6">
            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                        </>
                    )}
                </Button>
            </div>

            {/* Alerts */}
            {success && (
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Información Personal */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Información Personal
                        </CardTitle>
                        <CardDescription>
                            Datos básicos de tu perfil profesional
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nombre Completo *</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Tu nombre completo"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Título Profesional *</Label>
                                <Input
                                    id="title"
                                    placeholder="Ej: Full Stack Developer"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="avatar">Avatar (URL)</Label>
                            <Input
                                id="avatar"
                                placeholder="https://..."
                                value={formData.avatar}
                                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Biografía *</Label>
                            <Textarea
                                id="bio"
                                placeholder="Cuéntanos sobre ti, tu experiencia y pasiones..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={6}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="resume">CV/Resume (URL)</Label>
                            <div className="relative">
                                <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="resume"
                                    placeholder="https://drive.google.com/file/d/tu-cv"
                                    className="pl-10"
                                    value={formData.resume}
                                    onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                URL pública de tu CV (Google Drive, Dropbox, etc.)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-purple-600" />
                            Habilidades Técnicas
                        </CardTitle>
                        <CardDescription>
                            Tecnologías, lenguajes y herramientas que dominas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Agregar nueva habilidad"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            />
                            <Button onClick={addSkill} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(skill)}
                                        className="ml-1 hover:text-destructive"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Idiomas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Idiomas
                        </CardTitle>
                        <CardDescription>
                            Idiomas que hablas y tu nivel de competencia
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Idioma"
                                value={newLanguage.name}
                                onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                            />
                            <Input
                                placeholder="Nivel"
                                value={newLanguage.level}
                                onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                            />
                            <Button onClick={addLanguage} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="space-y-2">
                            {formData.languages?.map((language, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                    <span><strong>{language.name}</strong> - {language.level}</span>
                                    <button
                                        onClick={() => removeLanguage(index)}
                                        className="text-destructive hover:text-destructive/80"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Intereses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Intereses Profesionales
                        </CardTitle>
                        <CardDescription>
                            Áreas de interés y temas que te apasionan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Agregar nuevo interés"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                            />
                            <Button onClick={addInterest} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {formData.interests?.map((interest, index) => (
                                <Badge key={index} variant="outline" className="flex items-center gap-1">
                                    {interest}
                                    <button
                                        onClick={() => removeInterest(interest)}
                                        className="ml-1 hover:text-destructive"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Información de Contacto */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-green-600" />
                            Información de Contacto
                        </CardTitle>
                        <CardDescription>
                            Datos de contacto profesional
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        className="pl-10"
                                        value={formData.contact.email}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            contact: { ...formData.contact, email: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        placeholder="+54 9 11 1234-5678"
                                        className="pl-10"
                                        value={formData.contact.phone}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            contact: { ...formData.contact, phone: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="location">Ubicación</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="location"
                                    placeholder="Ciudad, País"
                                    className="pl-10"
                                    value={formData.contact.location}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        contact: { ...formData.contact, location: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Redes Sociales */}
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-orange-600" />
                            Redes Sociales
                        </CardTitle>
                        <CardDescription>
                            Enlaces a tus perfiles profesionales
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="github">GitHub</Label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="github"
                                        placeholder="https://github.com/tu-usuario"
                                        className="pl-10"
                                        value={formData.social.github}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            social: { ...formData.social, github: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="linkedin"
                                        placeholder="https://linkedin.com/in/tu-perfil"
                                        className="pl-10"
                                        value={formData.social.linkedin}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            social: { ...formData.social, linkedin: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter</Label>
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="twitter"
                                        placeholder="https://twitter.com/tu-usuario"
                                        className="pl-10"
                                        value={formData.social.twitter}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            social: { ...formData.social, twitter: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="instagram"
                                        placeholder="https://instagram.com/tu-usuario"
                                        className="pl-10"
                                        value={formData.social.instagram}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            social: { ...formData.social, instagram: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="website">Sitio Web Personal</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="website"
                                    placeholder="https://tu-sitio-web.com"
                                    className="pl-10"
                                    value={formData.social.website}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        social: { ...formData.social, website: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        {/* Redes Sociales Adicionales */}
                        <Separator className="my-6" />
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium">Redes Sociales Adicionales</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Agrega otras redes sociales o plataformas profesionales
                                    </p>
                                </div>
                            </div>

                            {/* Lista de redes sociales adicionales */}
                            {formData.social.additional && formData.social.additional.length > 0 && (
                                <div className="space-y-2">
                                    {formData.social.additional.map((social, index) => (
                                        <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm">{social.name}</div>
                                                <div className="text-xs text-muted-foreground truncate">{social.url}</div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSocialNetwork(index)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Formulario para agregar nueva red social */}
                            <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="newSocialName">Nombre de la Red</Label>
                                        <Input
                                            id="newSocialName"
                                            placeholder="ej: TikTok, YouTube, Behance..."
                                            value={newSocialNetwork.name}
                                            onChange={(e) => setNewSocialNetwork({
                                                ...newSocialNetwork,
                                                name: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newSocialUrl">URL del Perfil</Label>
                                        <Input
                                            id="newSocialUrl"
                                            placeholder="https://..."
                                            value={newSocialNetwork.url}
                                            onChange={(e) => setNewSocialNetwork({
                                                ...newSocialNetwork,
                                                url: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    onClick={addSocialNetwork}
                                    disabled={!newSocialNetwork.name.trim() || !newSocialNetwork.url.trim()}
                                    className="w-full"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar Red Social
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer con botón de guardar */}
            <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                        </>
                    )}
                </Button>
            </div>
        </div>
        </div>
    );
}