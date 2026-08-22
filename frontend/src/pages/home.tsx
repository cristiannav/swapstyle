import { Link } from "react-router";
import { ArrowRight, Heart, Recycle, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--color-brand-50),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_var(--color-gold-50),_transparent_55%)]">
      {/* Top bar */}
      <header className="px-6 py-5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link to="/" className="text-display text-2xl text-brand-700">
            SwapStyle
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex h-10 items-center px-4 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="inline-flex h-10 items-center gap-1.5 px-5 rounded-full bg-text-primary text-white text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Crear cuenta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 items-center">
          <section className="lg:col-span-7 space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium text-brand-700 border border-brand-100">
              <Sparkles className="h-3.5 w-3.5" />
              Una nueva forma de renovar tu armario
            </span>
            <h1 className="text-display text-4xl sm:text-5xl lg:text-6xl text-text-primary">
              Swipeá la prenda.{" "}
              <span className="text-display-italic gradient-brand-text">
                Matcheá
              </span>{" "}
              con la persona. Intercambien y listo.
            </h1>
            <p className="text-lg text-text-secondary max-w-xl">
              SwapStyle es el lugar donde tu próximo outfit ya existe — solo que
              está en el placard de otra persona. Sin compras, sin gastar; solo
              estilo en circulación.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center gap-2 px-7 rounded-full bg-brand-600 text-white text-base font-semibold shadow-card hover:bg-brand-700 hover:shadow-card-hover transition-all"
              >
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center px-7 rounded-full bg-white/80 backdrop-blur text-text-primary text-base font-medium border border-border hover:bg-white transition-all"
              >
                Ya tengo cuenta
              </Link>
            </div>

            {/* Tres beneficios */}
            <ul className="grid sm:grid-cols-3 gap-3 pt-6 max-w-xl">
              {[
                { icon: Heart, label: "Match mutuo" },
                { icon: Recycle, label: "Moda circular" },
                { icon: Sparkles, label: "Estilo curado" },
              ].map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-xl bg-white/60 backdrop-blur border border-border px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Visual mock cards */}
          <section className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] max-w-sm mx-auto">
              {[
                {
                  rotate: "-8deg",
                  translate: "-translate-x-6 -translate-y-3",
                  img: "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=600&h=800&fit=crop&q=80",
                  tag: "Vestido midi",
                },
                {
                  rotate: "4deg",
                  translate: "translate-x-4",
                  img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&q=80",
                  tag: "Camisa oversize",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{ transform: `rotate(${card.rotate})` }}
                  className={`absolute inset-0 rounded-3xl overflow-hidden shadow-card-hover bg-surface ${card.translate}`}
                >
                  <img
                    src={card.img}
                    alt={card.tag}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                    <p className="text-xs uppercase tracking-wider opacity-80">
                      Disponible
                    </p>
                    <p className="text-display text-xl">{card.tag}</p>
                  </div>
                </div>
              ))}
              {/* Match badge */}
              <div className="absolute -bottom-4 -right-2 sm:-right-6 rounded-full bg-white shadow-card-hover px-4 py-2.5 flex items-center gap-2 border border-border">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-gold-500 text-white">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                </span>
                <div className="text-xs">
                  <p className="font-semibold leading-none">¡Match!</p>
                  <p className="text-text-muted leading-none mt-0.5">
                    hace 2 minutos
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/60 mt-16 py-6 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} SwapStyle · Moda circular</p>
          <p>Hecho con cuidado para quienes aman renovar sin gastar.</p>
        </div>
      </footer>
    </div>
  );
}
