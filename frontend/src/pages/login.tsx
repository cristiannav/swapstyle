import { Link, useNavigate, useSearchParams } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Field, Input } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import { ApiError } from '@/lib/api-error';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login(values);
      const redirect = params.get('redirect') || '/feed';
      navigate(redirect, { replace: true });
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'No pudimos iniciar sesión';
      show(msg, 'danger');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-display text-3xl text-text-primary">Iniciar sesión</h1>
        <p className="text-text-secondary text-sm">
          Bienvenida/o de vuelta. Ingresá tus datos para continuar.
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

        <Field label="Contraseña" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            invalid={!!errors.password}
            {...register('password')}
          />
        </Field>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-brand-700 hover:underline">
            Olvidé mi contraseña
          </Link>
        </div>

        <Button type="submit" loading={submitting} fullWidth size="lg">
          Iniciar sesión
        </Button>
      </form>

      <p className="text-sm text-text-secondary text-center">
        ¿Aún no tenés cuenta?{' '}
        <Link to="/register" className="font-semibold text-brand-700 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
