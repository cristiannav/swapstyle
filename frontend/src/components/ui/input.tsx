import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-text-primary',
        'placeholder:text-text-muted transition-all duration-150',
        'focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15',
        'hover:border-border-strong',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-surface-muted',
        invalid
          ? 'border-danger focus:border-danger focus:ring-red-500/15'
          : 'border-border',
        className,
      )}
      {...props}
    />
  );
});
