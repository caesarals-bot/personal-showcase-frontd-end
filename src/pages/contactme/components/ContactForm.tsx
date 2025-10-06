import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  contactFormSchema,
  type ContactFormData,
  type ContactFormProps,
  type FormStatus,
  type ContactFormResponse,
} from '@/types/contact-form.types'

export default function ContactForm({ onSubmit, className }: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [response, setResponse] = useState<ContactFormResponse | null>(null)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      company: '',
      acceptTerms: false,
    },
  })

  const handleSubmit = async (data: ContactFormData) => {
    setStatus('submitting')
    setResponse(null)

    try {
      // Si se proporciona una función onSubmit personalizada, la usamos
      const result = onSubmit 
        ? await onSubmit(data)
        : await simulateEmailSend(data)

      setResponse(result)
      setStatus(result.success ? 'success' : 'error')

      if (result.success) {
        form.reset()
      }
    } catch (error) {
      setResponse({
        success: false,
        message: 'Error inesperado. Por favor intenta nuevamente.',
      })
      setStatus('error')
    }
  }

  // Simulación de envío de email (reemplazar con implementación real)
  const simulateEmailSend = async (_data: ContactFormData): Promise<ContactFormResponse> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simular éxito/error aleatorio para demo
    const success = Math.random() > 0.2 // 80% de éxito

    return {
      success,
      message: success 
        ? '¡Mensaje enviado correctamente! Te responderé pronto.'
        : 'Error al enviar el mensaje. Por favor intenta nuevamente.',
      timestamp: new Date().toISOString(),
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'submitting':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Send className="h-4 w-4" />
    }
  }

  const getButtonText = () => {
    switch (status) {
      case 'submitting':
        return 'Enviando...'
      case 'success':
        return 'Enviado'
      case 'error':
        return 'Re intentar'
      default:
        return 'Enviar Mensaje'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Nombre y Email en una fila */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tu nombre completo"
                      {...field}
                      disabled={status === 'submitting'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      {...field}
                      disabled={status === 'submitting'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Empresa (opcional) */}
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre de tu empresa"
                    {...field}
                    disabled={status === 'submitting'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Asunto */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asunto *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="¿De qué quieres hablar?"
                    {...field}
                    disabled={status === 'submitting'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mensaje */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensaje *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Cuéntame sobre tu proyecto, idea o cualquier cosa en la que pueda ayudarte..."
                    className="min-h-[120px] resize-none"
                    {...field}
                    disabled={status === 'submitting'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Términos y condiciones */}
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={status === 'submitting'}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    Acepto los{' '}
                    <button
                      type="button"
                      className="text-primary underline hover:no-underline"
                      onClick={() => {
                        // Aquí podrías abrir un modal o navegar a una página de términos
                        console.log('Abrir términos y condiciones')
                      }}
                    >
                      términos y condiciones
                    </button>{' '}
                    y{' '}
                    <button
                      type="button"
                      className="text-primary underline hover:no-underline"
                      onClick={() => {
                        // Aquí podrías abrir un modal o navegar a una página de privacidad
                        console.log('Abrir política de privacidad')
                      }}
                    >
                      política de privacidad
                    </button>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Mensaje de respuesta */}
          {response && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-lg border p-4 ${
                response.success
                  ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                  : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {response.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <p className="text-sm font-medium">{response.message}</p>
              </div>
            </motion.div>
          )}

          {/* Botón de envío */}
          <Button
            type="submit"
            size="lg"
            disabled={status === 'submitting' || status === 'success'}
            className="w-full"
          >
            {getStatusIcon()}
            {getButtonText()}
          </Button>
        </form>
      </Form>
    </motion.div>
  )
}
