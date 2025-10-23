import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { resetPassword } from '@/services/authService';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, Shield, CheckCircle } from 'lucide-react';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { RecaptchaWrapper } from '@/components/RecaptchaWrapper';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormErrorBoundary } from '@/components/error-boundary';

// Esquema de validación
const resetPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  recaptcha: z.string().min(1, 'Por favor, completa la verificación reCAPTCHA')
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      recaptcha: ''
    }
  });

  const {
    recaptchaRef,
    recaptchaToken,
    recaptchaError,
    resetRecaptcha,
    onRecaptchaChange
  } = useRecaptcha();

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setEmailSent(false);

      if (!recaptchaToken) {
        setError('Por favor, completa la verificación reCAPTCHA');
        setIsLoading(false);
        return;
      }

      await resetPassword(data.email);
      setEmailSent(true);
      setError(null);
    } catch (err) {
      setError('Error al enviar el correo de restablecimiento. Asegúrate de que el correo electrónico sea válido.');
      resetRecaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormErrorBoundary formName="Reset Password Form">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate('/auth/login')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </Button>

          <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit"
              >
                <Send className="h-6 w-6 text-primary" />
              </motion.div>
              <CardTitle className="text-2xl font-bold">Restablecer Contraseña</CardTitle>
              <CardDescription>
                Ingresa tu correo electrónico para recibir un enlace de restablecimiento.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm"
                >
                  {error}
                </motion.div>
              )}

              {emailSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-4 bg-green-100 border border-green-200 text-green-800 rounded-md text-center"
                >
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">¡Correo enviado!</p>
                  <p className="text-sm">
                    Hemos enviado un enlace de restablecimiento a tu correo electrónico. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).
                  </p>
                  <Button onClick={() => navigate('/auth/login')} className="mt-4 w-full">
                    Volver al Login
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@ejemplo.com"
                      {...register('email')}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Shield className="h-4 w-4" />
                      Verificación de seguridad
                    </Label>
                    <RecaptchaWrapper
                      ref={recaptchaRef}
                      onChange={(token) => {
                        onRecaptchaChange(token);
                        setValue('recaptcha', token || '');
                      }}
                      onError={() => {
                        setError('Error al cargar reCAPTCHA. Recarga la página e inténtalo de nuevo.');
                      }}
                      onExpired={() => {
                        setError('La verificación reCAPTCHA ha expirado. Por favor, complétala de nuevo.');
                        setValue('recaptcha', '');
                      }}
                      theme="light"
                      size="normal"
                      className="mt-2"
                    />
                    {(errors.recaptcha || recaptchaError) && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.recaptcha?.message || recaptchaError}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || !recaptchaToken}>
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar enlace de restablecimiento
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </FormErrorBoundary>
  );
}