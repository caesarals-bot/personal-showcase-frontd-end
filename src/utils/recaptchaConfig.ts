// Configuración optimizada para reCAPTCHA
export const RECAPTCHA_CONFIG = {
  // Clave del sitio (debe estar en variables de entorno)
  siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  
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