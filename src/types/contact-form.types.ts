import { z } from 'zod'

// Schema de validación con Zod
export const contactFormSchema = z.object({
    name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),

    email: z
        .string()
        .email('Por favor ingresa un email válido')
        .min(1, 'El email es requerido'),

    subject: z
        .string()
        .min(5, 'El asunto debe tener al menos 5 caracteres')
        .max(100, 'El asunto no puede exceder 100 caracteres'),

    message: z
        .string()
        .min(10, 'El mensaje debe tener al menos 10 caracteres')
        .max(1000, 'El mensaje no puede exceder 1000 caracteres'),

    company: z
        .string()
        .max(50, 'El nombre de la empresa no puede exceder 50 caracteres')
        .optional(),

    acceptTerms: z
        .boolean()
        .refine(val => val === true, {
            message: 'Debes aceptar los términos y condiciones para continuar'
        }),
})

// Tipo inferido del schema
export type ContactFormData = z.infer<typeof contactFormSchema>

// Estados del formulario
export type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

// Respuesta del envío
export interface ContactFormResponse {
    success: boolean
    message: string
    timestamp?: string
}

// Props para componentes relacionados
export interface ContactFormProps {
    onSubmit?: (data: ContactFormData) => Promise<ContactFormResponse>
    className?: string
}

export interface ContactInfoDisplayProps {
    showTitle?: boolean
    className?: string
}
