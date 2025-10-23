// Declaraciones de tipos para Google reCAPTCHA

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options?: { action: string }) => Promise<string>;
      render: (container: string | HTMLElement, parameters: any) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
  }
}

// Tipos para el componente react-google-recaptcha
export interface ReCAPTCHAInstance {
  executeAsync: () => Promise<string>;
  reset: () => void;
  getValue: () => string | null;
}

export interface ReCAPTCHAProps {
  sitekey: string;
  onChange?: (token: string | null) => void;
  onError?: () => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal' | 'invisible';
  tabindex?: number;
  hl?: string;
  badge?: 'bottomright' | 'bottomleft' | 'inline';
  asyncScriptOnLoad?: () => void;
}

export {};