import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface LoadingCardProps {
  className?: string;
  lines?: number;
  showIcon?: boolean;
  showFooter?: boolean;
}

export function LoadingCard({ 
  className, 
  lines = 3, 
  showIcon = true,
  showFooter = false 
}: LoadingCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        {showIcon && <Skeleton variant="circular" className="h-10 w-10" />}
      </div>
      
      {/* Content lines */}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')} 
          />
        ))}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      )}
    </div>
  );
}

interface LoadingGridProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function LoadingGrid({ count = 6, columns = 3, className }: LoadingGridProps) {
  return (
    <div className={cn(
      'grid gap-6',
      columns === 2 && 'grid-cols-1 md:grid-cols-2',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} showFooter />
      ))}
    </div>
  );
}
