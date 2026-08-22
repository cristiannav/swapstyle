import { Link } from 'react-router';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Field, Input } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import { ApiError } from '@/lib/api-error';

const registerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30)
    .regex(/^[a-z0-9_.]+$/i, 'Solo letras, números, "_" o "."'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Incluí una mayúscula')
    .regex(/[0-9]/, 'Incluí un número'),
  birthdate: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', username: '', email: '', password: '', birthdate: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await registerUser({
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
        birthdate: values.birthdate || undefined,
      });
      navigate('/feed', { replace: true });
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'No pudimos crear la cuenta';
      show(msg, 'danger');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-display text-3xl text-text-primary">Crear cuenta</h1>
        <p className="text-text-secondary text-sm">
          Sumate a SwapStyle y empezá a intercambiar.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Cómo te presentás"
            invalid={!!errors.name}
            {...register('name')}
          />
        </Field>

        <Field label="Usuario" htmlFor="username" error={errors.username?.message}>
          <Input
            id="username"
            autoComplete="username"
            placeholder="tu_usuario"
            invalid={!!errors.username}
            {...register('username')}
          />
        </Field>

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

        <Field
          label="Contraseña"
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

        <Field
          label="Fecha de nacimiento (opcional)"
          htmlFor="birthdate"
          error={errors.birthdate?.message}
        >
          <Input id="birthdate" type="date" {...register('birthdate')} />
        </Field>

        <Button type="submit" loading={submitting} fullWidth size="lg">
          Crear cuenta
        </Button>
      </form>

      <p className="text-sm text-text-secondary text-center">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
