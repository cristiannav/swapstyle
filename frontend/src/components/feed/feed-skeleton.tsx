export function FeedSkeleton() {
  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-brand-100/60 to-gold-100/60 border border-border">
      <div className="absolute inset-0 animate-pulse">
        <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
          <div className="h-8 w-2/3 rounded-lg bg-white/40" />
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full bg-white/30" />
            <div className="h-5 w-14 rounded-full bg-white/30" />
            <div className="h-5 w-16 rounded-full bg-white/30" />
          </div>
          <div className="h-4 w-full rounded bg-white/25" />
          <div className="h-4 w-3/4 rounded bg-white/25" />
          <div className="flex items-center gap-2 pt-3">
            <div className="h-8 w-8 rounded-full bg-white/30" />
            <div className="space-y-1">
              <div className="h-3 w-24 rounded bg-white/30" />
              <div className="h-2.5 w-16 rounded bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
