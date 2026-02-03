import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BenchmarksCardProps {
  postingFrequency: {
    current: number;
    target: number;
    unit: string;
  };
  engagementRate: {
    current: number;
    min: number;
    max: number;
  };
  responseTime?: {
    current: number;
    target: number;
    unit: string;
  };
  className?: string;
}

function BenchmarkRow({
  label,
  current,
  target,
  unit,
  icon: Icon,
  isPercentage = false,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  isPercentage?: boolean;
}) {
  const percentage = Math.min(100, (current / target) * 100);
  const isGood = current >= target * 0.8;
  const isExcellent = current >= target;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-bold',
            isExcellent ? 'text-success' : isGood ? 'text-accent' : 'text-warning'
          )}>
            {isPercentage ? `${current.toFixed(2)}%` : current.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            / {isPercentage ? `${target}%` : `${target} ${unit}`}
          </span>
        </div>
      </div>
      <div className="relative">
        <Progress value={percentage} className="h-2" />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground/30"
          style={{ left: `${Math.min(100, (target / (target * 1.5)) * 100)}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {isExcellent ? (
          <>
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span className="text-success">Meeting target</span>
          </>
        ) : isGood ? (
          <>
            <TrendingUp className="h-3 w-3 text-accent" />
            <span className="text-accent">Getting there</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-3 w-3 text-warning" />
            <span className="text-warning">Below target</span>
          </>
        )}
      </div>
    </div>
  );
}

export function BenchmarksCard({
  postingFrequency,
  engagementRate,
  responseTime,
  className,
}: BenchmarksCardProps) {
  return (
    <div className={cn('p-5 rounded-2xl border border-border bg-card', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Benchmarks</h4>
            <p className="text-xs text-muted-foreground">vs industry targets</p>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">
              Benchmarks are industry heuristics based on general social media best practices. 
              Actual targets may vary by industry and audience.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-5">
        <BenchmarkRow
          label="Posting Frequency"
          current={postingFrequency.current}
          target={postingFrequency.target}
          unit={postingFrequency.unit}
          icon={Clock}
        />

        <BenchmarkRow
          label="Engagement Rate"
          current={engagementRate.current}
          target={engagementRate.max}
          unit="%"
          icon={TrendingUp}
          isPercentage
        />

        {responseTime && (
          <BenchmarkRow
            label="Response Time"
            current={responseTime.target - responseTime.current}
            target={responseTime.target}
            unit={responseTime.unit}
            icon={BarChart3}
          />
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
          <Info className="h-3 w-3" />
          Targets: 3-5 posts/week, 1-3% ER for pages with 1K+ followers
        </p>
      </div>
    </div>
  );
}
