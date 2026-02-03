import { PageHeader } from '@/components/ui/page-header';
import { AuditFlow } from '@/components/audit/AuditFlow';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileBarChart, Sparkles, Calendar, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ManualAuditPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Run Facebook Page Audit"
        description="Connect your Facebook page to analyze engagement, content performance, and get personalized recommendations."
        className="mb-8"
        actions={
          <Button variant="outline" asChild>
            <Link to="/sample-report">
              <FileBarChart className="mr-2 h-4 w-4" />
              View Sample Report
            </Link>
          </Button>
        }
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Main content - Audit Flow */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <AuditFlow />
          </div>
        </div>

        {/* Sidebar - Tips & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Range Info (C1/C2) */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">Date Range Tips</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  1
                </span>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Quick picks:</strong> 7D, 30D, 3M, 6M available
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  2
                </span>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">30 days+</strong> gives better trend accuracy
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  3
                </span>
                <span className="text-muted-foreground">
                  Custom range available for specific periods
                </span>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-background/50 border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                <span>Tip: Longer ranges provide more accurate insights</span>
              </div>
            </div>
          </div>

          {/* What you'll get */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">What You'll Get</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Overall health score (0-100)',
                'Engagement rate analysis',
                'Posting consistency insights',
                'Personalized recommendations',
                'Actionable improvement steps',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success text-xs font-semibold">
                    ✓
                  </span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro features callout */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="pro-badge text-xs">PRO</span>
              <h4 className="font-semibold">Pro Features</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• AI-powered growth strategies</li>
              <li>• Detailed audience demographics</li>
              <li>• Best time to post analysis</li>
              <li>• PDF export & shareable links</li>
            </ul>
            <Button className="w-full mt-4" variant="outline" size="sm" asChild>
              <Link to="/dashboard/billing">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>

          {/* Help tip */}
          <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">💡 Tip</p>
            <p>
              For best results, make sure your Facebook page has at least 10 posts 
              and is at least 30 days old.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
