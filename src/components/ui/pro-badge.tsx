import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProBadge({ className, size = 'sm' }: ProBadgeProps) {
  return (
    <span
      className={cn(
        'pro-badge',
        {
          'text-xs px-2 py-0.5': size === 'sm',
          'text-sm px-2.5 py-1': size === 'md',
          'text-base px-3 py-1.5': size === 'lg',
        },
        className
      )}
    >
      <Crown className={cn({
        'h-3 w-3': size === 'sm',
        'h-4 w-4': size === 'md',
        'h-5 w-5': size === 'lg',
      })} />
      PRO
    </span>
  );
}
