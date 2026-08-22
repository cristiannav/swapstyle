import { Image } from './image';
import { cn } from '@/lib/cn';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: { px: 24, cls: 'h-6 w-6 text-xs' },
  sm: { px: 32, cls: 'h-8 w-8 text-sm' },
  md: { px: 40, cls: 'h-10 w-10 text-base' },
  lg: { px: 56, cls: 'h-14 w-14 text-lg' },
  xl: { px: 80, cls: 'h-20 w-20 text-2xl' },
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const { px, cls } = sizeMap[size];
  const initials = alt
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden bg-brand-100 text-brand-700 font-semibold flex items-center justify-center shrink-0',
        cls,
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={alt} width={px} height={px} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
