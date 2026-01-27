import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { ScoreCard } from '@/components/ui/score-card';
import { ProBadge } from '@/components/ui/pro-badge';
import { LockedFeature } from '@/components/ui/locked-feature';
import {
  BarChart3,
  FileBarChart,
  History,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

export default function UserDashboard() {
  const { profile } = useAuth();

  // Mock data - replace with real data
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your page audits and performance.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/audit">
            <Plus className="mr-2 h-4 w-4" />
            New Audit
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Audits"
          value={stats.totalAudits}
          icon={BarChart3}
          description="All time audits"
        />
        <StatCard
          title="Average Score"
          value={`${stats.avgScore}/100`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Audits Remaining"
          value={stats.auditsRemaining}
          icon={Zap}
          description="This month (Free plan)"
        />
        <StatCard
          title="Last Audit"
          value={stats.lastAuditDate}
          icon={History}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Audits */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-semibold">Recent Audits</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/reports">View all</Link>
            </Button>
          </div>
          <div className="px-6 pb-6">
            {recentAudits.length > 0 ? (
              <div className="space-y-3">
                {recentAudits.map((audit) => (
                  <Link
                    key={audit.id}
                    to={`/dashboard/reports/${audit.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileBarChart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{audit.pageName}</p>
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
              <div className="text-center py-8 text-muted-foreground">
                <FileBarChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No audits yet</p>
                <Button variant="link" asChild>
                  <Link to="/dashboard/audit">Run your first audit</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Score Summary */}
        <div className="space-y-4">
          <ScoreCard
            title="Latest Page Score"
            score={stats.avgScore}
            icon={BarChart3}
            description="Based on your most recent audit"
            trend="up"
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
                  <Sparkles className="h-4 w-4" />
                  <span>Automatic reach & impressions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Top performing posts analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Audience demographics</span>
                </div>
              </div>
            </div>
          </LockedFeature>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-2xl mx-auto text-white">
          <ProBadge size="md" className="mb-4" />
          <h2 className="text-2xl font-bold mb-3">
            Unlock Advanced Insights with Pro
          </h2>
          <p className="opacity-90 mb-6">
            Connect your Facebook account, get automatic insights, detailed action plans, 
            and export professional PDF reports.
          </p>
          <Button size="lg" variant="secondary" asChild>
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
