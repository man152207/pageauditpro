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
          'pro-badge relative overflow-hidden inline-flex items-center gap-1',
          {
            'text-xs px-2 py-0.5': size === 'sm',
            'text-sm px-2.5 py-1': size === 'md',
            'text-base px-3 py-1.5': size === 'lg',
          },
          glow && 'animate-pulse-glow',
          className
        )}
      >
        {/* Shimmer effect */}
        <span className="absolute inset-0 overflow-hidden">
          <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
