import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'brand' | 'gold' | 'success' | 'warning' | 'danger' | 'glass';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-text-secondary border border-border',
  brand:   'bg-brand-50 text-brand-700 border border-brand-100',
  gold:    'bg-gold-50 text-gold-700 border border-gold-100',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  danger:  'bg-red-50 text-red-700 border border-red-100',
  glass:   'bg-white/15 backdrop-blur text-white border border-white/20',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
