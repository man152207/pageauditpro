import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from './skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn('stat-card', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton variant="circular" className="h-9 w-9" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-9 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('stat-card group transition-all duration-200', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight group-hover:text-primary transition-colors">{value}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
              trend.isPositive 
                ? 'text-success bg-success/10' 
                : 'text-destructive bg-destructive/10'
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-muted-foreground">from last month</span>
        </div>
      )}
    </div>
  );
}
