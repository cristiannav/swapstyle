import { Link } from 'react-router';
import useSWR from 'swr';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Avatar, Badge, Button, Card, CardBody, Image } from '@/components/ui';
import { garmentsService } from '@/services/garments.service';
import { useToast } from '@/contexts/toast-context';
import { ApiError } from '@/lib/api-error';
import type { Garment } from '@/types/api';

export default function MyGarmentsPage() {
  const { data, isLoading, mutate } = useSWR<Garment[]>('/garments/me', () => garmentsService.mine());
  const { show } = useToast();

  const onDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta prenda?')) return;
    try {
      await garmentsService.remove(id);
      mutate((prev) => prev?.filter((g) => g.id !== id), { revalidate: false });
      show('Prenda eliminada', 'success');
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Error al eliminar';
      show(msg, 'danger');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mis prendas</h1>
          <p className="text-text-secondary text-sm">
            Cuantas más cargues, más matches vas a tener.
          </p>
        </div>
        <Link to="/garments/new">
          <Button>
            <Plus className="h-4 w-4" /> Nueva prenda
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-surface-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16 space-y-3">
            <p className="text-text-secondary">Aún no cargaste ninguna prenda.</p>
            <Link to="/garments/new">
              <Button>Cargar mi primera prenda</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((g) => (
            <article
              key={g.id}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-muted shadow-card"
            >
              {g.images[0] ? (
                <Image
                  src={g.images[0].url}
                  alt={g.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand-100 to-accent-500/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="font-semibold text-sm truncate">{g.title}</p>
                <div className="flex gap-1 mt-1">
                  <Badge tone="neutral" className="bg-white/20 text-white text-[10px]">
                    {g.status}
                  </Badge>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/garments/${g.id}/edit`}
                  className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-text-primary hover:bg-white"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => onDelete(g.id)}
                  className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-danger hover:bg-white"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
