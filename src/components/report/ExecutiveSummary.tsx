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
 * Executive Summary Card (B2)
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
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-lg">Executive Summary</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopySummary}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Summary
            </>
          )}
        </Button>
      </div>

      {/* Content Grid */}
      <div className="p-6 sm:p-8">
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {/* Top Wins */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-success">Top Wins</h4>
            </div>
            <ul className="space-y-2.5">
              {summary.wins.map((win, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-success mt-0.5">•</span>
                  <span className="text-muted-foreground">{win}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Issues */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-warning/10 text-warning">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-warning">Key Issues</h4>
            </div>
            <ul className="space-y-2.5">
              {summary.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-warning mt-0.5">•</span>
                  <span className="text-muted-foreground">{issue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Actions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-primary">Next Actions</h4>
            </div>
            <ul className="space-y-2.5">
              {summary.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-muted-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
