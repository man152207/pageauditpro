import { cn } from '@/lib/utils';
import { BarChart3, Clock, PieChart, TrendingUp, AlertCircle } from 'lucide-react';

interface ChartEmptyStateProps {
  title: string;
  chartType?: 'line' | 'bar' | 'heatmap' | 'pie';
  className?: string;
}

const chartIcons: Record<string, React.ElementType> = {
  line: TrendingUp,
  bar: BarChart3,
  heatmap: Clock,
  pie: PieChart,
};

/**
 * Chart Empty State (B4)
 * Clean empty state when chart data is unavailable
 */
export function ChartEmptyState({ title, chartType = 'bar', className }: ChartEmptyStateProps) {
  const Icon = chartIcons[chartType] || BarChart3;

  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-6 sm:p-8',
      className
    )}>
      {/* Chart Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <h4 className="font-semibold">{title}</h4>
      </div>

      {/* Empty State Content */}
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground font-medium mb-2">
          Not enough data from Facebook for this range.
        </p>
        <p className="text-sm text-muted-foreground/70 max-w-xs">
          Try a longer range (30 days+) or run another audit later.
        </p>
      </div>
    </div>
  );
}

/**
 * Chart Container wrapper with consistent styling
 */
export function ChartContainer({ 
  title, 
  icon,
  children, 
  className 
}: { 
  title: string; 
  icon?: React.ReactNode;
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card overflow-hidden',
      className
    )}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
        {icon || (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
        )}
        <h4 className="font-semibold">{title}</h4>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
