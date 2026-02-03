import { cn } from '@/lib/utils';
import { BarChart3, Clock, PieChart, TrendingUp, AlertCircle, Calendar, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type EmptyReason = 
  | 'no_data'           // No data available in the selected range
  | 'no_posts'          // No posts in the selected date range
  | 'api_limitation'    // Facebook API didn't return this data
  | 'demographics'      // Demographics require minimum followers
  | 'new_page'          // Page is too new for trend data
  | 'permission';       // Missing API permissions

interface ChartEmptyStateProps {
  title: string;
  chartType?: 'line' | 'bar' | 'heatmap' | 'pie';
  reason?: EmptyReason;
  dateRange?: string;
  className?: string;
}

const chartIcons: Record<string, React.ElementType> = {
  line: TrendingUp,
  bar: BarChart3,
  heatmap: Clock,
  pie: PieChart,
};

const reasonConfig: Record<EmptyReason, { 
  message: string; 
  suggestion: string; 
  icon?: React.ElementType;
}> = {
  no_data: {
    message: 'Not enough data from Facebook for this range.',
    suggestion: 'Try a longer range (30 days+) or run another audit later.',
    icon: AlertCircle,
  },
  no_posts: {
    message: 'No posts found in the selected date range.',
    suggestion: 'This page may not have published content during this period. Try extending the date range.',
    icon: Calendar,
  },
  api_limitation: {
    message: "Facebook's API didn't return data for this metric.",
    suggestion: 'This can happen with newer pages or limited activity. The data may become available as the page grows.',
    icon: AlertCircle,
  },
  demographics: {
    message: 'Audience demographics require at least 100 page followers.',
    suggestion: 'Once your page reaches 100 followers, demographic insights will become available.',
    icon: Users,
  },
  new_page: {
    message: 'This page is too new for trend analysis.',
    suggestion: 'Facebook needs at least 7 days of activity to generate meaningful trends.',
    icon: Clock,
  },
  permission: {
    message: 'Missing Facebook permissions for this data.',
    suggestion: 'Reconnect your Facebook page and ensure all analytics permissions are granted.',
    icon: RefreshCw,
  },
};

/**
 * Chart Empty State with contextual messaging
 * Shows different messages based on WHY data is unavailable
 */
export function ChartEmptyState({ 
  title, 
  chartType = 'bar', 
  reason = 'no_data',
  dateRange,
  className 
}: ChartEmptyStateProps) {
  const Icon = chartIcons[chartType] || BarChart3;
  const config = reasonConfig[reason];
  const ReasonIcon = config.icon || AlertCircle;

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
          <ReasonIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground font-medium mb-2">
          {config.message}
        </p>
        <p className="text-sm text-muted-foreground/70 max-w-sm">
          {config.suggestion}
        </p>
        {dateRange && (
          <p className="text-xs text-muted-foreground/50 mt-2">
            Date range: {dateRange}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Inline empty state for smaller sections
 */
export function InlineEmptyState({ 
  message, 
  suggestion,
  className 
}: { 
  message: string; 
  suggestion?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-6 text-center',
      className
    )}>
      <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground font-medium mb-1">
        {message}
      </p>
      {suggestion && (
        <p className="text-xs text-muted-foreground/60 max-w-xs">
          {suggestion}
        </p>
      )}
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

/**
 * Data Status Indicator - shows what data is available/missing
 */
export function DataStatusIndicator({
  available,
  missing,
  className,
}: {
  available: string[];
  missing: string[];
  className?: string;
}) {
  if (available.length === 0 && missing.length === 0) return null;

  return (
    <div className={cn(
      'rounded-xl border border-border bg-muted/30 p-4',
      className
    )}>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        Data Availability
      </h4>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {available.length > 0 && (
          <div>
            <p className="text-xs font-medium text-success mb-2">✓ Available</p>
            <ul className="space-y-1">
              {available.map((item) => (
                <li key={item} className="text-xs text-muted-foreground">{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {missing.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">✗ Unavailable</p>
            <ul className="space-y-1">
              {missing.map((item) => (
                <li key={item} className="text-xs text-muted-foreground/70">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {missing.length > 0 && (
        <p className="text-xs text-muted-foreground/60 mt-3 pt-3 border-t border-border">
          Missing data may be due to page activity level, account age, or API limitations. 
          Try a longer date range or re-run the audit later.
        </p>
      )}
    </div>
  );
}
