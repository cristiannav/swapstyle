import { Link } from 'react-router';
import useSWR from 'swr';
import { formatDistanceToNow } from '@/lib/format';
import { Avatar, Card, CardBody, Image } from '@/components/ui';
import { matchesService } from '@/services/matches.service';
import { useUser } from '@/contexts/user-context';
import type { Match } from '@/types/api';

export default function MatchesPage() {
  const { user } = useUser();
  const { data, isLoading } = useSWR<Match[]>('/matches', () => matchesService.list());

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Matches</h1>
        <p className="text-text-secondary text-sm">
          Tus matches activos. Iniciá una conversación para coordinar el intercambio.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16 space-y-2">
            <p className="font-semibold">Aún no tenés matches</p>
            <p className="text-text-secondary text-sm">Andá al feed y empezá a swipear.</p>
          </CardBody>
        </Card>
      ) : (
        <ul className="space-y-2">
          {data.map((match) => {
            const myId = user?.id;
            const iAmA = match.userA.id === myId;
            const peer = iAmA ? match.userB : match.userA;
            const myGarment = iAmA ? match.garmentA : match.garmentB;
            const peerGarment = iAmA ? match.garmentB : match.garmentA;
            const peerImg = peerGarment.images?.[0]?.url;
            return (
              <li key={match.id}>
                <Link
                  to={`/matches/${match.id}/chat`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-brand-300 hover:shadow-card transition"
                >
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-surface-muted shrink-0">
                    {peerImg && (
                      <Image src={peerImg} alt={peerGarment.title} fill className="object-cover" />
                    )}
                  </div>
                  {/* En un teléfono angosto no entran miniatura + avatar + dos
                      líneas de texto: el nombre quedaba en "Isa...". */}
                  <span className="hidden xs:block">
                    <Avatar src={peer.avatarUrl} alt={peer.name} size="md" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold truncate">{peer.name}</p>
                      <span className="ml-auto shrink-0 text-xs text-text-muted">
                        {formatDistanceToNow(match.lastMessageAt ?? match.createdAt)}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm truncate">
                      Querés su <span className="text-text-primary">{peerGarment.title}</span>
                      {' · '}
                      Quiere tu <span className="text-text-primary">{myGarment.title}</span>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
