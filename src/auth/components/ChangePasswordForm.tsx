import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { changePassword } from '@/services/authService';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormErrorBoundary } from '@/components/error-boundary';

// Esquema de validación con la nueva política de contraseñas
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// Función para evaluar la fortaleza de la contraseña
const getPasswordStrength = (password: string) => {
  let score = 0;
  let feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push('Al menos 8 caracteres');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Una letra mayúscula');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Un número');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const strength = score === 0 ? 'muy-debil' : 
                  score === 1 ? 'debil' : 
                  score === 2 ? 'media' : 
                  score === 3 ? 'fuerte' : 'muy-fuerte';

  return { score, strength, feedback };
};

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');
  const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      await changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'muy-debil': return 'bg-red-500';
      case 'debil': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'fuerte': return 'bg-blue-500';
      case 'muy-fuerte': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'muy-debil': return 'Muy débil';
      case 'debil': return 'Débil';
      case 'media': return 'Media';
      case 'fuerte': return 'Fuerte';
      case 'muy-fuerte': return 'Muy fuerte';
      default: return '';
    }
  };

  return (
    <FormErrorBoundary formName="Change Password Form">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit"
          >
            <Lock className="h-6 w-6 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl font-bold">Cambiar Contraseña</CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mayor seguridad
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </motion.div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 bg-green-100 border border-green-200 text-green-800 rounded-md text-center"
            >
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="font-semibold">¡Contraseña actualizada!</p>
              <p className="text-sm">
                Tu contraseña ha sido cambiada exitosamente.
              </p>
              <Button onClick={() => navigate('/admin/profile')} className="mt-4 w-full">
                Volver al Perfil
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Contraseña actual */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Contraseña actual
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña actual"
                    {...register('currentPassword')}
                    className={errors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-destructive text-xs mt-1">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* Nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Nueva contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu nueva contraseña"
                    {...register('newPassword')}
                    className={errors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>
                )}

                {/* Indicador de fortaleza de contraseña */}
                {passwordStrength && newPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Fortaleza:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength === 'muy-fuerte' || passwordStrength.strength === 'fuerte' 
                          ? 'text-green-600' 
                          : passwordStrength.strength === 'media' 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {getStrengthText(passwordStrength.strength)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Falta: {passwordStrength.feedback.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirmar nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirmar nueva contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma tu nueva contraseña"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Cambiando contraseña...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Cambiar contraseña
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </FormErrorBoundary>
  );
}