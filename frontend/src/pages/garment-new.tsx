import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { GarmentForm, type GarmentFormValues } from '@/components/garments/garment-form';
import { garmentsService } from '@/services/garments.service';
import { useToast } from '@/contexts/toast-context';
import { ApiError } from '@/lib/api-error';

export default function NewGarmentPage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: GarmentFormValues) => {
    setSubmitting(true);
    try {
      await garmentsService.create({
        title: values.title,
        description: values.description || undefined,
        category: values.category,
        brand: values.brand || undefined,
        size: values.size || undefined,
        color: values.color || undefined,
        condition: values.condition,
        imageUrls: values.images.map((i) => i.url),
      });
      show('Prenda creada', 'success');
      navigate('/garments/me');
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Error al crear';
      show(msg, 'danger');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Nueva prenda</h1>
        <p className="text-text-secondary text-sm">
          Subí fotos de la prenda y completá los datos para empezar a recibir likes.
        </p>
      </header>
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Datos de la prenda</h2>
        </CardHeader>
        <CardBody>
          <GarmentForm submitting={submitting} submitLabel="Publicar" onSubmit={onSubmit} />
        </CardBody>
      </Card>
    </div>
  );
}
