import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Heart, X, Star, MapPin } from "lucide-react";
import { Avatar, Badge, Image } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Garment, SwipeAction } from "@/types/api";

interface SwipeCardProps {
  garment: Garment;
  onSwipe: (action: SwipeAction) => void;
  active: boolean;
  zIndex: number;
}

const SWIPE_THRESHOLD = 120;

export function SwipeCard({
  garment,
  onSwipe,
  active,
  zIndex,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const passOpacity = useTransform(x, [-140, -40], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe("like");
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("pass");
  };

  const cover = garment.images?.[0]?.url;

  return (
    <motion.article
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.55}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, zIndex }}
      whileDrag={{ scale: 1.02 }}
      initial={{ scale: active ? 1 : 0.96, y: active ? 0 : 8 }}
      animate={{ scale: active ? 1 : 0.96, y: active ? 0 : 8 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={cn(
        "absolute inset-0 rounded-3xl overflow-hidden bg-white shadow-card-hover",
        "border border-border",
        !active && "pointer-events-none",
      )}
    >
      <div className="relative h-full w-full">
        {cover ? (
          <Image
            src={cover}
            alt={garment.title}
            fill
            className="object-cover"
            priority={active}
            draggable={false}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-100 to-gold-100" />
        )}

        {/* Top overlay (badges) */}
        <div className="absolute inset-x-0 top-0 p-4 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="glass">{labelCategory(garment.category)}</Badge>
            {garment.isPremium && (
              <Badge
                tone="glass"
                className="bg-gold-500/90 text-white border-gold-300/50"
              >
                ★ Premium
              </Badge>
            )}
          </div>
        </div>

        {/* Gradient & content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

        {/* Like / Nope overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-12 left-6 px-4 py-2 rounded-2xl bg-emerald-500/95 text-white font-bold text-xl tracking-widest -rotate-12 shadow-card-hover"
        >
          LIKE
        </motion.div>
        <motion.div
          style={{ opacity: passOpacity }}
          className="absolute top-12 right-6 px-4 py-2 rounded-2xl bg-rose-600/95 text-white font-bold text-xl tracking-widest rotate-12 shadow-card-hover"
        >
          NOPE
        </motion.div>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white space-y-2 sm:space-y-3">
          <div>
            <h2 className="text-display text-2xl sm:text-3xl leading-tight line-clamp-2">
              {garment.title}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
              {garment.brand && (
                <span className="font-medium tracking-wide uppercase opacity-90">
                  {garment.brand}
                </span>
              )}
              {garment.brand && garment.size && (
                <span className="opacity-50">·</span>
              )}
              {garment.size && (
                <span className="opacity-90">Talle {garment.size}</span>
              )}
              {garment.color && <span className="opacity-50">·</span>}
              {garment.color && (
                <span className="opacity-90">{garment.color}</span>
              )}
              <span className="opacity-50">·</span>
              <span className="opacity-90">
                {labelCondition(garment.condition)}
              </span>
            </div>
          </div>

          {garment.description && (
            <p className="text-sm text-white/85 line-clamp-2 leading-relaxed short:hidden">
              {garment.description}
            </p>
          )}

          {garment.owner && (
            <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
              <Avatar
                src={garment.owner.avatarUrl}
                alt={garment.owner.name}
                size="sm"
              />
              <div className="text-sm flex-1 min-w-0">
                <p className="font-semibold truncate">{garment.owner.name}</p>
                {garment.owner.city && (
                  <p className="text-xs text-white/70 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {garment.owner.city}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function SwipeActions({
  onPass,
  onLike,
  onSuperLike,
  disabled,
}: {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-5 pt-4 short:gap-3 short:pt-2 short-landscape:flex-col short-landscape:pt-0">
      <ActionButton
        onClick={onPass}
        disabled={disabled}
        ariaLabel="Pasar"
        className="h-14 w-14 short:h-12 short:w-12 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
      >
        <X className="h-7 w-7" strokeWidth={2.5} />
      </ActionButton>
      <ActionButton
        onClick={onSuperLike}
        disabled={disabled}
        ariaLabel="Super Like"
        className="h-12 w-12 short:h-11 short:w-11 text-gold-600 hover:bg-gold-50 hover:border-gold-200"
      >
        <Star className="h-5 w-5 fill-current" />
      </ActionButton>
      <ActionButton
        onClick={onLike}
        disabled={disabled}
        ariaLabel="Me gusta"
        className="h-14 w-14 short:h-12 short:w-12 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
      >
        <Heart className="h-7 w-7 fill-current" strokeWidth={2} />
      </ActionButton>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  ariaLabel,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "rounded-full bg-white border border-border shadow-card flex items-center justify-center",
        "transition-all duration-150 ease-out cursor-pointer",
        "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        className,
      )}
    >
      {children}
    </button>
  );
}

function labelCategory(c: Garment["category"]): string {
  return (
    {
      top: "Parte superior",
      bottom: "Parte inferior",
      dress: "Vestido",
      outerwear: "Abrigo",
      shoes: "Calzado",
      accessory: "Accesorio",
      bag: "Bolso",
      other: "Otro",
    } as const
  )[c];
}

function labelCondition(c: Garment["condition"]): string {
  return (
    {
      new: "Nuevo",
      like_new: "Como nuevo",
      good: "Buen estado",
      fair: "Aceptable",
    } as const
  )[c];
}
