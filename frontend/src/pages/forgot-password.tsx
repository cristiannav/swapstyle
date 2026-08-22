import { Link } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Field, Input } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { useToast } from '@/contexts/toast-context';
import { ApiError } from '@/lib/api-error';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: FormValues) => {
    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'No pudimos enviar el email';
      show(msg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-display text-3xl text-text-primary">Revisá tu casilla</h1>
        <p className="text-text-secondary text-sm">
          Si el email existe, te enviamos un enlace para reestablecer tu contraseña.
        </p>
        <Link
          to="/login"
          className="inline-block mt-4 text-sm font-semibold text-brand-700 hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-display text-3xl text-text-primary">Recuperar contraseña</h1>
        <p className="text-text-secondary text-sm">
          Ingresá tu email y te mandamos un enlace para reestablecerla.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vos@ejemplo.com"
            invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Button type="submit" loading={submitting} fullWidth size="lg">
          Enviar enlace
        </Button>
      </form>

      <p className="text-sm text-text-secondary text-center">
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
