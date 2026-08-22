import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-surface-warm">
      <p className="text-display text-6xl text-brand-700">404</p>
      <h1 className="text-display text-2xl text-text-primary">Esta página no existe</h1>
      <p className="text-text-secondary text-sm max-w-sm">
        El enlace que seguiste no lleva a ningún lado. Volvé al inicio y seguí swipeando.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex h-11 items-center px-6 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
