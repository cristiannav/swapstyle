import { Link } from 'react-router';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, CardBody, CardHeader, Field, Input } from '@/components/ui';
import { eventsService } from '@/services/events.service';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/contexts/toast-context';
import { ApiError } from '@/lib/api-error';

// Mirrors backend CreateEventDto: title 3-120, description <=2000 optional,
// maxParticipants 2-500 (default 50), endsAt > startsAt, no past events.
const eventSchema = z
  .object({
    title: z.string().min(3, 'Mínimo 3 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
    startsAt: z.string().min(1, 'Elegí fecha y hora de inicio'),
    endsAt: z.string().min(1, 'Elegí fecha y hora de fin'),
    maxParticipants: z.coerce
      .number()
      .int('Debe ser un número entero')
      .min(2, 'Mínimo 2 participantes')
      .max(500, 'Máximo 500 participantes'),
  })
  .refine((d) => !d.startsAt || new Date(d.startsAt) > new Date(), {
    path: ['startsAt'],
    message: 'El evento no puede empezar en el pasado',
  })
  .refine((d) => !d.startsAt || !d.endsAt || new Date(d.endsAt) > new Date(d.startsAt), {
    path: ['endsAt'],
    message: 'El fin debe ser posterior al inicio',
  });

type FormValues = z.infer<typeof eventSchema>;

export default function NewEventPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { title: '', description: '', startsAt: '', endsAt: '', maxParticipants: 50 },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await eventsService.create({
        title: values.title,
        description: values.description || undefined,
        // datetime-local gives "YYYY-MM-DDTHH:mm" in local time; send unambiguous ISO.
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString(),
        maxParticipants: values.maxParticipants,
      });
      show('Evento creado', 'success');
      // Invalidate the events list so /events shows the new event immediately
      // instead of SWR's cached (possibly empty) data.
      void mutate('/events');
      navigate('/events');
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'No pudimos crear el evento';
      show(msg, 'danger');
      setSubmitting(false);
    }
  };

  // Same gate as the "Crear evento" button on /events: hosting is premium-only.
  if (user && !user.isPremium) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">Crear evento</h1>
        <Card>
          <CardBody className="text-center py-12 space-y-2">
            <p className="font-semibold">Los eventos los organizan hosts premium</p>
            <p className="text-text-secondary text-sm">
              Pasate a premium para organizar tus propios Speed-Swaps.
            </p>
            <Link to="/events" className="inline-block mt-2 text-sm font-semibold text-brand-700 hover:underline">
              Volver a eventos
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Crear evento</h1>
        <p className="text-text-secondary text-sm">
          Organizá una sesión Speed-Swap y definí cuándo y cuántos participan.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Datos del evento</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field label="Título" htmlFor="title" error={errors.title?.message}>
              <Input
                id="title"
                placeholder="Speed-Swap de invierno"
                invalid={!!errors.title}
                {...register('title')}
              />
            </Field>

            <Field label="Descripción (opcional)" htmlFor="description" error={errors.description?.message}>
              <textarea
                id="description"
                rows={4}
                placeholder="Contá de qué va el evento, reglas, temática..."
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                {...register('description')}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Empieza" htmlFor="startsAt" error={errors.startsAt?.message}>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  invalid={!!errors.startsAt}
                  {...register('startsAt')}
                />
              </Field>

              <Field label="Termina" htmlFor="endsAt" error={errors.endsAt?.message}>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  invalid={!!errors.endsAt}
                  {...register('endsAt')}
                />
              </Field>
            </div>

            <Field
              label="Cupo máximo"
              htmlFor="maxParticipants"
              error={errors.maxParticipants?.message}
              hint="Entre 2 y 500 participantes."
            >
              <Input
                id="maxParticipants"
                type="number"
                min={2}
                max={500}
                invalid={!!errors.maxParticipants}
                {...register('maxParticipants')}
              />
            </Field>

            <div className="flex justify-end gap-2">
              <Link to="/events">
                <Button type="button" variant="secondary">Cancelar</Button>
              </Link>
              <Button type="submit" loading={submitting}>Crear evento</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
