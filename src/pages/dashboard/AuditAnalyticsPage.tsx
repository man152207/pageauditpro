import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LockedFeature } from '@/components/ui/locked-feature';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  BarChart3,
  Calendar as CalendarIcon,
  CheckCircle2,
  Download,
  FileBarChart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Filter,
  PieChart,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { format, subDays, subMonths, startOfDay, endOfDay, isWithinInterval, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type DateRange = { from: Date; to: Date };
type QuickFilter = 'week' | 'month' | '3m' | '6m';

const QUICK_FILTERS: { key: QuickFilter; label: string; days: number }[] = [
  { key: 'week', label: 'Last 7 Days', days: 7 },
  { key: 'month', label: 'Last 30 Days', days: 30 },
  { key: '3m', label: 'Last 3 Months', days: 90 },
  { key: '6m', label: 'Last 6 Months', days: 180 },
];

const CHART_COLORS = [
  'hsl(214, 89%, 52%)',  // primary
  'hsl(168, 76%, 42%)',  // accent/teal
  'hsl(142, 71%, 45%)',  // success
  'hsl(38, 92%, 50%)',   // warning
  'hsl(262, 83%, 58%)',  // purple
];

const STATUS_COLORS: Record<string, string> = {
  excellent: 'hsl(142, 71%, 45%)',
  good: 'hsl(168, 76%, 42%)',
  average: 'hsl(38, 92%, 50%)',
  poor: 'hsl(0, 84%, 60%)',
};

export default function AuditAnalyticsPage() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  
  const [filterMode, setFilterMode] = useState<'quick' | 'custom'>('quick');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('month');
  const [customRange, setCustomRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Calculate the active date range
  const dateRange = useMemo((): DateRange => {
    if (filterMode === 'quick') {
      const filter = QUICK_FILTERS.find(f => f.key === quickFilter);
      return {
        from: subDays(new Date(), filter?.days || 30),
        to: new Date(),
      };
    }
    return customRange;
  }, [filterMode, quickFilter, customRange]);

  // Fetch audits
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['audits', 'analytics', user?.id],
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

  // Earliest auditable date
  const earliestAuditableDate = useMemo(() => {
    if (audits.length === 0) return subMonths(new Date(), 6);
    const dates = audits.map(a => new Date(a.created_at));
    return new Date(Math.min(...dates.map(d => d.getTime())));
  }, [audits]);

  // Filter audits by date range
  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      const auditDate = new Date(audit.created_at);
      return isWithinInterval(auditDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      });
    });
  }, [audits, dateRange]);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (filteredAudits.length === 0) {
      return {
        totalAudits: 0,
        avgScore: 0,
        flaggedCount: 0,
        passRate: 0,
        scoreTrend: 0,
        bestScore: 0,
        worstScore: 0,
      };
    }

    const scores = filteredAudits.map(a => a.score_total || 0).filter(s => s > 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestScore = Math.max(...scores, 0);
    const worstScore = Math.min(...scores.filter(s => s > 0), 100);
    
    // Calculate flagged (score < 50)
    const flaggedCount = scores.filter(s => s < 50).length;
    const passRate = scores.length ? Math.round((scores.filter(s => s >= 60).length / scores.length) * 100) : 0;

    // Calculate trend (compare first half to second half of period)
    const midpoint = Math.floor(filteredAudits.length / 2);
    const firstHalf = filteredAudits.slice(midpoint);
    const secondHalf = filteredAudits.slice(0, midpoint);
    
    const firstHalfAvg = firstHalf.length 
      ? firstHalf.reduce((a, b) => a + (b.score_total || 0), 0) / firstHalf.length 
      : 0;
    const secondHalfAvg = secondHalf.length 
      ? secondHalf.reduce((a, b) => a + (b.score_total || 0), 0) / secondHalf.length 
      : 0;
    const scoreTrend = Math.round(secondHalfAvg - firstHalfAvg);

    return {
      totalAudits: filteredAudits.length,
      avgScore,
      flaggedCount,
      passRate,
      scoreTrend,
      bestScore,
      worstScore,
    };
  }, [filteredAudits]);

  // Prepare time-series data for chart
  const timeSeriesData = useMemo(() => {
    const grouped: Record<string, { date: string; score: number; count: number }> = {};
    
    filteredAudits.forEach(audit => {
      const date = format(new Date(audit.created_at), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = { date, score: 0, count: 0 };
      }
      grouped[date].score += audit.score_total || 0;
      grouped[date].count += 1;
    });

    return Object.values(grouped)
      .map(d => ({
        date: format(new Date(d.date), 'MMM d'),
        fullDate: d.date,
        avgScore: Math.round(d.score / d.count),
        audits: d.count,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [filteredAudits]);

  // Category breakdown (by audit type)
  const categoryBreakdown = useMemo(() => {
    const manual = filteredAudits.filter(a => a.audit_type === 'manual').length;
    const automatic = filteredAudits.filter(a => a.audit_type === 'automatic').length;
    
    return [
      { name: 'Manual Audits', value: manual, color: CHART_COLORS[0] },
      { name: 'Auto Audits', value: automatic, color: CHART_COLORS[1] },
    ].filter(d => d.value > 0);
  }, [filteredAudits]);

  // Score distribution
  const scoreDistribution = useMemo(() => {
    const distribution = {
      excellent: 0, // 80-100
      good: 0,      // 60-79
      average: 0,   // 40-59
      poor: 0,      // 0-39
    };

    filteredAudits.forEach(audit => {
      const score = audit.score_total || 0;
      if (score >= 80) distribution.excellent++;
      else if (score >= 60) distribution.good++;
      else if (score >= 40) distribution.average++;
      else distribution.poor++;
    });

    return [
      { name: 'Excellent (80+)', value: distribution.excellent, color: STATUS_COLORS.excellent },
      { name: 'Good (60-79)', value: distribution.good, color: STATUS_COLORS.good },
      { name: 'Average (40-59)', value: distribution.average, color: STATUS_COLORS.average },
      { name: 'Needs Work (<40)', value: distribution.poor, color: STATUS_COLORS.poor },
    ].filter(d => d.value > 0);
  }, [filteredAudits]);

  // Score breakdown metrics
  const scoreBreakdownData = useMemo(() => {
    if (filteredAudits.length === 0) return [];

    const totals = { engagement: 0, consistency: 0, readiness: 0, content: 0 };
    let count = 0;

    filteredAudits.forEach(audit => {
      const breakdown = audit.score_breakdown as Record<string, number> | null;
      if (breakdown) {
        totals.engagement += breakdown.engagement || 0;
        totals.consistency += breakdown.consistency || 0;
        totals.readiness += breakdown.readiness || 0;
        totals.content += breakdown.content || 0;
        count++;
      }
    });

    if (count === 0) return [];

    return [
      { name: 'Engagement', score: Math.round(totals.engagement / count), fill: CHART_COLORS[0] },
      { name: 'Consistency', score: Math.round(totals.consistency / count), fill: CHART_COLORS[1] },
      { name: 'Readiness', score: Math.round(totals.readiness / count), fill: CHART_COLORS[2] },
      { name: 'Content', score: Math.round(totals.content / count), fill: CHART_COLORS[3] },
    ].filter(d => d.score > 0);
  }, [filteredAudits]);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredAudits.length === 0) {
      toast.error('No audits to export');
      return;
    }

    const headers = ['Date', 'Time', 'Page Name', 'Overall Score', 'Engagement', 'Consistency', 'Readiness', 'Audit Type', 'Status'];
    const rows = filteredAudits.map(a => {
      const scoreBreakdown = a.score_breakdown as Record<string, number> || {};
      const score = a.score_total || 0;
      const status = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Needs Work';
      return [
        format(new Date(a.created_at), 'yyyy-MM-dd'),
        format(new Date(a.created_at), 'HH:mm'),
        `"${a.page_name || 'Untitled'}"`,
        score,
        scoreBreakdown.engagement || 0,
        scoreBreakdown.consistency || 0,
        scoreBreakdown.readiness || 0,
        a.audit_type,
        status,
      ];
    });
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-analytics-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics exported successfully!');
  };

  const daysInRange = differenceInDays(dateRange.to, dateRange.from) + 1;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Audit Analytics"
        description={`Data available from ${format(earliestAuditableDate, 'MMM d, yyyy')} to today`}
        actions={
          filteredAudits.length > 0 && (
            <Button variant="outline" onClick={exportToCSV} className="btn-ripple">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )
        }
      />

      {/* Date Range Filter */}
      <Card className="animate-fade-in">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>

            <Tabs value={filterMode} onValueChange={(v) => setFilterMode(v as 'quick' | 'custom')} className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <TabsList className="h-9">
                  <TabsTrigger value="quick" className="text-xs">Quick</TabsTrigger>
                  <TabsTrigger value="custom" className="text-xs">Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="quick" className="mt-0 flex flex-wrap gap-2">
                  {QUICK_FILTERS.map((filter) => (
                    <Button
                      key={filter.key}
                      variant={quickFilter === filter.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuickFilter(filter.key)}
                      className="h-8 text-xs transition-all"
                    >
                      {filter.label}
                    </Button>
                  ))}
                </TabsContent>

                <TabsContent value="custom" className="mt-0 flex flex-wrap items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {format(customRange.from, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customRange.from}
                        onSelect={(date) => date && setCustomRange(prev => ({ ...prev, from: date }))}
                        disabled={(date) => date > new Date() || date < earliestAuditableDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-muted-foreground text-xs">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {format(customRange.to, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customRange.to}
                        onSelect={(date) => date && setCustomRange(prev => ({ ...prev, to: date }))}
                        disabled={(date) => date > new Date() || date < customRange.from}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </TabsContent>
              </div>
            </Tabs>

            <Badge variant="secondary" className="shrink-0">
              <Clock className="mr-1.5 h-3 w-3" />
              {daysInRange} day{daysInRange !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      ) : filteredAudits.length > 0 ? (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Audits"
              value={stats.totalAudits}
              icon={FileBarChart}
              description={`In ${daysInRange} days`}
              className="animate-fade-in-up stagger-1 card-hover-lift"
            />
            <StatCard
              title="Average Score"
              value={stats.avgScore || '—'}
              icon={Target}
              trend={
                stats.scoreTrend !== 0
                  ? { value: Math.abs(stats.scoreTrend), isPositive: stats.scoreTrend > 0 }
                  : undefined
              }
              className="animate-fade-in-up stagger-2 card-hover-lift"
            />
            <StatCard
              title="Pass Rate"
              value={`${stats.passRate}%`}
              icon={CheckCircle2}
              description="Score ≥ 60"
              className="animate-fade-in-up stagger-3 card-hover-lift"
            />
            <StatCard
              title="Flagged Issues"
              value={stats.flaggedCount}
              icon={AlertTriangle}
              description="Score < 50"
              className="animate-fade-in-up stagger-4 card-hover-lift"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Time Series Chart */}
            <Card className="animate-fade-in-up stagger-3 card-hover-glow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  Score Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Average score over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timeSeriesData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={timeSeriesData}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(214, 89%, 52%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(214, 89%, 52%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="avgScore"
                        stroke="hsl(214, 89%, 52%)"
                        strokeWidth={2}
                        fill="url(#scoreGradient)"
                        name="Avg Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    Need more data points to display trend
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Breakdown Bar Chart */}
            <Card className="animate-fade-in-up stagger-4 card-hover-glow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Average by Category
                </CardTitle>
                <CardDescription className="text-xs">
                  Score breakdown across metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scoreBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={scoreBreakdownData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]} className="chart-bar-enter">
                        {scoreBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    No category data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Second Row of Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Score Distribution Pie */}
            <Card className="animate-fade-in-up stagger-5 card-hover-glow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChart className="h-4 w-4 text-primary" />
                  Score Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Audit performance breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scoreDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsPieChart>
                      <Pie
                        data={scoreDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    No score data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audit Type Distribution */}
            <Card className="animate-fade-in-up stagger-6 card-hover-glow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Audit Types
                </CardTitle>
                <CardDescription className="text-xs">
                  Manual vs Automatic audits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    No type data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid gap-3 sm:grid-cols-3 animate-fade-in-up">
            <div className="rounded-lg border bg-card p-4 flex items-center gap-3 card-hover-lift">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="text-xl font-bold">{stats.bestScore || '—'}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4 flex items-center gap-3 card-hover-lift">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lowest Score</p>
                <p className="text-xl font-bold">{stats.worstScore === 100 ? '—' : stats.worstScore}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4 flex items-center gap-3 card-hover-lift">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                stats.scoreTrend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                {stats.scoreTrend >= 0 ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownRight className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score Trend</p>
                <p className="text-xl font-bold">
                  {stats.scoreTrend >= 0 ? '+' : ''}{stats.scoreTrend} pts
                </p>
              </div>
            </div>
          </div>

          {/* Pro Feature Lock */}
          {!isPro && (
            <LockedFeature
              title="Advanced Analytics"
              description="Upgrade to Pro to unlock detailed insights, AI recommendations, and extended history."
            >
              <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/30">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Advanced trend analysis and AI insights available with Pro
                </p>
              </div>
            </LockedFeature>
          )}
        </>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="No audits in this period"
          description="Run some audits to see analytics and insights here."
          action={{ label: 'Run Audit', href: '/dashboard/audit' }}
          className="animate-fade-in"
        />
      )}
    </div>
  );
}
