import { Link, useNavigate, useSearchParams } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Field, Input } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { useToast } from '@/contexts/toast-context';
import { ApiError } from '@/lib/api-error';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Incluí una mayúscula')
      .regex(/[0-9]/, 'Incluí un número'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Las contraseñas no coinciden',
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  });

  const onSubmit = async ({ password }: FormValues) => {
    if (!token) {
      show('Token inválido o expirado', 'danger');
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      show('Contraseña actualizada', 'success');
      navigate('/login', { replace: true });
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'No pudimos actualizar la contraseña';
      show(msg, 'danger');
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-display text-3xl text-text-primary">Enlace inválido</h1>
        <p className="text-text-secondary text-sm">
          El enlace para reestablecer la contraseña no es válido o expiró.
        </p>
        <Link
          to="/forgot-password"
          className="inline-block mt-4 text-sm font-semibold text-brand-700 hover:underline"
        >
          Pedir un enlace nuevo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-display text-3xl text-text-primary">Nueva contraseña</h1>
        <p className="text-text-secondary text-sm">
          Elegí una contraseña nueva para tu cuenta.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field
          label="Nueva contraseña"
          htmlFor="password"
          error={errors.password?.message}
          hint="Mínimo 8 caracteres, una mayúscula y un número."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            invalid={!!errors.password}
            {...register('password')}
          />
        </Field>

        <Field label="Repetir contraseña" htmlFor="confirm" error={errors.confirm?.message}>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            invalid={!!errors.confirm}
            {...register('confirm')}
          />
        </Field>

        <Button type="submit" loading={submitting} fullWidth size="lg">
          Guardar contraseña
        </Button>
      </form>
    </div>
  );
}
