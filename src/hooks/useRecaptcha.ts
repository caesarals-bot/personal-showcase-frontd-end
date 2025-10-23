import { useRef, useCallback, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface UseRecaptchaReturn {
  recaptchaRef: React.RefObject<ReCAPTCHA | null>;
  recaptchaToken: string | null;
  isRecaptchaLoading: boolean;
  recaptchaError: string | null;
  executeRecaptcha: () => Promise<string | null>;
  resetRecaptcha: () => void;
  onRecaptchaChange: (token: string | null) => void;
}

export const useRecaptcha = (): UseRecaptchaReturn => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isRecaptchaLoading, setIsRecaptchaLoading] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);

  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    if (!recaptchaRef.current) {
      setRecaptchaError('reCAPTCHA no está disponible');
      return null;
    }

    try {
      setIsRecaptchaLoading(true);
      setRecaptchaError(null);
      
      const token = await recaptchaRef.current.executeAsync();
      
      if (!token) {
        setRecaptchaError('No se pudo obtener el token de reCAPTCHA');
        return null;
      }

      setRecaptchaToken(token);
      return token;
    } catch (error) {
      setRecaptchaError('Error al validar reCAPTCHA. Inténtalo de nuevo.');
      return null;
    } finally {
      setIsRecaptchaLoading(false);
    }
  }, []);

  const resetRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setRecaptchaToken(null);
    setRecaptchaError(null);
    setIsRecaptchaLoading(false);
  }, []);

  const onRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token);
    setRecaptchaError(null);
    
    if (!token) {
      setRecaptchaError('Por favor, completa la verificación reCAPTCHA');
    }
  }, []);

  return {
    recaptchaRef,
    recaptchaToken,
    isRecaptchaLoading,
    recaptchaError,
    executeRecaptcha,
    resetRecaptcha,
    onRecaptchaChange
  };
};