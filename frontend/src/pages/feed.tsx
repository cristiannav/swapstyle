import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { SwipeCard, SwipeActions } from "@/components/feed/swipe-card";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { MatchModal } from "@/components/feed/match-modal";
import { FiltersPanel } from "@/components/feed/filters-panel";
import { garmentsService, type FeedQuery } from "@/services/garments.service";
import { swipesService } from "@/services/swipes.service";
import { useFilters } from "@/contexts/filters-context";
import { useToast } from "@/contexts/toast-context";
import { useUser } from "@/contexts/user-context";
import { ApiError } from "@/lib/api-error";
import type { Garment, Match, SwipeAction } from "@/types/api";

const PREFETCH_THRESHOLD = 3;

export default function FeedPage() {
  const { filters } = useFilters();
  const { show } = useToast();
  const { refresh: refreshUser } = useUser();
  const [stack, setStack] = useState<Garment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<Match | null>(null);
  const [busy, setBusy] = useState(false);
  const fetchingRef = useRef(false);

  const loadMore = useCallback(
    async (reset = false) => {
      if (fetchingRef.current) return;
      if (!reset && !hasMore) return;
      fetchingRef.current = true;
      if (reset) setLoading(true);
      try {
        const query: FeedQuery = {
          cursor: reset ? undefined : (cursor ?? undefined),
          category: filters.categories.length ? filters.categories : undefined,
          size: filters.size,
          city: filters.city,
        };
        const res = await garmentsService.feed(query);
        setStack((prev) => (reset ? res.items : [...prev, ...res.items]));
        setCursor(res.nextCursor);
        setHasMore(res.hasMore);
      } catch {
        show("No pudimos cargar el feed", "danger");
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [cursor, hasMore, filters, show],
  );

  useEffect(() => {
    setStack([]);
    setCursor(null);
    setHasMore(true);
    void loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.categories.join(","), filters.size, filters.city]);

  const handleSwipe = useCallback(
    async (action: SwipeAction) => {
      const current = stack[0];
      if (!current || busy) return;

      setStack((prev) => prev.slice(1));
      setBusy(true);

      try {
        const res = await swipesService.swipe(current.id, action);
        if (res.matched && res.match) setMatch(res.match);
        if (action === "super_like") void refreshUser();
      } catch (error) {
        setStack((prev) => [current, ...prev]);
        const msg =
          error instanceof ApiError ? error.message : "Error al swipear";
        show(msg, "danger");
      } finally {
        setBusy(false);
        if (stack.length - 1 <= PREFETCH_THRESHOLD && hasMore) void loadMore();
      }
    },
    [stack, busy, refreshUser, show, hasMore, loadMore],
  );

  return (
    // El mazo tiene que entrar en la pantalla sin scroll: con una altura fija
    // (era aspect-[3/4]) los botones de swipe caían abajo del pliegue en
    // cualquier teléfono, y en apaisado no se veía ni la carta. Ahora la
    // columna ocupa el alto disponible y la carta se queda con lo que sobra.
    <div className="mx-auto flex h-app-viewport min-h-[26rem] max-w-md flex-col gap-4 short-landscape:min-h-0 short-landscape:max-w-3xl short-landscape:flex-row short-landscape:items-center short-landscape:gap-6">
      <header className="shrink-0 space-y-3 short-landscape:flex-1">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-600 font-semibold mb-1 short:hidden">
            Tu feed
          </p>
          <h1 className="text-display text-2xl sm:text-3xl short:text-xl text-text-primary">
            Encontrá tu próxima{" "}
            <span className="text-display-italic gradient-brand-text">
              prenda favorita
            </span>
          </h1>
          <p className="text-text-secondary text-sm mt-1.5 short:hidden">
            Deslizá → si te gusta, ← si no. ★ para super-like.
          </p>
        </div>
        <FiltersPanel />
      </header>

      <div className="relative min-h-0 flex-1 short-landscape:h-full short-landscape:flex-none short-landscape:aspect-[3/4]">
        {loading ? (
          <FeedSkeleton />
        ) : stack.length === 0 ? (
          <EmptyFeed onRefresh={() => loadMore(true)} />
        ) : (
          stack
            .slice(0, 3)
            .reverse()
            .map((garment, idx, arr) => {
              const isTop = idx === arr.length - 1;
              return (
                <SwipeCard
                  key={garment.id}
                  garment={garment}
                  onSwipe={handleSwipe}
                  active={isTop}
                  zIndex={idx}
                />
              );
            })
        )}
      </div>

      {!loading && stack.length > 0 && (
        <SwipeActions
          onPass={() => handleSwipe("pass")}
          onLike={() => handleSwipe("like")}
          onSuperLike={() => handleSwipe("super_like")}
          disabled={busy}
        />
      )}

      {match && (
        <MatchModal
          match={match}
          open={!!match}
          onClose={() => setMatch(null)}
        />
      )}
    </div>
  );
}

function EmptyFeed({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-brand-200 bg-white/60 flex flex-col items-center justify-center text-center p-6 space-y-4">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Sparkles className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <h2 className="text-display text-2xl text-text-primary">
          Por ahora no hay más prendas
        </h2>
        <p className="text-text-secondary text-sm">
          Probá ajustar los filtros o volvé en un rato.
        </p>
      </div>
      <Button variant="outline" onClick={onRefresh}>
        Recargar
      </Button>
    </div>
  );
}
