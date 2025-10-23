import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resendEmailVerification, reloadUserInfo } from '@/services/authService';

interface EmailVerificationBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  userEmail?: string;
}

export function EmailVerificationBanner({ 
  isVisible, 
  onDismiss, 
  userEmail 
}: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      setResendError(null);
      await resendEmailVerification();
      setResendSuccess(true);
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (error) {
      setResendError(error instanceof Error ? error.message : 'Error al reenviar email');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setIsReloading(true);
      await reloadUserInfo();
      // Recargar la página para actualizar el estado
      window.location.reload();
    } catch (error) {
      console.error('Error al verificar estado:', error);
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-2xl"
        >
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
                  <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                      Verifica tu correo electrónico
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDismiss}
                      className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800 dark:text-amber-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    Hemos enviado un enlace de verificación a{' '}
                    <span className="font-medium">{userEmail}</span>.
                    Por favor, revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
                  </p>

                  {resendSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 mb-3 p-2 bg-green-100 dark:bg-green-900/30 rounded-md"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Email de verificación reenviado exitosamente
                      </span>
                    </motion.div>
                  )}

                  {resendError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 mb-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-md"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        {resendError}
                      </span>
                    </motion.div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendEmail}
                      disabled={isResending || resendSuccess}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Reenviando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reenviar email
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCheckVerification}
                      disabled={isReloading}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
                    >
                      {isReloading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ya verifiqué
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}