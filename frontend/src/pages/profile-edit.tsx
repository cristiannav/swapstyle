import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
} from '@/components/ui';
import { usersService } from '@/services/users.service';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/contexts/toast-context';
import { ApiError } from '@/lib/api-error';

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(500).optional().or(z.literal('')),
  avatarUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  city: z.string().max(80).optional().or(z.literal('')),
  country: z.string().max(80).optional().or(z.literal('')),
  birthdate: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof profileSchema>;

export default function ProfileEditPage() {
  const { user, refresh } = useUser();
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
      avatarUrl: '',
      city: '',
      country: '',
      birthdate: '',
      gender: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        bio: user.bio ?? '',
        avatarUrl: user.avatarUrl ?? '',
        city: user.city ?? '',
        country: user.country ?? '',
        birthdate: user.birthdate ?? '',
        gender: user.gender ?? '',
      });
    }
  }, [user, reset]);

  const previewAvatar = watch('avatarUrl') || user?.avatarUrl;
  const previewName = watch('name') || user?.name || 'Tu nombre';

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await usersService.updateMe({
        name: values.name,
        bio: values.bio || undefined,
        avatarUrl: values.avatarUrl || undefined,
        city: values.city || undefined,
        country: values.country || undefined,
        birthdate: values.birthdate || undefined,
        gender: values.gender || undefined,
      });
      await refresh();
      show('Perfil actualizado', 'success');
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'No pudimos actualizar';
      show(msg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold">Editar perfil</h1>
        <p className="text-text-secondary text-sm">
          Actualizá tu información pública. Los demás usuarios la verán en tus prendas y matches.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar src={previewAvatar ?? undefined} alt={previewName} size="lg" />
            <div>
              <p className="font-semibold">{previewName}</p>
              <p className="text-text-muted text-sm">@{user?.username}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
              <Input id="name" invalid={!!errors.name} {...register('name')} />
            </Field>

            <Field label="URL del avatar" htmlFor="avatarUrl" error={errors.avatarUrl?.message}>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://..."
                invalid={!!errors.avatarUrl}
                {...register('avatarUrl')}
              />
            </Field>

            <Field label="Bio" htmlFor="bio" error={errors.bio?.message}>
              <textarea
                id="bio"
                rows={4}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-base sm:text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="Contá un poco sobre vos y tu estilo..."
                {...register('bio')}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ciudad" htmlFor="city" error={errors.city?.message}>
                <Input id="city" invalid={!!errors.city} {...register('city')} />
              </Field>
              <Field label="País" htmlFor="country" error={errors.country?.message}>
                <Input id="country" invalid={!!errors.country} {...register('country')} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Fecha de nacimiento" htmlFor="birthdate" error={errors.birthdate?.message}>
                <Input id="birthdate" type="date" {...register('birthdate')} />
              </Field>
              <Field label="Género" htmlFor="gender" error={errors.gender?.message}>
                <select
                  id="gender"
                  className="h-11 w-full rounded-md border border-border bg-surface px-3 text-base sm:text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  {...register('gender')}
                >
                  <option value="">—</option>
                  <option value="female">Femenino</option>
                  <option value="male">Masculino</option>
                  <option value="non_binary">No binarie</option>
                  <option value="other">Otro</option>
                  <option value="prefer_not_to_say">Prefiero no decirlo</option>
                </select>
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" loading={submitting} disabled={!isDirty}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
