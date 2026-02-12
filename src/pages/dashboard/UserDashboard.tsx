import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRecentAudits, useAuditStats } from '@/hooks/useAudits';
import { useSubscription } from '@/hooks/useSubscription';
import { useSparklineData } from '@/hooks/useHistoricalScores';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { ScoreCard } from '@/components/ui/score-card';
import { ProBadge } from '@/components/ui/pro-badge';
import { PlanBadge } from '@/components/ui/plan-badge';
import { PlanBanner } from '@/components/ui/plan-banner';
import { LockedFeature } from '@/components/ui/locked-feature';
import { EmptyState } from '@/components/ui/empty-state';
import { Sparkline } from '@/components/ui/sparkline';
import {
  BarChart3,
  Facebook,
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
  Crown,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const { isPro, usage, planName } = useSubscription();
  
  // Real data hooks
  const { data: recentAudits = [], isLoading: auditsLoading } = useRecentAudits(5);
  const { data: stats, isLoading: statsLoading } = useAuditStats();
  
  // Real sparkline data
  const { data: sparklineScores, hasData: hasSparklineData } = useSparklineData(7);

  // Connected pages
  const [connectedPages, setConnectedPages] = useState<Array<{ id: string; page_name: string; page_id: string; connected_at: string }>>([]);
  
  useEffect(() => {
    if (!user) return;
    supabase
      .from('fb_connections')
      .select('id, page_name, page_id, connected_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('connected_at', { ascending: false })
      .then(({ data }) => {
        if (data) setConnectedPages(data);
      });
  }, [user]);

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
      {/* Welcome Header with Plan Badge */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
              </h1>
            </div>
            <PlanBadge showRenewal={true} showUsage={true} />
          </div>
          <Button asChild size="lg" className={cn("shrink-0", isPro ? "btn-premium" : "")}>
            <Link to="/dashboard/audit">
              <Plus className="mr-2 h-4 w-4" />
              New Audit
            </Link>
          </Button>
        </div>
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

      {/* Connected Pages Section */}
      {connectedPages.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm animate-fade-in-up">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
                <Facebook className="h-4 w-4" />
              </div>
              <h2 className="font-semibold">Connected Pages</h2>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground gap-1">
              <Link to="/dashboard/audit">
                Run Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="p-4 flex flex-wrap gap-3">
            {connectedPages.map((page) => (
              <Link
                key={page.id}
                to="/dashboard/audit"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/20 transition-all duration-200 group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1877F2] text-white shrink-0">
                  <Facebook className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">{page.page_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Connected
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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

          {/* Pro user: Show active features with checkmarks */}
          {isPro && (
            <div className="rounded-2xl pro-accent-border bg-card p-6 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br from-warning/10 to-transparent -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 text-warning">
                    <Crown className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Pro Features Active</h3>
                      <span className="plan-badge-pro">
                        <Crown className="h-3 w-3" />
                        PRO
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Thank you for being a Pro member!
                    </p>
                  </div>
                </div>
                
                {/* Active features list */}
                <div className="space-y-2 mb-5">
                  {[
                    'Unlimited audits',
                    'AI-powered insights',
                    'PDF export & sharing',
                    'Audience demographics',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10 text-success">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button asChild className="w-full btn-premium">
                  <Link to="/dashboard/audit">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run Pro Audit
                  </Link>
                </Button>
              </div>
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
