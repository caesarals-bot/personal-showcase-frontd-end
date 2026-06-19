const ADMIN_EMAIL_RAW = import.meta.env.VITE_ADMIN_EMAIL?.trim() ?? '';

export const ADMIN_EMAIL = ADMIN_EMAIL_RAW;

export const ADMIN_CONTACT_MESSAGE = ADMIN_EMAIL
  ? `Contacta al administrador en ${ADMIN_EMAIL}`
  : 'Contacta al administrador del sitio para más información';
