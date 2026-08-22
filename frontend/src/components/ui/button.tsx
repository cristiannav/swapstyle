import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gold';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300 shadow-sm hover:shadow-card',
  secondary:
    'bg-white text-text-primary border border-border hover:border-brand-200 hover:bg-brand-50/40 disabled:opacity-60 shadow-xs',
  outline:
    'bg-transparent text-brand-700 border-2 border-brand-300 hover:bg-brand-50 hover:border-brand-500',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-muted',
  danger:
    'bg-danger text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 shadow-sm',
  gold:
    'bg-gold-500 text-white hover:bg-gold-600 active:bg-gold-700 shadow-sm hover:shadow-card',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9  px-3.5 text-sm rounded-lg',
  md: 'h-11 px-5   text-sm rounded-xl',
  lg: 'h-12 px-6   text-base rounded-xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold tracking-tight cursor-pointer',
        'transition-all duration-200 ease-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});
