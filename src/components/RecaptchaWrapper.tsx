import { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { motion } from 'framer-motion';

interface RecaptchaWrapperProps {
  onChange: (token: string | null) => void;
  onError?: () => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  className?: string;
}

// Clave pública de reCAPTCHA (debe estar en variables de entorno)
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Clave de prueba

export const RecaptchaWrapper = forwardRef<ReCAPTCHA, RecaptchaWrapperProps>(
  ({ onChange, onError, onExpired, theme = 'light', size = 'normal', className = '' }, ref) => {
    const handleError = () => {
      console.error('Error en reCAPTCHA');
      onError?.();
    };

    const handleExpired = () => {
      console.warn('reCAPTCHA expirado');
      onExpired?.();
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex justify-center ${className}`}
      >
        <ReCAPTCHA
          ref={ref}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={onChange}
          onError={handleError}
          onExpired={handleExpired}
          theme={theme}
          size={size}
          hl="es" // Idioma español
        />
      </motion.div>
    );
  }
);

RecaptchaWrapper.displayName = 'RecaptchaWrapper';