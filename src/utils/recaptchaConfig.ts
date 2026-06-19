// Configuración optimizada para reCAPTCHA
const RECAPTCHA_SITE_KEY_RAW = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const IS_DEV = import.meta.env.DEV;

// En producción, la clave es obligatoria para evitar el uso de la clave de prueba de Google,
// que es pública y permite a cualquier bot pasar la verificación.
if (!RECAPTCHA_SITE_KEY_RAW && !IS_DEV) {
  throw new Error(
    '[SECURITY] VITE_RECAPTCHA_SITE_KEY no está definida. ' +
    'Configúrala en .env.production antes de compilar.'
  );
}

const RECAPTCHA_TEST_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export const RECAPTCHA_SITE_KEY = RECAPTCHA_SITE_KEY_RAW || RECAPTCHA_TEST_KEY;

export const RECAPTCHA_CONFIG = {
  // Clave del sitio (validada en producción arriba)
  siteKey: RECAPTCHA_SITE_KEY,

  // Configuración de rendimiento
  performance: {
    // Timeout para evitar bloqueos largos
    timeout: 10000,

    // Retraso antes de cargar reCAPTCHA (lazy loading)
    loadDelay: 100,

    // Configuración para reducir advertencias de longtask
    asyncLoad: true,

    // Configuración de observador de rendimiento
    observePerformance: false, // Desactivar para reducir advertencias
  },

  // Configuración de UI
  ui: {
    theme: 'light' as const,
    size: 'normal' as const,
    language: 'es',
  },

  // Configuración de errores
  errors: {
    timeout: 'reCAPTCHA tardó demasiado en responder. Inténtalo de nuevo.',
    network: 'Error de red al validar reCAPTCHA. Verifica tu conexión.',
    generic: 'Error al validar reCAPTCHA. Inténtalo de nuevo.',
    unavailable: 'reCAPTCHA no está disponible en este momento.',
    expired: 'La verificación reCAPTCHA ha expirado. Por favor, inténtalo de nuevo.',
  }
};

// Función para suprimir advertencias específicas de reCAPTCHA
export const suppressRecaptchaWarnings = () => {
  // Suprimir advertencias de longtask específicas de reCAPTCHA
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Filtrar advertencias específicas de reCAPTCHA
    if (
      message.includes('longtask') ||
      message.includes('entryTypes') ||
      message.includes('recaptcha__es.js')
    ) {
      return; // No mostrar estas advertencias
    }
    
    originalWarn.apply(console, args);
  };
};

// Función para optimizar la carga de reCAPTCHA
export const optimizeRecaptchaLoad = (): void => {
  // Precargar el script de reCAPTCHA de forma asíncrona
  if (typeof window !== 'undefined' && !window.grecaptcha) {
    const script: HTMLScriptElement = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?hl=${RECAPTCHA_CONFIG.ui.language}`;
    script.async = true;
    script.defer = true;
    
    // Agregar al head para carga temprana
    document.head.appendChild(script);
  }
};