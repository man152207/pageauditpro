import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from './skeleton';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  icon?: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  loading?: boolean;
  animate?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'score-excellent';
  if (score >= 60) return 'score-good';
  if (score >= 40) return 'score-average';
  return 'score-poor';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Needs Work';
}

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'bg-success';
  if (percentage >= 60) return 'bg-accent';
  if (percentage >= 40) return 'bg-warning';
  return 'bg-destructive';
}

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  icon: Icon,
  description,
  trend,
  className,
  loading = false,
  animate = true,
}: ScoreCardProps) {
  const [displayedWidth, setDisplayedWidth] = useState(animate ? 0 : (score / maxScore) * 100);
  const percentage = (score / maxScore) * 100;
  const scoreColor = getScoreColor(percentage);
  const scoreLabel = getScoreLabel(percentage);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setDisplayedWidth(percentage);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [percentage, animate]);

  if (loading) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton variant="circular" className="h-10 w-10" />
        </div>
        <div className="flex items-end gap-2 mb-4">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full mb-3" />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('interactive-card p-6 group', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold tracking-tight">{score}</span>
        <span className="text-lg text-muted-foreground mb-1">/ {maxScore}</span>
      </div>

      {/* Progress bar with animation */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-3">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            getProgressColor(percentage)
          )}
          style={{ width: `${displayedWidth}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', scoreColor)}>
          {scoreLabel}
        </span>
        {trend && (
          <span className={cn('inline-flex items-center gap-1 text-xs font-medium', {
            'text-success': trend === 'up',
            'text-destructive': trend === 'down',
            'text-muted-foreground': trend === 'neutral',
          })}>
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend === 'neutral' && <Minus className="h-3 w-3" />}
            {trend === 'up' && 'Improving'}
            {trend === 'down' && 'Declining'}
            {trend === 'neutral' && 'Stable'}
          </span>
        )}
      </div>
    </div>
  );
}
