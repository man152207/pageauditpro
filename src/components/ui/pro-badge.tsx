import * as React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const ProBadge = React.forwardRef<HTMLSpanElement, ProBadgeProps>(
  ({ className, size = 'sm', glow = false }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'relative overflow-hidden inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide',
          'bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground',
          {
            'text-[10px] px-2.5 py-1': size === 'sm',
            'text-xs px-3 py-1.5': size === 'md',
            'text-sm px-4 py-2': size === 'lg',
          },
          glow && 'animate-glow-pulse',
          className
        )}
        style={{
          boxShadow: '0 2px 10px hsl(var(--primary) / 0.4)',
        }}
      >
        {/* Shimmer effect */}
        <span className="absolute inset-0 overflow-hidden">
          <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </span>
        
        <Crown className={cn('relative z-10', {
          'h-3 w-3': size === 'sm',
          'h-4 w-4': size === 'md',
          'h-5 w-5': size === 'lg',
        })} />
        <span className="relative z-10">PRO</span>
      </span>
    );
  }
);

ProBadge.displayName = 'ProBadge';
