import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';
import { safeImageUrl } from '@/lib/security';

type ImageProps = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'loading'> & {
  src: string;
  /** Cubre el contenedor posicionado más cercano — equivale al `fill` de next/image.
   *  El padre tiene que ser `relative`. */
  fill?: boolean;
  /** Carga la imagen de entrada en vez de diferirla (para el LCP, p. ej. la carta activa del feed). */
  priority?: boolean;
};

/**
 * Reemplazo de `next/image`. Sin optimizador ni srcset: sirve la URL tal cual,
 * pero conserva el lazy-loading por defecto que traía next/image.
 */
export function Image({ src, alt = '', fill, priority, className, ...props }: ImageProps) {
  // Las URLs vienen de las prendas que carga el usuario: se filtran por protocolo.
  const safe = safeImageUrl(src);
  if (!safe) return null;

  return (
    <img
      src={safe}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={cn(fill && 'absolute inset-0 h-full w-full', className)}
      {...props}
    />
  );
}
