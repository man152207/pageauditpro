import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { ScoreCard } from '@/components/ui/score-card';
import { ProBadge } from '@/components/ui/pro-badge';
import { LockedFeature } from '@/components/ui/locked-feature';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UserDashboard() {
  const { profile } = useAuth();

  // Mock data - replace with real data
  const isLoading = false;
  const stats = {
    totalAudits: 3,
    avgScore: 67,
    auditsRemaining: 2,
    lastAuditDate: '2 days ago',
  };

  const recentAudits = [
    { id: 1, pageName: 'My Business Page', score: 72, date: '2 days ago', type: 'manual' },
    { id: 2, pageName: 'Personal Brand', score: 58, date: '1 week ago', type: 'manual' },
    { id: 3, pageName: 'Test Page', score: 45, date: '2 weeks ago', type: 'manual' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'User'}! 👋`}
        description="Here's an overview of your page audits and performance."
        actions={
          <Button asChild>
            <Link to="/dashboard/audit">
              <Plus className="mr-2 h-4 w-4" />
              New Audit
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in-up">
          <StatCard
            title="Total Audits"
            value={stats.totalAudits}
            icon={BarChart3}
            description="All time audits"
            loading={isLoading}
          />
        </div>
        <div className="animate-fade-in-up stagger-1">
          <StatCard
            title="Average Score"
            value={`${stats.avgScore}/100`}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
            loading={isLoading}
          />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <StatCard
            title="Audits Remaining"
            value={stats.auditsRemaining}
            icon={Zap}
            description="This month (Free plan)"
            loading={isLoading}
          />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <StatCard
            title="Last Audit"
            value={stats.lastAuditDate}
            icon={History}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Audits */}
        <div className="interactive-card animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-semibold text-lg">Recent Audits</h2>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/dashboard/reports">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="px-6 pb-6">
            {recentAudits.length > 0 ? (
              <div className="space-y-3">
                {recentAudits.map((audit, index) => (
                  <Link
                    key={audit.id}
                    to={`/dashboard/reports/${audit.id}`}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 group hover:translate-x-1',
                      'animate-fade-in',
                      `stagger-${Math.min(index + 1, 5)}`
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                        <FileBarChart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">{audit.pageName}</p>
                        <p className="text-sm text-muted-foreground">{audit.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{audit.score}/100</p>
                      <p className="text-xs text-muted-foreground capitalize">{audit.type}</p>
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
        <div className="space-y-4 animate-fade-in-up stagger-5">
          <ScoreCard
            title="Latest Page Score"
            score={stats.avgScore}
            icon={BarChart3}
            description="Based on your most recent audit"
            trend="up"
            loading={isLoading}
          />

          {/* Pro Feature Preview */}
          <LockedFeature
            title="Facebook Auto-Connect"
            description="Connect your Facebook account to automatically fetch insights and run advanced audits."
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Connect Facebook</h3>
                  <p className="text-sm text-muted-foreground">
                    Get automatic insights from your page
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Automatic reach & impressions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Top performing posts analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Audience demographics</span>
                </div>
              </div>
            </div>
          </LockedFeature>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div 
        className="rounded-2xl p-8 lg:p-10 text-center relative overflow-hidden animate-fade-in-up" 
        style={{ background: 'var(--gradient-hero)' }}
      >
        {/* Animated background shapes */}
        <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/10 animate-float" />
        <div className="absolute bottom-4 right-4 w-16 h-16 rounded-2xl bg-white/10 animate-float stagger-2" />
        
        <div className="max-w-2xl mx-auto text-primary-foreground relative z-10">
          <ProBadge size="md" className="mb-4" glow />
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            Unlock Advanced Insights with Pro
          </h2>
          <p className="opacity-90 mb-6 max-w-lg mx-auto">
            Connect your Facebook account, get automatic insights, detailed action plans, 
            and export professional PDF reports.
          </p>
          <Button size="xl" variant="secondary" asChild className="shadow-lg">
            <Link to="/pricing">
              <Sparkles className="mr-2 h-5 w-5" />
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
