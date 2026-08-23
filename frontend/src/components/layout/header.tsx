import { Link } from 'react-router';
import { useLocation } from 'react-router';
import { Heart, Layers, MessageCircle, Sparkles, User, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notifications-context';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/feed', label: 'Feed', short: 'Feed', icon: Layers, badgeKind: undefined },
  { href: '/matches', label: 'Matches', short: 'Matches', icon: Heart, badgeKind: 'match' as const },
  // La barra inferior reparte el ancho en 5: "Mis prendas" no entra en una
  // columna de 64px y se cortaba a la mitad en cualquier teléfono.
  { href: '/garments/me', label: 'Mis prendas', short: 'Prendas', icon: Sparkles, badgeKind: undefined },
  { href: '/events', label: 'Eventos', short: 'Eventos', icon: MessageCircle, badgeKind: undefined },
];

export function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();
  const matchBadge = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-surface-warm/85 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-6 h-16">
        <Link to="/feed" className="flex min-h-11 shrink-0 items-center gap-2 group">
          <span className="text-display text-2xl text-brand-700 group-hover:text-brand-600 transition-colors">
            SwapStyle
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon, badgeKind }) => {
            const active = pathname.startsWith(href);
            const showBadge = badgeKind === 'match' && matchBadge > 0;
            return (
              <Link
                key={href}
                to={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  // whitespace-nowrap + padding chico hasta lg: en una tablet de
                  // 768px "Mis prendas" partía en dos renglones y la barra se
                  // comía el logo.
                  'relative inline-flex items-center gap-2 px-2.5 lg:px-3.5 h-10 rounded-full text-sm font-medium whitespace-nowrap',
                  'transition-all duration-200 ease-out',
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/60',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
                {showBadge && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold',
                      active ? 'bg-white text-brand-700' : 'bg-brand-600 text-white',
                    )}
                    aria-label={`${matchBadge} sin leer`}
                  >
                    {matchBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/profile/edit"
            className="flex items-center gap-2 group rounded-full p-1 pr-3 hover:bg-white/60 transition-colors"
          >
            <Avatar src={user?.avatarUrl} alt={user?.name ?? 'Usuario'} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-text-primary group-hover:text-brand-700">
              {user?.username ?? '...'}
            </span>
          </Link>
          <button
            onClick={() => logout()}
            aria-label="Cerrar sesión"
            className="h-11 w-11 mouse:h-9 mouse:w-9 inline-flex items-center justify-center rounded-full text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  const { pathname } = useLocation();
  const { notifications } = useNotifications();
  const badge = notifications.filter((n) => !n.read).length;
  const items = [
    ...navItems,
    { href: '/profile/edit', label: 'Yo', short: 'Yo', icon: User, badgeKind: undefined },
  ];
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border safe-bottom"
      aria-label="Navegación principal"
    >
      <div className="grid grid-cols-5 h-16 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, short, icon: Icon, badgeKind }) => {
          const active = pathname.startsWith(href);
          const showBadge = badgeKind === 'match' && badge > 0;
          return (
            <Link
              key={href}
              to={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] xs:text-[11px] font-medium transition-colors',
                active ? 'text-brand-700' : 'text-text-muted hover:text-text-secondary',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200',
                  active && 'bg-brand-50',
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="w-full truncate text-center leading-none">{short}</span>
              {showBadge && (
                <span className="absolute top-1.5 right-[calc(50%-18px)] h-2 w-2 rounded-full bg-brand-600 ring-2 ring-surface" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
