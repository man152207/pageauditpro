import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ThumbsUp, 
  BarChart3, 
  Zap,
  HelpCircle,
  Info
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ScoreExplanationCardProps {
  title: string;
  score: number;
  icon: React.ElementType;
  explanationTitle: string;
  explanationItems: { label: string; value?: string | number; available?: boolean }[];
  className?: string;
}

function getGradeInfo(score: number): { grade: string; label: string; colorClass: string } {
  if (score >= 90) return { grade: 'A+', label: 'Excellent', colorClass: 'text-success bg-success/10' };
  if (score >= 80) return { grade: 'A', label: 'Great', colorClass: 'text-success bg-success/10' };
  if (score >= 70) return { grade: 'B', label: 'Good', colorClass: 'text-accent bg-accent/10' };
  if (score >= 60) return { grade: 'C', label: 'Average', colorClass: 'text-warning bg-warning/10' };
  if (score >= 50) return { grade: 'D', label: 'Below Average', colorClass: 'text-warning bg-warning/10' };
  return { grade: 'F', label: 'Needs Work', colorClass: 'text-destructive bg-destructive/10' };
}

/**
 * Individual Score Explanation Card with "Why this score?" accordion
 * Requirement B3
 */
export function ScoreExplanationCard({
  title,
  score,
  icon: Icon,
  explanationTitle,
  explanationItems,
  className,
}: ScoreExplanationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { grade, label, colorClass } = getGradeInfo(score);

  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-md',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold">{title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-bold tracking-tight">{score}</span>
              <span className={cn('px-2 py-0.5 rounded-md text-xs font-semibold', colorClass)}>
                {grade}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{label}</p>

      {/* Why this score? Accordion */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium w-full">
          <HelpCircle className="h-4 w-4" />
          <span>Why this score?</span>
          <ChevronDown className={cn(
            'h-4 w-4 ml-auto transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {explanationTitle}
            </p>
            <ul className="space-y-1.5">
              {explanationItems.map((item, index) => (
                <li key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  {item.available !== false ? (
                    <span className="font-medium">{item.value ?? '—'}</span>
                  ) : (
                    <span className="text-muted-foreground/50 text-xs">Not available</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface ScoreExplanationGridProps {
  breakdown: {
    engagement?: number;
    consistency?: number;
    readiness?: number;
  };
  detailedMetrics?: {
    engagementRate?: number;
    totalLikes?: number;
    totalComments?: number;
    totalShares?: number;
    postsCount?: number;
    postsPerWeek?: number;
    followers?: number;
  } | null;
  inputSummary?: {
    followers?: number;
    postsAnalyzed?: number;
  } | null;
}

/**
 * Grid of Score Explanation Cards
 */
export function ScoreExplanationGrid({
  breakdown,
  detailedMetrics,
  inputSummary,
}: ScoreExplanationGridProps) {
  const { engagement = 0, consistency = 0, readiness = 0 } = breakdown;
  const followers = detailedMetrics?.followers || inputSummary?.followers;
  const postsCount = detailedMetrics?.postsCount || inputSummary?.postsAnalyzed;

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <ScoreExplanationCard
        title="Engagement"
        score={engagement}
        icon={ThumbsUp}
        explanationTitle="Inputs used for this score:"
        explanationItems={[
          { label: 'Reactions', value: detailedMetrics?.totalLikes?.toLocaleString() },
          { label: 'Comments', value: detailedMetrics?.totalComments?.toLocaleString() },
          { label: 'Shares', value: detailedMetrics?.totalShares?.toLocaleString() },
          { label: 'Followers', value: followers?.toLocaleString() },
          { label: 'Engagement Rate', value: detailedMetrics?.engagementRate ? `${detailedMetrics.engagementRate.toFixed(2)}%` : undefined },
        ].filter(item => item.value !== undefined)}
      />
      
      <ScoreExplanationCard
        title="Consistency"
        score={consistency}
        icon={BarChart3}
        explanationTitle="Inputs used for this score:"
        explanationItems={[
          { label: 'Posts analyzed', value: postsCount?.toString() },
          { label: 'Posts per week', value: detailedMetrics?.postsPerWeek?.toFixed(1) },
          { label: 'Posting gap', value: 'Calculated from dates', available: !!postsCount },
        ].filter(item => item.value !== undefined || item.available !== false)}
      />
      
      <ScoreExplanationCard
        title="Readiness"
        score={readiness}
        icon={Zap}
        explanationTitle="Best practice checklist:"
        explanationItems={[
          { label: 'Profile photo', value: readiness >= 50 ? '✓' : '—' },
          { label: 'Cover photo', value: readiness >= 40 ? '✓' : '—' },
          { label: 'Page description', value: readiness >= 60 ? '✓' : '—' },
          { label: 'Contact info', value: readiness >= 70 ? '✓' : '—' },
          { label: 'CTA button', value: readiness >= 80 ? '✓' : '—' },
        ]}
      />
    </div>
  );
}

/**
 * Tooltip for technical terms
 */
export function MetricTooltip({ 
  term, 
  definition,
  children 
}: { 
  term: string; 
  definition: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground/50">
          {children}
          <Info className="h-3 w-3 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-medium mb-1">{term}</p>
        <p className="text-xs text-muted-foreground">{definition}</p>
      </TooltipContent>
    </Tooltip>
  );
}
