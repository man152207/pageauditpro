import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, BarChart3, ThumbsUp, Zap, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ScoreBreakdown {
  engagement?: number;
  consistency?: number;
  readiness?: number;
  growth?: number;
}

interface HeroScoreSectionProps {
  overallScore: number;
  breakdown: ScoreBreakdown;
  previousScore?: number;
  loading?: boolean;
  className?: string;
}

function getGradeLabel(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: 'A+', color: 'text-success' };
  if (score >= 80) return { grade: 'A', color: 'text-success' };
  if (score >= 70) return { grade: 'B', color: 'text-accent' };
  if (score >= 60) return { grade: 'C', color: 'text-warning' };
  if (score >= 50) return { grade: 'D', color: 'text-warning' };
  return { grade: 'F', color: 'text-destructive' };
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'stroke-success';
  if (score >= 60) return 'stroke-accent';
  if (score >= 40) return 'stroke-warning';
  return 'stroke-destructive';
}

// Compact score ring - reduced from 180px to 140px (120px on mobile)
function ScoreRing({ score, size = 140, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;
  const { grade, color } = getGradeLabel(score);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted fill-none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('fill-none transition-all duration-1000 ease-out', getScoreColor(score))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl font-bold tracking-tight">{Math.round(animatedScore)}</span>
        <span className={cn('text-base font-bold', color)}>{grade}</span>
      </div>
    </div>
  );
}

interface BreakdownCardProps {
  title: string;
  score: number;
  icon: React.ElementType;
}

// Compact breakdown card with reduced padding
function BreakdownCard({ title, score, icon: Icon }: BreakdownCardProps) {
  return (
    <div className="interactive-card p-3 group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">{title}</p>
          <p className="text-xl font-bold tracking-tight">{score}</p>
        </div>
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', {
          'bg-success/10 text-success': score >= 80,
          'bg-accent/10 text-accent': score >= 60 && score < 80,
          'bg-warning/10 text-warning': score >= 40 && score < 60,
          'bg-destructive/10 text-destructive': score < 40,
        })}>
          {getGradeLabel(score).grade}
        </span>
      </div>
    </div>
  );
}

export function HeroScoreSection({
  overallScore,
  breakdown,
  previousScore,
  loading = false,
  className,
}: HeroScoreSectionProps) {
  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-border bg-card p-4 sm:p-5', className)}>
        <div className="grid lg:grid-cols-[auto_1fr] gap-6 items-center">
          <div className="flex flex-col items-center text-center">
            <Skeleton variant="circular" className="h-36 w-36 mb-3" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton variant="circular" className="h-8 w-8" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const scoreDiff = previousScore !== undefined ? overallScore - previousScore : null;

  return (
    <div className={cn('rounded-2xl border border-border bg-card overflow-hidden', className)}>
      {/* Header - Compact */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Health Summary</h3>
            <p className="text-xs text-muted-foreground">Overall page performance score</p>
          </div>
        </div>
      </div>

      {/* Content - Tighter padding */}
      <div className="p-4 sm:p-5">
        <div className="grid lg:grid-cols-[auto_1fr] gap-5 items-center">
          {/* Score Ring - Centered on mobile */}
          <div className="flex flex-col items-center text-center">
            {/* Mobile: 120px, Desktop: 140px */}
            <div className="sm:hidden">
              <ScoreRing score={overallScore} size={120} strokeWidth={8} />
            </div>
            <div className="hidden sm:block">
              <ScoreRing score={overallScore} />
            </div>
            
            {scoreDiff !== null && (
              <div className={cn(
                'flex items-center gap-1 mt-3 px-2 py-1 rounded-full text-xs font-medium',
                scoreDiff > 0 ? 'bg-success/10 text-success' : 
                scoreDiff < 0 ? 'bg-destructive/10 text-destructive' : 
                'bg-muted text-muted-foreground'
              )}>
                {scoreDiff > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : scoreDiff < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                <span>
                  {scoreDiff > 0 ? '+' : ''}{scoreDiff} vs previous
                </span>
              </div>
            )}
          </div>

          {/* Breakdown Cards - 2x2 grid on all screens */}
          <div className="grid grid-cols-2 gap-3">
            <BreakdownCard
              title="Engagement"
              score={breakdown.engagement || 0}
              icon={ThumbsUp}
            />
            <BreakdownCard
              title="Consistency"
              score={breakdown.consistency || 0}
              icon={BarChart3}
            />
            <BreakdownCard
              title="Readiness"
              score={breakdown.readiness || 0}
              icon={Zap}
            />
            <BreakdownCard
              title="Growth"
              score={breakdown.growth || breakdown.readiness || 0}
              icon={Users}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
