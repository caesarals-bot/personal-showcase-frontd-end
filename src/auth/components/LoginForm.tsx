import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router';
import { loginUser, loginWithGoogle, isEmailVerified } from '@/services/authService';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, LogIn, Shield } from 'lucide-react';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { RecaptchaWrapper } from '@/components/RecaptchaWrapper';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormErrorBoundary } from '@/components/error-boundary';

// Esquema de validación
const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  rememberMe: z.boolean().optional(),
  recaptcha: z.string().min(1, 'Por favor, completa la verificación reCAPTCHA')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener la URL de origen (de donde vino el usuario)
  const from = (location.state as any)?.from?.pathname || '/';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
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

  const [loginSuccess, setLoginSuccess] = useState(false);

  // Prevenir navegación hacia atrás SOLO después de login exitoso
  useEffect(() => {
    if (!loginSuccess) return;

    const preventBack = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', preventBack);
    preventBack();

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, [loginSuccess]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar que reCAPTCHA esté completado
      if (!recaptchaToken) {
        setError('Por favor, completa la verificación reCAPTCHA');
        setIsLoading(false);
        return;
      }

      await loginUser(data.email, data.password);
      
      // Verificar si el email está verificado
      const emailVerified = await isEmailVerified();
      if (!emailVerified) {
        setError('Tu email no está verificado. Por favor, revisa tu bandeja de entrada y verifica tu email antes de continuar.');
        setIsLoading(false);
        return;
      }
      
      setLoginSuccess(true);
      // Redirigir a la página de origen o al home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      resetRecaptcha(); // Resetear reCAPTCHA en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar que reCAPTCHA esté completado
      if (!recaptchaToken) {
        setError('Por favor, completa la verificación reCAPTCHA antes de continuar');
        setIsLoading(false);
        return;
      }

      await loginWithGoogle();
      
      // Verificar si el email está verificado (Google suele verificar automáticamente)
      const emailVerified = await isEmailVerified();
      if (!emailVerified) {
        setError('Tu email no está verificado. Por favor, revisa tu bandeja de entrada y verifica tu email antes de continuar.');
        setIsLoading(false);
        return;
      }
      
      setLoginSuccess(true);
      // Redirigir a la página de origen o al home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión con Google');
      resetRecaptcha(); // Resetear reCAPTCHA en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormErrorBoundary formName="Login Form">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
        {/* Botón volver al blog */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate('/blog')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Blog
        </Button>

        <Card className="border-border/50 bg-background/60 backdrop-blur-sm">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit"
            >
              <LogIn className="h-6 w-6 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Contraseña
                  </Label>
                  <Link
                    to="/auth/reset-password"
                    className="text-xs text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" {...register('rememberMe')} />
                <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                  Recordarme
                </Label>
              </div>

              {/* reCAPTCHA */}
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
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            {/* Separador */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            {/* Botón de Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>

            <div className="text-center text-sm mt-6">
              <p className="text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <Link to="/auth/register" className="text-primary hover:underline font-medium">
                  Regístrate
                </Link>
              </p>
            </div>
          </CardContent>
          </Card>
        </motion.div>
      </div>
    </FormErrorBoundary>
  );
}