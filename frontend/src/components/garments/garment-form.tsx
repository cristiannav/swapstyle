import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { safeImageUrl } from '@/lib/security';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Field, Image, Input } from '@/components/ui';
import type { Garment, GarmentCategory, GarmentCondition } from '@/types/api';

const CATEGORIES: { value: GarmentCategory; label: string }[] = [
  { value: 'top', label: 'Parte superior' },
  { value: 'bottom', label: 'Parte inferior' },
  { value: 'dress', label: 'Vestido' },
  { value: 'outerwear', label: 'Abrigo' },
  { value: 'shoes', label: 'Calzado' },
  { value: 'accessory', label: 'Accesorio' },
  { value: 'bag', label: 'Bolso' },
  { value: 'other', label: 'Otro' },
];

const CONDITIONS: { value: GarmentCondition; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'like_new', label: 'Como nuevo' },
  { value: 'good', label: 'Buen estado' },
  { value: 'fair', label: 'Aceptable' },
];

const garmentSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional().or(z.literal('')),
  category: z.enum(['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory', 'bag', 'other']),
  brand: z.string().max(60).optional().or(z.literal('')),
  size: z.string().max(16).optional().or(z.literal('')),
  color: z.string().max(32).optional().or(z.literal('')),
  condition: z.enum(['new', 'like_new', 'good', 'fair']),
  images: z
    .array(z.object({ url: z.string().url('URL inválida') }))
    .min(1, 'Agregá al menos una foto')
    .max(8, 'Máximo 8 fotos'),
});

export type GarmentFormValues = z.infer<typeof garmentSchema>;

interface GarmentFormProps {
  initial?: Garment;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: GarmentFormValues) => Promise<void> | void;
}

export function GarmentForm({
  initial,
  submitting,
  submitLabel = 'Guardar',
  onSubmit,
}: GarmentFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<GarmentFormValues>({
    resolver: zodResolver(garmentSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'top',
      brand: '',
      size: '',
      color: '',
      condition: 'good',
      images: [{ url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'images' });

  useEffect(() => {
    if (initial) {
      reset({
        title: initial.title,
        description: initial.description ?? '',
        category: initial.category,
        brand: initial.brand ?? '',
        size: initial.size ?? '',
        color: initial.color ?? '',
        condition: initial.condition,
        images: initial.images.map((img) => ({ url: img.url })),
      });
    }
  }, [initial, reset]);

  const images = watch('images');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Field label="Título" htmlFor="title" error={errors.title?.message}>
        <Input id="title" invalid={!!errors.title} {...register('title')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Categoría" htmlFor="category" error={errors.category?.message}>
          <select
            id="category"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            {...register('category')}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Estado" htmlFor="condition" error={errors.condition?.message}>
          <select
            id="condition"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            {...register('condition')}
          >
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Marca" htmlFor="brand" error={errors.brand?.message}>
          <Input id="brand" {...register('brand')} />
        </Field>
        <Field label="Talla" htmlFor="size" error={errors.size?.message}>
          <Input id="size" placeholder="S, M, 38, 42..." {...register('size')} />
        </Field>
        <Field label="Color" htmlFor="color" error={errors.color?.message}>
          <Input id="color" placeholder="Negro, blanco..." {...register('color')} />
        </Field>
      </div>

      <Field label="Descripción" htmlFor="description" error={errors.description?.message}>
        <textarea
          id="description"
          rows={4}
          placeholder="Contá la historia de esta prenda..."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          {...register('description')}
        />
      </Field>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Fotos ({fields.length}/8)</p>
          {fields.length < 8 && (
            <button
              type="button"
              onClick={() => append({ url: '' })}
              className="flex items-center gap-1 text-sm text-brand-500 hover:underline"
            >
              <Plus className="h-4 w-4" /> Agregar
            </button>
          )}
        </div>

        {errors.images?.message && (
          <p className="text-xs text-danger">{errors.images.message as string}</p>
        )}

        <div className="space-y-2">
          {fields.map((field, idx) => {
            const url = images[idx]?.url;
            const valid = !!safeImageUrl(url);
            return (
              <div key={field.id} className="flex items-start gap-2">
                <div className="h-16 w-16 rounded-md bg-surface-muted overflow-hidden shrink-0 border border-border relative">
                  {valid && (
                    <Image
                      src={url}
                      alt={`Foto ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="https://..."
                    invalid={!!errors.images?.[idx]?.url}
                    {...register(`images.${idx}.url`)}
                  />
                  {errors.images?.[idx]?.url && (
                    <p className="text-xs text-danger mt-1">{errors.images[idx]?.url?.message}</p>
                  )}
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="h-10 w-10 rounded-md text-text-muted hover:text-danger hover:bg-red-50 flex items-center justify-center"
                    aria-label="Eliminar foto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
