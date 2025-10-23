/**
 * ProfileEditPage - Página para editar información personal del perfil
 * 
 * Características:
 * - Editar información personal (nombre, título, bio, etc.)
 * - Gestionar información de contacto
 * - Actualizar redes sociales
 * - Gestionar habilidades e intereses
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Github, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Globe,
  Save,
  Loader2,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Camera,
  Lock,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Profile } from '@/types/about.types';
import { getProfile, updateProfile } from '@/services/aboutService';
import ImageOptimizer from '@/components/ui/ImageOptimizer';
import { ImageUrlDisplay } from '@/components/ui/ImageUrlDisplay';
import { imageOptimizer } from '@/services/imageOptimizer';
import type { BatchOptimizeAndUploadResult, OptimizeAndUploadResult } from '@/services/imageOptimizer';
import type { UploadProgress } from '@/services/imageUploadService';
import { useAuthContext } from '@/contexts/AuthContext';

interface FormData {
  fullName: string
  title: string
  bio: string
  avatar?: string
  resume?: string
  skills: string[]
  languages: Array<{ name: string; level: string }>
  interests: string[]
  contact: {
    email: string
    phone?: string
    location?: string
    website?: string
    additional?: Array<{ name: string; url: string; icon?: string }>
  }
  social: {
    github?: string
    linkedin?: string
    twitter?: string
    instagram?: string
    youtube?: string
    facebook?: string
    discord?: string
    telegram?: string
    additional?: Array<{ name: string; url: string; icon?: string }>
  }
}

export default function ProfileEditPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newLanguage, setNewLanguage] = useState({ name: '', level: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    title: '',
    bio: '',
    avatar: '',
    resume: '',
    contact: {
      email: '',
      phone: '',
      location: '',
      website: '',
      additional: []
    },
    social: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      youtube: '',
      facebook: '',
      discord: '',
      telegram: '',
      additional: []
    },
    skills: [],
    languages: [],
    interests: []
  });

  // Manejar imágenes optimizadas del avatar
  const handleOptimizedAvatar = async (optimizedFiles: File[]) => {
    if (!user?.id) {
      console.error('Usuario no autenticado');
      return;
    }

    if (optimizedFiles.length === 0) return;

    setUploadingAvatar(true);
    try {
      // Usar el servicio de imageOptimizer para optimizar y subir
      const result: BatchOptimizeAndUploadResult = await imageOptimizer.optimizeAndUploadBatch(
        optimizedFiles,
        `avatars/${user.id}`, // folder específico para avatares
        undefined, // options (usa defaults)
        (_progress: UploadProgress[]) => {
          // Progreso de subida
        }
      );

      if (result.successCount > 0) {
        // Tomar la primera imagen subida exitosamente
        const uploadedUrl = result.results
          .filter((r: OptimizeAndUploadResult) => r.upload && !r.error)
          .map((r: OptimizeAndUploadResult) => r.upload!.url)[0];

        if (uploadedUrl) {
          setFormData(prev => ({
            ...prev,
            avatar: uploadedUrl
          }));
        }
      }
      
      // Mostrar errores si los hay
      if (result.errorCount > 0) {
        const errors = result.results.filter((r: OptimizeAndUploadResult) => r.error);
        console.warn('⚠️ Error al subir avatar:', errors);
        setError('Error al subir la imagen del avatar');
      }
    } catch (error) {
      console.error('❌ Error al procesar avatar:', error);
      setError('Error al procesar la imagen del avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Cargar datos del perfil
  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getProfile();
      if (profile) {
        setFormData({
          fullName: profile.fullName || '',
          title: profile.title || '',
          bio: profile.bio || '',
          avatar: profile.avatar || '',
          resume: profile.resume || '',
          contact: {
            email: profile.contact?.email || '',
            phone: profile.contact?.phone || '',
            location: profile.contact?.location || '',
            website: profile.contact?.website || '',
            additional: profile.contact?.additional || []
          },
          social: {
            github: profile.social?.github || '',
            linkedin: profile.social?.linkedin || '',
            twitter: profile.social?.twitter || '',
            instagram: profile.social?.instagram || '',
            youtube: profile.social?.youtube || '',
            facebook: profile.social?.facebook || '',
            discord: profile.social?.discord || '',
            telegram: profile.social?.telegram || '',
            additional: profile.social?.additional || []
          },
          skills: profile.skills || [],
          languages: profile.languages || [],
          interests: profile.interests || []
        });
      }
    } catch (err) {
      setError('Error al cargar el perfil');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Manejar cambios en campos de texto
  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof FormData];
        // Verificar que el valor padre sea un objeto antes de usar spread
        if (typeof parentValue === 'object' && parentValue !== null && !Array.isArray(parentValue)) {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Agregar habilidad
  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  // Eliminar habilidad
  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Agregar interés
  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  // Eliminar interés
  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  // Agregar idioma
  const addLanguage = () => {
    if (newLanguage.name.trim() && newLanguage.level.trim()) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, { ...newLanguage }]
      }));
      setNewLanguage({ name: '', level: '' });
    }
  };

  // Eliminar idioma
  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  // Funciones para manejar campos adicionales de contacto
  const addAdditionalContact = () => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        additional: [...(prev.contact.additional || []), { name: '', url: '', icon: '' }]
      }
    }))
  }

  const updateAdditionalContact = (index: number, field: 'name' | 'url' | 'icon', value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        additional: prev.contact.additional?.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        ) || []
      }
    }))
  }

  const removeAdditionalContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        additional: prev.contact.additional?.filter((_, i) => i !== index) || []
      }
    }))
  }

  // Funciones para manejar redes sociales adicionales
  const addAdditionalSocial = () => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        additional: [...(prev.social.additional || []), { name: '', url: '', icon: '' }]
      }
    }))
  }

  const updateAdditionalSocial = (index: number, field: 'name' | 'url' | 'icon', value: string) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        additional: prev.social.additional?.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        ) || []
      }
    }))
  }

  const removeAdditionalSocial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        additional: prev.social.additional?.filter((_, i) => i !== index) || []
      }
    }))
  };

  // Guardar cambios
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const profileData: Partial<Profile> = {
        fullName: formData.fullName,
        title: formData.title,
        bio: formData.bio,
        avatar: formData.avatar || undefined,
        resume: formData.resume || undefined,
        contact: formData.contact,
        social: formData.social,
        skills: formData.skills,
        languages: formData.languages,
        interests: formData.interests
      };

      await updateProfile(profileData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Error al guardar el perfil');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editar Perfil</h1>
          <p className="text-muted-foreground">
            Actualiza tu información personal y profesional
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </>
          )}
        </Button>
      </div>

      {/* Alertas */}
      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Perfil actualizado exitosamente
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Datos básicos de tu perfil profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Foto de Perfil */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Foto de Perfil
              </Label>
              <ImageOptimizer
                          preset="avatar"
                          multiple={false}
                          onImagesOptimized={handleOptimizedAvatar}
                          disabled={uploadingAvatar}
                          className="w-full"
                        />
              {uploadingAvatar && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">Subiendo imagen...</span>
                </div>
              )}
              {formData.avatar && (
                <div className="space-y-3">
                  {/* Vista previa de la imagen */}
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={formData.avatar} 
                        alt="Vista previa del avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-green-700">Foto de perfil cargada</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                      className="ml-auto text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* URL para copiar */}
                  <div className="space-y-2">
                    <Label>URL del Avatar</Label>
                    <ImageUrlDisplay urls={[formData.avatar]} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            <div>
              <Label htmlFor="title">Título Profesional</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Full Stack Developer"
              />
            </div>
            <div>
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="resume">URL del CV</Label>
              <Input
                id="resume"
                value={formData.resume}
                onChange={(e) => handleInputChange('resume', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Información de Contacto
            </CardTitle>
            <CardDescription>
              Datos para que puedan contactarte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange('contact.email', e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.contact.phone || ''}
                  onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                  placeholder="+57 300 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.contact.location || ''}
                  onChange={(e) => handleInputChange('contact.location', e.target.value)}
                  placeholder="Ciudad, País"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  value={formData.contact.website || ''}
                  onChange={(e) => handleInputChange('contact.website', e.target.value)}
                  placeholder="https://tusitio.com"
                />
              </div>
            </div>

            {/* Campos adicionales de contacto */}
            {formData.contact.additional && formData.contact.additional.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Información de Contacto Adicional</Label>
                {formData.contact.additional.map((contact, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Nombre (ej: Skype)"
                        value={contact.name}
                        onChange={(e) => updateAdditionalContact(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="URL o valor de contacto"
                        value={contact.url}
                        onChange={(e) => updateAdditionalContact(index, 'url', e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        placeholder="Icono"
                        value={contact.icon || ''}
                        onChange={(e) => updateAdditionalContact(index, 'icon', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAdditionalContact(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              onClick={addAdditionalContact}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Más Información de Contacto
            </Button>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Gestiona la seguridad de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Contraseña</h4>
                  <p className="text-sm text-muted-foreground">
                    Actualiza tu contraseña para mayor seguridad
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/change-password')}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Cambiar Contraseña
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redes Sociales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Redes Sociales
          </CardTitle>
          <CardDescription>
            Enlaces a tus perfiles en redes sociales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Label>
              <Input
                id="github"
                value={formData.social.github || ''}
                onChange={(e) => handleInputChange('social.github', e.target.value)}
                placeholder="https://github.com/usuario"
              />
            </div>
            <div>
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={formData.social.linkedin || ''}
                onChange={(e) => handleInputChange('social.linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/usuario"
              />
            </div>
            <div>
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter
              </Label>
              <Input
                id="twitter"
                value={formData.social.twitter || ''}
                onChange={(e) => handleInputChange('social.twitter', e.target.value)}
                placeholder="https://twitter.com/usuario"
              />
            </div>
            <div>
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={formData.social.instagram || ''}
                onChange={(e) => handleInputChange('social.instagram', e.target.value)}
                placeholder="https://instagram.com/usuario"
              />
            </div>
            <div>
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={formData.social.youtube || ''}
                onChange={(e) => handleInputChange('social.youtube', e.target.value)}
                placeholder="https://youtube.com/@usuario"
              />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={formData.social.facebook || ''}
                onChange={(e) => handleInputChange('social.facebook', e.target.value)}
                placeholder="https://facebook.com/usuario"
              />
            </div>
            <div>
              <Label htmlFor="discord">Discord</Label>
              <Input
                id="discord"
                value={formData.social.discord || ''}
                onChange={(e) => handleInputChange('social.discord', e.target.value)}
                placeholder="usuario#1234"
              />
            </div>
            <div>
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                value={formData.social.telegram || ''}
                onChange={(e) => handleInputChange('social.telegram', e.target.value)}
                placeholder="https://t.me/usuario"
              />
            </div>
          </div>

          {/* Redes sociales adicionales */}
          {formData.social.additional && formData.social.additional.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Redes Sociales Adicionales</Label>
              {formData.social.additional.map((social, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Nombre de la red (ej: TikTok)"
                      value={social.name}
                      onChange={(e) => updateAdditionalSocial(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="URL del perfil"
                      value={social.url}
                      onChange={(e) => updateAdditionalSocial(index, 'url', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      placeholder="Icono"
                      value={social.icon || ''}
                      onChange={(e) => updateAdditionalSocial(index, 'icon', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdditionalSocial(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            onClick={addAdditionalSocial}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Más Redes Sociales
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Habilidades */}
        <Card>
          <CardHeader>
            <CardTitle>Habilidades</CardTitle>
            <CardDescription>
              Tecnologías y herramientas que dominas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Nueva habilidad"
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
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Intereses */}
        <Card>
          <CardHeader>
            <CardTitle>Intereses</CardTitle>
            <CardDescription>
              Temas que te apasionan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Nuevo interés"
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              />
              <Button onClick={addInterest} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {interest}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Idiomas */}
      <Card>
        <CardHeader>
          <CardTitle>Idiomas</CardTitle>
          <CardDescription>
            Idiomas que hablas y tu nivel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newLanguage.name}
              onChange={(e) => setNewLanguage(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Idioma"
              className="flex-1"
            />
            <Input
              value={newLanguage.level}
              onChange={(e) => setNewLanguage(prev => ({ ...prev, level: e.target.value }))}
              placeholder="Nivel (Ej: Nativo, Avanzado)"
              className="flex-1"
            />
            <Button onClick={addLanguage} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {formData.languages.map((language, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span><strong>{language.name}</strong> - {language.level}</span>
                <X 
                  className="h-4 w-4 cursor-pointer hover:text-red-500" 
                  onClick={() => removeLanguage(index)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}