import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  AlertTriangle, 
  Target, 
  Copy, 
  Check,
  TrendingUp,
  TrendingDown,
  Lightbulb 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ExecutiveSummaryProps {
  score: number;
  scoreBreakdown: {
    engagement?: number;
    consistency?: number;
    readiness?: number;
  };
  recommendations: any[];
  aiInsights?: string | null;
  pageName?: string;
  isLoading?: boolean;
}

/**
 * Executive Summary Card (B2) - Compact Version
 * Always visible at top of report with Top Wins, Key Issues, Next Actions
 */
export function ExecutiveSummary({
  score,
  scoreBreakdown,
  recommendations,
  aiInsights,
  pageName,
  isLoading = false,
}: ExecutiveSummaryProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate summary content from available data
  const summary = useMemo(() => {
    const wins: string[] = [];
    const issues: string[] = [];
    const actions: string[] = [];

    // Analyze scores for wins/issues
    const { engagement = 0, consistency = 0, readiness = 0 } = scoreBreakdown;

    // Wins based on high scores
    if (engagement >= 70) wins.push('Strong audience engagement levels');
    if (consistency >= 70) wins.push('Good posting consistency');
    if (readiness >= 70) wins.push('Well-optimized page profile');
    if (score >= 80) wins.push('Above-average overall performance');

    // Issues based on low scores  
    if (engagement < 50) issues.push('Engagement rate needs improvement');
    if (consistency < 50) issues.push('Irregular posting schedule detected');
    if (readiness < 50) issues.push('Page profile incomplete or outdated');
    if (score < 60) issues.push('Overall score below industry average');

    // Actions from recommendations
    const highPriorityRecs = recommendations
      .filter((r: any) => r.priority === 'high')
      .slice(0, 3);
    
    highPriorityRecs.forEach((rec: any) => {
      if (rec.title) {
        actions.push(rec.title.length > 40 ? rec.title.substring(0, 40) + '...' : rec.title);
      }
    });

    // Fill with generic advice if needed
    if (wins.length === 0) wins.push('Your page has growth potential');
    if (issues.length === 0) issues.push('Minor optimizations available');
    if (actions.length === 0) {
      if (engagement < consistency) {
        actions.push('Focus on increasing post engagement');
      }
      if (consistency < engagement) {
        actions.push('Create a consistent posting schedule');
      }
      actions.push('Review detailed recommendations below');
    }

    return {
      wins: wins.slice(0, 3),
      issues: issues.slice(0, 3),
      actions: actions.slice(0, 3),
    };
  }, [score, scoreBreakdown, recommendations]);

  const handleCopySummary = async () => {
    const summaryText = `
📊 ${pageName || 'Page'} Audit Summary
━━━━━━━━━━━━━━━━━━━━━━
Overall Score: ${score}/100

✅ Top Wins:
${summary.wins.map(w => `• ${w}`).join('\n')}

⚠️ Key Issues:
${summary.issues.map(i => `• ${i}`).join('\n')}

🎯 Next Actions:
${summary.actions.map(a => `• ${a}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━
Powered by Pagelyzer
    `.trim();

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      toast({
        title: 'Summary Copied!',
        description: 'The executive summary has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      {/* Header - Compact */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h3 className="font-semibold text-base">Executive Summary</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopySummary}
          className="gap-1.5 h-8 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Content Grid - Tighter spacing */}
      <div className="p-4 sm:p-5">
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
          {/* Top Wins */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <h4 className="font-semibold text-sm text-success">Top Wins</h4>
            </div>
            <ul className="space-y-2">
              {summary.wins.map((win, i) => (
                <li key={i} className="flex items-start gap-1.5 text-sm">
                  <span className="text-success mt-0.5 text-xs">•</span>
                  <span className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{win}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Issues */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/10 text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <h4 className="font-semibold text-sm text-warning">Key Issues</h4>
            </div>
            <ul className="space-y-2">
              {summary.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-1.5 text-sm">
                  <span className="text-warning mt-0.5 text-xs">•</span>
                  <span className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{issue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Actions */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Target className="h-3.5 w-3.5" />
              </div>
              <h4 className="font-semibold text-sm text-primary">Next Actions</h4>
            </div>
            <ul className="space-y-2">
              {summary.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-1.5 text-sm">
                  <span className="text-primary mt-0.5 text-xs">•</span>
                  <span className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
