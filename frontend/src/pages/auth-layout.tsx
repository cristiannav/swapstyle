import { Link, Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* Editorial side */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_30%_30%,_#ec4899_0%,_transparent_50%),radial-gradient(at_70%_60%,_#be185d_0%,_transparent_55%),linear-gradient(135deg,_#831843_0%,_#9d174d_100%)]" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><circle cx=%221%22 cy=%221%22 r=%221%22 fill=%22white%22/></svg>')]"
        />

        <Link to="/" className="relative text-display text-3xl">
          SwapStyle
        </Link>

        <div className="relative space-y-6 max-w-md">
          <p className="text-xs tracking-[0.2em] uppercase text-white/70">Moda circular</p>
          <h2 className="text-display text-4xl xl:text-5xl leading-tight">
            Tu próximo{' '}
            <span className="text-display-italic">outfit favorito</span>{' '}
            ya existe.
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Solo está esperando del otro lado de un swipe. Encontrá personas con
            tu estilo y empezá a intercambiar.
          </p>
        </div>

        <div className="relative flex items-center gap-3 text-sm text-white/70">
          <div className="flex -space-x-2">
            {[
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&q=80',
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&q=80',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&q=80',
            ].map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-8 w-8 rounded-full border-2 border-brand-700 object-cover"
              />
            ))}
          </div>
          <span>+2.000 personas ya están intercambiando</span>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex flex-col items-center justify-center px-6 py-12 bg-surface-warm">
        <Link to="/" className="lg:hidden text-display text-2xl text-brand-700 mb-8">
          SwapStyle
        </Link>
        <div className="w-full max-w-sm"><Outlet /></div>
      </main>
    </div>
  );
}
