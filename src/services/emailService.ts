/**
 * Email Service - Envío de emails usando EmailJS
 * 
 * CONFIGURACIÓN:
 * 1. Crea una cuenta en https://www.emailjs.com/
 * 2. Crea un servicio de email (Gmail, Outlook, etc.)
 * 3. Crea una plantilla de email
 * 4. Copia tus credenciales y agrégalas al archivo .env.local:
 *    VITE_EMAILJS_SERVICE_ID=tu_service_id
 *    VITE_EMAILJS_TEMPLATE_ID=tu_template_id
 *    VITE_EMAILJS_PUBLIC_KEY=tu_public_key
 */

import emailjs from '@emailjs/browser';
import type { ContactFormData, ContactFormResponse } from '@/types/contact-form.types';

// Configuración de EmailJS desde variables de entorno
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Flag para verificar si EmailJS está configurado
const isEmailJSConfigured = !!(
  EMAILJS_SERVICE_ID && 
  EMAILJS_TEMPLATE_ID && 
  EMAILJS_PUBLIC_KEY
);

/**
 * Enviar email usando EmailJS
 */
export async function sendContactEmail(data: ContactFormData): Promise<ContactFormResponse> {
  // Si EmailJS no está configurado, simular envío
  if (!isEmailJSConfigured) {
    console.warn('⚠️ EmailJS no está configurado. Usando modo simulación.');
    console.log('📧 Datos del formulario:', data);
    
    return simulateEmailSend(data);
  }

  try {
    // Preparar los datos para la plantilla de EmailJS
    const templateParams = {
      from_name: data.name,
      from_email: data.email,
      subject: data.subject,
      message: data.message,
      company: data.company || 'No especificada',
      to_email: 'proyectosenevolución@gmail.com',
    };

    // Enviar email usando EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Email enviado exitosamente:', response);

    return {
      success: true,
      message: '¡Mensaje enviado correctamente! Te responderé pronto.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);

    return {
      success: false,
      message: 'Error al enviar el mensaje. Por favor intenta nuevamente o contáctame directamente.',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Simulación de envío de email (para desarrollo/testing)
 */
async function simulateEmailSend(_data: ContactFormData): Promise<ContactFormResponse> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simular éxito (siempre exitoso en modo simulación)
  return {
    success: true,
    message: '✅ [MODO SIMULACIÓN] Mensaje recibido. Configura EmailJS para envíos reales.',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Verificar si EmailJS está configurado
 */
export function isEmailServiceConfigured(): boolean {
  return isEmailJSConfigured;
}

/**
 * Obtener estado de la configuración
 */
export function getEmailServiceStatus() {
  return {
    configured: isEmailJSConfigured,
    serviceId: EMAILJS_SERVICE_ID ? '✓ Configurado' : '✗ Falta',
    templateId: EMAILJS_TEMPLATE_ID ? '✓ Configurado' : '✗ Falta',
    publicKey: EMAILJS_PUBLIC_KEY ? '✓ Configurado' : '✗ Falta',
  };
}
