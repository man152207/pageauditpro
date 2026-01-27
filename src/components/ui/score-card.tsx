import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  icon?: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
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

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  icon: Icon,
  description,
  trend,
  className,
}: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  const scoreColor = getScoreColor(percentage);
  const scoreLabel = getScoreLabel(percentage);

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 mb-3">
        <span className="text-4xl font-bold">{score}</span>
        <span className="text-lg text-muted-foreground mb-1">/ {maxScore}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-2">
        <div
          className={cn('h-full rounded-full transition-all duration-500', {
            'bg-success': percentage >= 80,
            'bg-accent': percentage >= 60 && percentage < 80,
            'bg-warning': percentage >= 40 && percentage < 60,
            'bg-destructive': percentage < 40,
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', scoreColor)}>
          {scoreLabel}
        </span>
        {trend && (
          <span className={cn('text-xs font-medium', {
            'text-success': trend === 'up',
            'text-destructive': trend === 'down',
            'text-muted-foreground': trend === 'neutral',
          })}>
            {trend === 'up' && '↑ Improving'}
            {trend === 'down' && '↓ Declining'}
            {trend === 'neutral' && '→ Stable'}
          </span>
        )}
      </div>
    </div>
  );
}
