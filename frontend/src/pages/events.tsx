import { Link } from 'react-router';
import useSWR from 'swr';
import { Calendar, Users } from 'lucide-react';
import { Avatar, Badge, Button, Card, CardBody, CardFooter, CardHeader } from '@/components/ui';
import { eventsService, type SwapEvent } from '@/services/events.service';
import { useUser } from '@/contexts/user-context';

export default function EventsPage() {
  const { user } = useUser();
  const { data, isLoading } = useSWR<SwapEvent[]>('/events', () => eventsService.list());

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Eventos Speed-Swap</h1>
          <p className="text-text-secondary text-sm">
            Sumate a sesiones cortas donde matcheás más rápido.
          </p>
        </div>
        {user?.isPremium && (
          <Link to="/events/new">
            <Button>Crear evento</Button>
          </Link>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16 space-y-2">
            <p className="font-semibold">Aún no hay eventos programados</p>
            <p className="text-text-secondary text-sm">
              Volvé pronto, los hosts premium organizan eventos cada semana.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((event) => (
            <EventCard key={event.id} event={event} currentUserId={user?.id ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, currentUserId }: { event: SwapEvent; currentUserId: string | null }) {
  const { mutate } = useSWR<SwapEvent[]>('/events');
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const formatter = new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const joined = !!event.participants?.some((p) => p.userId === currentUserId);
  const seats = event.maxParticipants - (event.participants?.length ?? 0);

  const handleToggleJoin = async () => {
    if (joined) await eventsService.leave(event.id);
    else await eventsService.join(event.id);
    void mutate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-lg">{event.title}</h2>
            <p className="text-text-muted text-xs flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatter.format(start)} → {formatter.format(end)}
            </p>
          </div>
          <Badge tone={joined ? 'success' : 'neutral'}>{joined ? 'Inscripto' : event.status}</Badge>
        </div>
      </CardHeader>
      <CardBody>
        {event.description && (
          <p className="text-sm text-text-secondary mb-3">{event.description}</p>
        )}
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          {event.host && (
            <div className="flex items-center gap-2">
              <Avatar src={event.host.avatarUrl} alt={event.host.name} size="xs" />
              <span>Host: <strong className="text-text-primary">{event.host.name}</strong></span>
            </div>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> {event.participants?.length ?? 0}/{event.maxParticipants}
          </span>
        </div>
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        {seats <= 0 && !joined ? (
          <Badge tone="warning">Cupo completo</Badge>
        ) : (
          <Button variant={joined ? 'secondary' : 'primary'} onClick={handleToggleJoin}>
            {joined ? 'Salir' : 'Sumarme'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
