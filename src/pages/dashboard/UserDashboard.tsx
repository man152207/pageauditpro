import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRecentAudits, useAuditStats } from '@/hooks/useAudits';
import { useSubscription } from '@/hooks/useSubscription';
import { useSparklineData } from '@/hooks/useHistoricalScores';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { ScoreCard } from '@/components/ui/score-card';
import { ProBadge } from '@/components/ui/pro-badge';
import { LockedFeature } from '@/components/ui/locked-feature';
import { EmptyState } from '@/components/ui/empty-state';
import { Sparkline } from '@/components/ui/sparkline';
import {
  BarChart3,
  FileBarChart,
  History,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  const { profile } = useAuth();
  const { isPro, usage, planName } = useSubscription();
  
  // Real data hooks
  const { data: recentAudits = [], isLoading: auditsLoading } = useRecentAudits(5);
  const { data: stats, isLoading: statsLoading } = useAuditStats();
  
  // Real sparkline data (replaces hardcoded sample arrays)
  const { data: sparklineScores, hasData: hasSparklineData } = useSparklineData(7);

  const isLoading = auditsLoading || statsLoading;

  // Format last audit date
  const getLastAuditDisplay = () => {
    if (!stats?.lastAuditDate) return 'Never';
    try {
      return formatDistanceToNow(new Date(stats.lastAuditDate), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-accent';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-1">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground text-base">
            Here's an overview of your page audits and performance.
          </p>
        </div>
        <Button asChild size="lg" className="btn-premium shrink-0">
          <Link to="/dashboard/audit">
            <Plus className="mr-2 h-4 w-4" />
            New Audit
          </Link>
        </Button>
      </div>

      {/* Stats Grid with Sparklines */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in-up">
          <div className="stat-card group transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Total Audits</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight group-hover:text-primary transition-colors">
                  {isLoading ? '—' : stats?.totalAudits || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">All time audits</p>
              </div>
              {hasSparklineData && sparklineScores.length > 1 && (
                <Sparkline 
                  data={sparklineScores} 
                  color="primary" 
                  height={36} 
                  width={72}
                />
              )}
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-1">
          <div className="stat-card group transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Average Score</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all duration-200 group-hover:bg-accent group-hover:text-accent-foreground group-hover:scale-110">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight group-hover:text-accent transition-colors">
                  {isLoading ? '—' : stats?.avgScore ? `${stats.avgScore}` : '—'}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">Across all audits</p>
              </div>
              {hasSparklineData && sparklineScores.length > 1 && (
                <Sparkline 
                  data={sparklineScores} 
                  color="accent" 
                  height={36} 
                  width={72}
                />
              )}
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-2">
          <div className="stat-card group transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Audits Remaining</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success transition-all duration-200 group-hover:bg-success group-hover:text-success-foreground group-hover:scale-110">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight group-hover:text-success transition-colors">
                {isLoading ? '—' : isPro ? '∞' : usage.auditsRemaining}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isPro ? 'Unlimited (Pro)' : `This month (${planName})`}
              </p>
              {!isPro && !isLoading && (
                <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-success transition-all duration-500"
                    style={{ width: `${(usage.auditsRemaining / usage.auditsLimit) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-3">
          <div className="stat-card group transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Last Audit</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning transition-all duration-200 group-hover:bg-warning group-hover:text-warning-foreground group-hover:scale-110">
                <History className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight group-hover:text-warning transition-colors">
                {isLoading ? '—' : getLastAuditDisplay()}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Keep auditing regularly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Recent Audits */}
        <div className="rounded-2xl border border-border bg-card shadow-sm animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="feature-icon-primary">
                <FileBarChart className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-lg">Recent Audits</h2>
            </div>
            {recentAudits.length > 0 && (
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground gap-1">
                <Link to="/dashboard/reports">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentAudits.length > 0 ? (
              <div className="space-y-3">
                {recentAudits.map((audit, index) => (
                  <Link
                    key={audit.id}
                    to={`/dashboard/reports/${audit.id}`}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30',
                      'hover:bg-muted/60 hover:border-primary/20 transition-all duration-200 group',
                      'animate-fade-in',
                      `stagger-${Math.min(index + 1, 5)}`
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary/15 group-hover:scale-105">
                        <FileBarChart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">
                          {audit.page_name || 'Untitled Audit'}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={cn('text-xl font-bold', getScoreColor(audit.score_total))}>
                          {audit.score_total || '—'}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{audit.audit_type}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileBarChart}
                title="No audits yet"
                description="Run your first audit to see your page performance."
                action={{
                  label: 'Run your first audit',
                  href: '/dashboard/audit',
                }}
              />
            )}
          </div>
        </div>

        {/* Quick Score Summary */}
        <div className="space-y-5 animate-fade-in-up stagger-5">
          <ScoreCard
            title="Latest Page Score"
            score={recentAudits[0]?.score_total || stats?.avgScore || 0}
            icon={BarChart3}
            description={recentAudits[0] ? `From ${recentAudits[0].page_name || 'your latest audit'}` : 'Run an audit to see your score'}
            loading={isLoading}
          />

          {/* Pro Feature Preview - Only show for non-Pro users */}
          {!isPro && (
            <LockedFeature
              title="Facebook Auto-Connect"
              description="Connect your Facebook account to automatically fetch insights and run advanced audits."
            >
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1877F2]/10 text-[#1877F2]">
                    <Users className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Connect Facebook</h3>
                    <p className="text-sm text-muted-foreground">
                      Get automatic insights from your page
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  {['Automatic reach & impressions', 'Top performing posts analysis', 'Audience demographics'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </LockedFeature>
          )}

          {/* Pro user: Show connected pages status */}
          {isPro && (
            <div className="rounded-2xl border border-success/20 bg-success/5 p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Users className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Pro Features Active</h3>
                    <ProBadge size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You have access to all premium features
                  </p>
                </div>
              </div>
              <Button asChild className="w-full btn-premium">
                <Link to="/dashboard/audit">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run Pro Audit
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade CTA - Only for non-Pro users */}
      {!isPro && (
        <div 
          className="rounded-2xl p-8 lg:p-10 text-center relative overflow-hidden animate-fade-in-up bg-gradient-to-br from-primary to-primary/90" 
        >
          {/* Animated background shapes */}
          <div className="absolute top-6 left-6 w-24 h-24 rounded-full bg-primary-foreground/10 animate-float" />
          <div className="absolute bottom-6 right-6 w-20 h-20 rounded-2xl bg-primary-foreground/10 animate-float stagger-2" />
          <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full bg-primary-foreground/5 animate-float stagger-3" />
          
          <div className="max-w-2xl mx-auto text-primary-foreground relative z-10">
            <ProBadge size="md" className="mb-5" glow />
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Unlock Advanced Insights with Pro
            </h2>
            <p className="opacity-90 mb-8 max-w-lg mx-auto text-lg">
              Connect your Facebook account, get AI-powered insights, detailed action plans, 
              and export professional PDF reports.
            </p>
            <Button size="lg" variant="secondary" asChild className="shadow-xl h-12 px-8 text-base">
              <Link to="/dashboard/billing">
                <Sparkles className="mr-2 h-5 w-5" />
                Upgrade to Pro
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
