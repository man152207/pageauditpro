import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LockedFeature } from '@/components/ui/locked-feature';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  History,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  FileBarChart,
  ArrowRight,
} from 'lucide-react';
import { format, formatDistanceToNow, startOfMonth, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const { user } = useAuth();
  const { isPro } = useSubscription();

  // Fetch all audits for timeline
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['audits', 'history', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate stats
  const thisMonthStart = startOfMonth(new Date());
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));

  const thisMonthAudits = audits.filter(
    (a) => new Date(a.created_at) >= thisMonthStart
  );
  const lastMonthAudits = audits.filter(
    (a) => new Date(a.created_at) >= lastMonthStart && new Date(a.created_at) < thisMonthStart
  );

  const thisMonthAvg = thisMonthAudits.length
    ? Math.round(
        thisMonthAudits.reduce((acc, a) => acc + (a.score_total || 0), 0) /
          thisMonthAudits.length
      )
    : 0;

  const lastMonthAvg = lastMonthAudits.length
    ? Math.round(
        lastMonthAudits.reduce((acc, a) => acc + (a.score_total || 0), 0) /
          lastMonthAudits.length
      )
    : 0;

  const scoreTrend = thisMonthAvg - lastMonthAvg;

  // Group audits by date for timeline
  const groupedAudits = audits.reduce((acc, audit) => {
    const date = format(new Date(audit.created_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(audit);
    return acc;
  }, {} as Record<string, typeof audits>);

  const sortedDates = Object.keys(groupedAudits).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Limit history for free users
  const displayDates = isPro ? sortedDates : sortedDates.slice(0, 7);
  const hasMoreHistory = !isPro && sortedDates.length > 7;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit History"
        description="Track your audit activity and performance trends over time."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Audits"
          value={audits.length}
          icon={FileBarChart}
          description="All time"
          loading={isLoading}
        />
        <StatCard
          title="This Month"
          value={thisMonthAudits.length}
          icon={Calendar}
          description={format(thisMonthStart, 'MMMM yyyy')}
          loading={isLoading}
        />
        <StatCard
          title="Avg Score (This Month)"
          value={thisMonthAvg || '—'}
          icon={BarChart3}
          trend={
            scoreTrend !== 0
              ? { value: Math.abs(scoreTrend), isPositive: scoreTrend > 0 }
              : undefined
          }
          loading={isLoading}
        />
        <StatCard
          title="Best Score"
          value={Math.max(...audits.map((a) => a.score_total || 0), 0) || '—'}
          icon={TrendingUp}
          description="All time high"
          loading={isLoading}
        />
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Activity Timeline</h2>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : displayDates.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6">
              {displayDates.map((date, dateIndex) => (
                <div key={date} className={cn('relative pl-10', dateIndex < 5 && `animate-fade-in stagger-${dateIndex + 1}`)}>
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />

                  {/* Date header */}
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {groupedAudits[date].length} audit{groupedAudits[date].length > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Audits for this date */}
                  <div className="space-y-2">
                    {groupedAudits[date].map((audit) => (
                      <Link
                        key={audit.id}
                        to={`/dashboard/reports/${audit.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                          <FileBarChart className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-primary transition-colors">
                            {audit.page_name || 'Untitled Audit'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(audit.created_at), 'h:mm a')} •{' '}
                            {audit.audit_type === 'automatic' ? 'Auto' : 'Manual'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">
                            {audit.score_total ?? '—'}
                          </span>
                          <span className="text-sm text-muted-foreground">/ 100</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="No audit history"
            description="Start running audits to build your history timeline."
            action={{ label: 'Run Audit', href: '/dashboard/audit' }}
          />
        )}

        {/* Locked History for Free Users */}
        {hasMoreHistory && (
          <LockedFeature
            title="Extended History"
            description="Upgrade to Pro to view your complete audit history and export reports."
          >
            <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/30">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                +{sortedDates.length - 7} more days of history available with Pro
              </p>
            </div>
          </LockedFeature>
        )}
      </div>
    </div>
  );
}
