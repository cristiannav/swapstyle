import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import useSWR from 'swr';
import { Card, CardBody, CardHeader, Spinner } from '@/components/ui';
import { GarmentForm, type GarmentFormValues } from '@/components/garments/garment-form';
import { garmentsService } from '@/services/garments.service';
import { useToast } from '@/contexts/toast-context';
import { ApiError } from '@/lib/api-error';
import type { Garment } from '@/types/api';

export default function EditGarmentPage() {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { data, isLoading } = useSWR<Garment>(`/garments/${id}`, () => garmentsService.one(id));

  const onSubmit = async (values: GarmentFormValues) => {
    setSubmitting(true);
    try {
      await garmentsService.update(id, {
        title: values.title,
        description: values.description || undefined,
        category: values.category,
        brand: values.brand || undefined,
        size: values.size || undefined,
        color: values.color || undefined,
        condition: values.condition,
      });
      show('Prenda actualizada', 'success');
      navigate('/garments/me');
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Error al actualizar';
      show(msg, 'danger');
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Editar prenda</h1>
      </header>
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Datos de la prenda</h2>
        </CardHeader>
        <CardBody>
          <GarmentForm
            initial={data}
            submitting={submitting}
            submitLabel="Guardar cambios"
            onSubmit={onSubmit}
          />
        </CardBody>
      </Card>
    </div>
  );
}
