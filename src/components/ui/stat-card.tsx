import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

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
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <p className="text-3xl font-bold">{value}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn('text-sm font-medium', {
              'text-success': trend.isPositive,
              'text-destructive': !trend.isPositive,
            })}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-muted-foreground">from last month</span>
        </div>
      )}
    </div>
  );
}
