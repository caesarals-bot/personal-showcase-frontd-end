import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RecaptchaWrapper } from '@/components/RecaptchaWrapper'
import { useRecaptcha } from '@/hooks/useRecaptcha'
import { bookingVisitorSchema, type BookingVisitor } from '@/types/booking.types'
import { formatSlotTime } from '@/lib/bookingDates'

interface BookingFormProps {
  isoStart: string
  onSubmit: (data: BookingVisitor, recaptchaToken: string) => Promise<void>
  submitting?: boolean
  error?: string | null
}

export function BookingForm({
  isoStart,
  onSubmit,
  submitting = false,
  error = null,
}: BookingFormProps) {
  const { recaptchaRef, recaptchaToken, recaptchaError, resetRecaptcha, onRecaptchaChange } =
    useRecaptcha()

  const form = useForm<BookingVisitor>({
    resolver: zodResolver(bookingVisitorSchema) as Resolver<BookingVisitor>,
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  })

  const handleSubmit = async (visitor: BookingVisitor) => {
    if (!recaptchaToken) {
      form.setError('root', { message: 'Completa la verificación de seguridad.' })
      return
    }
    try {
      await onSubmit(visitor, recaptchaToken)
    } catch {
      resetRecaptcha()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-editorial-line pt-6"
    >
      <div className="mb-4">
        <h3 className="font-editorial text-lg font-bold text-editorial-ink">
          Reservar {formatSlotTime(isoStart)}
        </h3>
        <p className="text-xs text-editorial-ink-muted">
          Te enviaremos la invitación a tu correo.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-widest text-editorial-ink-muted">
                  Nombre completo *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tu nombre"
                    {...field}
                    disabled={submitting}
                    className="border-editorial-line bg-white/60 text-editorial-ink focus-visible:ring-editorial-teal"
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
                <FormLabel className="text-xs font-semibold uppercase tracking-widest text-editorial-ink-muted">
                  Correo electrónico *
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    {...field}
                    disabled={submitting}
                    className="border-editorial-line bg-white/60 text-editorial-ink focus-visible:ring-editorial-teal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-widest text-editorial-ink-muted">
                  ¿De qué te gustaría hablar? <span className="normal-case">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Cuéntame brevemente el contexto"
                    className="min-h-[80px] resize-none border-editorial-line bg-white/60 text-editorial-ink focus-visible:ring-editorial-teal"
                    {...field}
                    disabled={submitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <RecaptchaWrapper
              ref={recaptchaRef}
              onChange={(token) => onRecaptchaChange(token)}
              onError={() => {
                onRecaptchaChange(null)
              }}
            />
            {(recaptchaError || form.formState.errors.root) && (
              <div className="mt-2 flex items-center gap-2 text-xs text-red-700">
                <Shield className="size-3.5" />
                <span>{recaptchaError || form.formState.errors.root?.message}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !recaptchaToken}
            className="w-full bg-editorial-teal text-white hover:bg-editorial-teal-deep"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Reservando…
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Confirmar reunión
              </>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  )
}
