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
        'w-full lg:w-80 xl:w-96 shrink-0 space-y-4',
        isSticky && 'lg:sticky lg:top-24',
        className
      )}
    >
      {/* Quick Score Overview */}
      <div className="p-4 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Health Score</h4>
            <p className={cn('text-2xl font-bold', getScoreColor(overallScore))}>
              {overallScore}/100
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Engagement</span>
            <span className={cn('font-medium', getScoreColor(breakdown.engagement))}>
              {breakdown.engagement}
            </span>
          </div>
          <Progress value={breakdown.engagement} className="h-1.5" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Consistency</span>
            <span className={cn('font-medium', getScoreColor(breakdown.consistency))}>
              {breakdown.consistency}
            </span>
          </div>
          <Progress value={breakdown.consistency} className="h-1.5" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Readiness</span>
            <span className={cn('font-medium', getScoreColor(breakdown.readiness))}>
              {breakdown.readiness}
            </span>
          </div>
          <Progress value={breakdown.readiness} className="h-1.5" />
        </div>
      </div>

      {/* Next Actions */}
      {nextActions.length > 0 && (
        <div className="p-4 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Next Actions</h4>
          </div>
          <ul className="space-y-2">
            {nextActions.slice(0, 3).map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paid vs Organic Snapshot */}
      {hasProAccess ? (
        paidVsOrganic && paidVsOrganic.paid !== undefined && paidVsOrganic.organic !== undefined && (paidVsOrganic.paid > 0 || paidVsOrganic.organic > 0) ? (
          <div className="p-4 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Paid vs Organic</h4>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-center flex-1">
                <p className="text-xl font-bold text-primary">{paidVsOrganic.paid}%</p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center flex-1">
                <p className="text-xl font-bold text-accent">{paidVsOrganic.organic}%</p>
                <p className="text-xs text-muted-foreground">Organic</p>
              </div>
            </div>
            <Progress 
              value={paidVsOrganic.paid} 
              className="h-2" 
            />
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-dashed border-border bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm text-muted-foreground">Paid vs Organic</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paid vs Organic breakdown is not available for this page via current Facebook data. This typically requires ad account permissions or boosted post insights.
            </p>
          </div>
        )
      ) : (
        <div className="p-4 rounded-2xl border border-border bg-muted/30 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm text-muted-foreground">Paid vs Organic</h4>
            <Badge variant="secondary" className="text-xs">Pro</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Upgrade to Pro to see paid vs organic performance breakdown.
          </p>
        </div>
      )}

      {/* Benchmarks */}
      {hasProAccess && benchmarks && (
        <div className="p-4 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Benchmarks</h4>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Posting Frequency</span>
                <Badge variant="outline" className="text-xs">{benchmarks.postingFrequency.target}</Badge>
              </div>
              <p className="text-sm">
                <span className="font-medium">{benchmarks.postingFrequency.current}</span>
                <span className="text-muted-foreground"> posts/week</span>
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Engagement Rate</span>
                <Badge variant="outline" className="text-xs">{benchmarks.engagementRate.range}</Badge>
              </div>
              <p className="text-sm">
                <span className="font-medium">{benchmarks.engagementRate.current}%</span>
                <span className="text-muted-foreground"> current</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">
            * Benchmarks are industry heuristics
          </p>
        </div>
      )}

      {/* Upgrade CTA for Free Users */}
      {!hasProAccess && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Unlock Full Report</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Get paid/organic insights, benchmarks, creative analysis, and more.
          </p>
          <Button size="sm" className="w-full" asChild>
            <Link to="/dashboard/billing">
              Upgrade to Pro
              <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
      )}
    </aside>
  );
}
