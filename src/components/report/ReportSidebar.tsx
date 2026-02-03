import { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Filter,
  Sparkles,
  Target,
  TrendingUp,
  ArrowRight,
  BarChart3,
  PieChart,
  Lock,
  ExternalLink,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReportSidebarProps {
  hasProAccess: boolean;
  overallScore: number;
  breakdown: {
    engagement: number;
    consistency: number;
    readiness: number;
  };
  nextActions?: string[];
  paidVsOrganic?: {
    paid: number;
    organic: number;
    totalPaid?: number;
    totalOrganic?: number;
    available?: boolean;
    message?: string;
    reason?: string;
  } | null;
  benchmarks?: {
    postingFrequency: { current: number; target: string };
    engagementRate: { current: number; range: string };
  } | null;
  onFilterChange?: (filter: string) => void;
  className?: string;
}

export function ReportSidebar({
  hasProAccess,
  overallScore,
  breakdown,
  nextActions = [],
  paidVsOrganic,
  benchmarks,
  onFilterChange,
  className,
}: ReportSidebarProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-accent';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <aside
      className={cn(
        'w-full lg:w-72 xl:w-80 shrink-0 space-y-3',
        isSticky && 'lg:sticky lg:top-24',
        className
      )}
    >
      {/* Quick Score Overview - Compact */}
      <div className="p-3 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-xs">Health Score</h4>
            <p className={cn('text-xl font-bold', getScoreColor(overallScore))}>
              {overallScore}/100
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Engagement</span>
            <span className={cn('font-medium', getScoreColor(breakdown.engagement))}>
              {breakdown.engagement}
            </span>
          </div>
          <Progress value={breakdown.engagement} className="h-1" />
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Consistency</span>
            <span className={cn('font-medium', getScoreColor(breakdown.consistency))}>
              {breakdown.consistency}
            </span>
          </div>
          <Progress value={breakdown.consistency} className="h-1" />
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Readiness</span>
            <span className={cn('font-medium', getScoreColor(breakdown.readiness))}>
              {breakdown.readiness}
            </span>
          </div>
          <Progress value={breakdown.readiness} className="h-1" />
        </div>
      </div>

      {/* Next Actions - Compact */}
      {nextActions.length > 0 && (
        <div className="p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <h4 className="font-semibold text-xs">Next Actions</h4>
          </div>
          <ul className="space-y-1.5">
            {nextActions.slice(0, 3).map((action, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs">
                <ArrowRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paid vs Organic Snapshot - Compact */}
      {hasProAccess ? (
        paidVsOrganic?.available === true ? (
          // Data is available - show percentages
          paidVsOrganic.paid === 0 && paidVsOrganic.organic === 100 ? (
            <div className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-1.5 mb-2">
                <PieChart className="h-3.5 w-3.5 text-primary" />
                <h4 className="font-semibold text-xs">Paid vs Organic</h4>
              </div>
              <div className="text-center py-1">
                <p className="text-lg font-bold text-accent">100%</p>
                <p className="text-[10px] text-muted-foreground">Organic Reach</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center italic">
                {paidVsOrganic.message || 'No paid impressions detected'}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-1.5 mb-2">
                <PieChart className="h-3.5 w-3.5 text-primary" />
                <h4 className="font-semibold text-xs">Paid vs Organic</h4>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-center flex-1">
                  <p className="text-lg font-bold text-primary">{paidVsOrganic.paid}%</p>
                  <p className="text-[10px] text-muted-foreground">Paid</p>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="text-center flex-1">
                  <p className="text-lg font-bold text-accent">{paidVsOrganic.organic}%</p>
                  <p className="text-[10px] text-muted-foreground">Organic</p>
                </div>
              </div>
              <Progress 
                value={paidVsOrganic.paid} 
                className="h-1.5" 
              />
            </div>
          )
        ) : (
          // Data not available - show reason
          <div className="p-3 rounded-xl border border-dashed border-border bg-muted/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              <PieChart className="h-3.5 w-3.5 text-muted-foreground" />
              <h4 className="font-semibold text-xs text-muted-foreground">Paid vs Organic</h4>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {paidVsOrganic?.reason || 'Not available via current Facebook data.'}
            </p>
          </div>
        )
      ) : (
        <div className="p-3 rounded-xl border border-border bg-muted/30 relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <h4 className="font-semibold text-xs text-muted-foreground">Paid vs Organic</h4>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Pro</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Upgrade to Pro to see paid vs organic breakdown.
          </p>
        </div>
      )}

      {/* Benchmarks - Compact */}
      {hasProAccess && benchmarks && (
        <div className="p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            <h4 className="font-semibold text-xs">Benchmarks</h4>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-muted-foreground">Posting Frequency</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">{benchmarks.postingFrequency.target}</Badge>
              </div>
              <p className="text-xs">
                <span className="font-medium">{benchmarks.postingFrequency.current}</span>
                <span className="text-muted-foreground"> posts/week</span>
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-muted-foreground">Engagement Rate</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">{benchmarks.engagementRate.range}</Badge>
              </div>
              <p className="text-xs">
                <span className="font-medium">{benchmarks.engagementRate.current}%</span>
                <span className="text-muted-foreground"> current</span>
              </p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            * Benchmarks are industry heuristics
          </p>
        </div>
      )}

      {/* Upgrade CTA for Free Users - Compact */}
      {!hasProAccess && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <h4 className="font-semibold text-xs">Unlock Full Report</h4>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2">
            Get paid/organic insights, benchmarks, creative analysis, and more.
          </p>
          <Button size="sm" className="w-full h-7 text-xs" asChild>
            <Link to="/dashboard/billing">
              Upgrade to Pro
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Link>
          </Button>
        </div>
      )}
    </aside>
  );
}
