import { cn } from '@/lib/cn';

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export function Spinner({ size = 'md', className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-brand-200 border-t-brand-500',
        sizes[size],
        className,
      )}
      aria-label="Cargando"
      role="status"
    />
  );
}
