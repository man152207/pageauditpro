import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAudit } from '@/hooks/useAudits';
import { useSubscription } from '@/hooks/useSubscription';
import { usePdfExport } from '@/hooks/usePdfExport';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProBadge } from '@/components/ui/pro-badge';
import { ReportSection } from '@/components/report/ReportSection';
import { HeroScoreSection } from '@/components/report/HeroScoreSection';
import { ActionCard, ImpactLevel, EffortLevel } from '@/components/report/ActionCard';
import { EngagementChart, PostTypeChart, BestTimeHeatmap } from '@/components/report/EngagementChart';
import { ReportFilters, ReportCategory, ReportPriority } from '@/components/report/ReportFilters';
import { AiInsightsSection } from '@/components/report/AiInsightsSection';
import { DemographicsSection } from '@/components/report/DemographicsSection';
import { ShareReportDialog } from '@/components/report/ShareReportDialog';
import { ExecutiveSummary } from '@/components/report/ExecutiveSummary';
import { ScoreExplanationGrid } from '@/components/report/ScoreExplanations';
import { TopPostsTable } from '@/components/report/TopPostsTable';
import { ChartEmptyState, ChartContainer } from '@/components/report/ChartEmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LockedSection,
  MetricsPlaceholder,
  PostsPlaceholder,
  DemographicsPlaceholder,
  RecommendationsPlaceholder,
} from '@/components/report/LockedSection';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Copy,
  Download,
  FileBarChart,
  Loader2,
  MessageSquare,
  RefreshCw,
  Share2,
  Sparkles,
  Users,
  Facebook,
  Calendar,
  Lock,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function AuditReportPage() {
  const { auditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: report, isLoading, error } = useAudit(auditId);
  const { isPro } = useSubscription();
  const { exportToPdf, isExporting } = usePdfExport();

  const [categoryFilter, setCategoryFilter] = useState<ReportCategory>('all');
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority>('all');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        {/* Skeleton executive summary */}
        <Skeleton className="h-48 w-full rounded-2xl" />
        
        {/* Skeleton hero score */}
        <Skeleton className="h-72 w-full rounded-2xl" />
        
        {/* Skeleton sections */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {error?.message || 'This audit report could not be found.'}
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const hasProAccess = report.has_pro_access;
  const scores = report.score_breakdown || {};
  const recommendations = (report.recommendations || []) as any[];

  // Filter recommendations
  const filteredRecommendations = recommendations.filter((rec: any) => {
    if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && rec.priority !== priorityFilter) return false;
    return true;
  });

  const handleInsightsGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['audit', auditId] });
  };

  // Generate mock chart data (in production, this would come from the API)
  const generateEngagementData = () => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: format(date, 'MMM d'),
        value: Math.floor(Math.random() * 500) + 100,
        previousValue: Math.floor(Math.random() * 400) + 80,
      });
    }
    return data;
  };

  const postTypeData = [
    { type: 'Photos', engagement: 450, posts: 12 },
    { type: 'Videos', engagement: 820, posts: 5 },
    { type: 'Links', engagement: 180, posts: 8 },
    { type: 'Status', engagement: 95, posts: 15 },
  ];

  const heatmapData = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = [9, 12, 15, 18, 21];
    const data: { day: string; hour: number; value: number }[] = [];
    days.forEach(day => {
      hours.forEach(hour => {
        data.push({
          day,
          hour,
          value: Math.floor(Math.random() * 100),
        });
      });
    });
    return data;
  })();

  const mapPriorityToImpact = (priority: string): ImpactLevel => {
    switch (priority) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  };

  const handleCopySummary = async () => {
    const summaryText = `
📊 ${report.page_name || 'Page'} Audit Report
━━━━━━━━━━━━━━━━━━━━━━
Overall Score: ${report.score_total}/100
Engagement: ${scores.engagement || 0}/100
Consistency: ${scores.consistency || 0}/100
Readiness: ${scores.readiness || 0}/100
━━━━━━━━━━━━━━━━━━━━━━
Powered by Pagelyzer
    `.trim();

    try {
      await navigator.clipboard.writeText(summaryText);
      toast({
        title: 'Summary Copied!',
        description: 'Report summary copied to clipboard.',
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* B1: Sticky Report Header */}
      <div
        className={cn(
          'sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 transition-all duration-300',
          isScrolled && 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Page Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1877F2]/10 text-[#1877F2] shrink-0">
              <Facebook className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight truncate">
                {report.page_name || 'Audit Report'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  Audited {format(new Date(report.created_at), 'MMM d, yyyy')}
                </span>
                {report.input_summary?.dateRange && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {report.input_summary.dateRange}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {/* Copy Summary - Always available */}
            <Button variant="outline" size="sm" onClick={handleCopySummary} className="gap-2">
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Copy Summary</span>
            </Button>

            {hasProAccess ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => exportToPdf(auditId!)}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Export PDF</span>
                </Button>
                <Button size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Re-run</span>
                </Button>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" disabled className="gap-2">
                      <Lock className="h-4 w-4" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Upgrade to Pro to share reports</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" disabled className="gap-2">
                      <Lock className="h-4 w-4" />
                      <span className="hidden sm:inline">Export PDF</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Upgrade to Pro to export PDF</p>
                  </TooltipContent>
                </Tooltip>
                <Button size="sm" asChild>
                  <Link to="/dashboard/billing">
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Upgrade</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareReportDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        auditId={auditId!}
        existingShareSlug={report.report?.share_slug}
        existingIsPublic={report.report?.is_public}
      />

      {/* B2: Executive Summary Card - Always visible at top */}
      <ExecutiveSummary
        score={report.score_total || 0}
        scoreBreakdown={{
          engagement: scores.engagement || 0,
          consistency: scores.consistency || 0,
          readiness: scores.readiness || 0,
        }}
        recommendations={recommendations}
        aiInsights={report.ai_insights}
        pageName={report.page_name}
      />

      {/* Hero Score Section */}
      <HeroScoreSection
        overallScore={report.score_total || 0}
        breakdown={{
          engagement: scores.engagement || 0,
          consistency: scores.consistency || 0,
          readiness: scores.readiness || 0,
          growth: scores.growth || scores.readiness || 0,
        }}
        previousScore={undefined}
      />

      {/* B3: Score Explanations with "Why this score?" accordions */}
      <ReportSection
        title="Score Breakdown"
        description="Understand how each score is calculated"
        icon={<BarChart3 className="h-5 w-5" />}
      >
        <ScoreExplanationGrid
          breakdown={{
            engagement: scores.engagement || 0,
            consistency: scores.consistency || 0,
            readiness: scores.readiness || 0,
          }}
          detailedMetrics={report.detailed_metrics || report.detailed_metrics_preview}
          inputSummary={report.input_summary}
        />
      </ReportSection>

      {/* Filters */}
      <ReportFilters
        category={categoryFilter}
        priority={priorityFilter}
        onCategoryChange={setCategoryFilter}
        onPriorityChange={setPriorityFilter}
        showProFilters={hasProAccess}
      />

      {/* B6: Recommendations as Action Cards */}
      <ReportSection
        title="Action Plan"
        description={hasProAccess ? 'Personalized recommendations to improve your page' : 'Top recommendations for your page'}
        icon={<MessageSquare className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.slice(0, hasProAccess ? undefined : 3).map((rec: any, index: number) => (
              <ActionCard
                key={index}
                title={rec.title}
                description={rec.description}
                impact={mapPriorityToImpact(rec.priority)}
                effort={rec.effort || 'medium'}
                category={rec.category}
                steps={rec.steps || []}
                isPro={rec.isPro}
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No recommendations match your filters.
            </div>
          )}
        </div>

        {!hasProAccess && recommendations.length > 3 && (
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">
              +{recommendations.length - 3} more recommendations available with Pro
            </p>
            <Button asChild variant="outline">
              <Link to="/dashboard/billing">
                <Sparkles className="mr-2 h-4 w-4" />
                Unlock All Recommendations
              </Link>
            </Button>
          </div>
        )}
      </ReportSection>

      {/* B4: Performance Charts */}
      {hasProAccess ? (
        <ReportSection
          title="Performance Trends"
          description="Detailed engagement trends and content analysis"
          icon={<TrendingUp className="h-5 w-5" />}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {report.detailed_metrics ? (
              <>
                <EngagementChart
                  data={generateEngagementData()}
                  title="Engagement Over Time"
                  showComparison={true}
                />
                <PostTypeChart
                  data={postTypeData}
                  title="Post Type Performance"
                />
              </>
            ) : (
              <>
                <ChartEmptyState title="Engagement Over Time" chartType="line" />
                <ChartEmptyState title="Post Type Performance" chartType="bar" />
              </>
            )}
          </div>
          <div className="mt-6">
            {report.detailed_metrics ? (
              <BestTimeHeatmap
                data={heatmapData}
                title="Best Time to Post"
              />
            ) : (
              <ChartEmptyState title="Best Time to Post" chartType="heatmap" />
            )}
          </div>
        </ReportSection>
      ) : (
        <LockedSection
          title="Performance Trends"
          description="Unlock detailed charts and trend analysis"
          icon={<TrendingUp className="h-5 w-5" />}
          placeholderContent={<MetricsPlaceholder />}
        />
      )}

      {/* Basic Metrics (visible to all) */}
      {report.input_summary && (
        <ReportSection
          title="Page Overview"
          description="Basic metrics from your page"
          icon={<Users className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Followers</p>
              <p className="text-2xl font-bold">
                {report.input_summary.followers?.toLocaleString() || '—'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Posts Analyzed</p>
              <p className="text-2xl font-bold">
                {report.input_summary.postsAnalyzed || '—'}
              </p>
            </div>
          </div>
        </ReportSection>
      )}

      {/* Detailed Metrics - Show 10% preview for free users */}
      {hasProAccess && report.detailed_metrics ? (
        <ReportSection
          title="Detailed Metrics"
          description="In-depth engagement analysis"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
              <p className="text-2xl font-bold text-primary">
                {report.detailed_metrics.engagementRate?.toFixed(2)}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg. Likes/Post</p>
              <p className="text-2xl font-bold">
                {Math.round((report.detailed_metrics.totalLikes || 0) / (report.detailed_metrics.postsCount || 1))}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg. Comments/Post</p>
              <p className="text-2xl font-bold">
                {Math.round((report.detailed_metrics.totalComments || 0) / (report.detailed_metrics.postsCount || 1))}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Posts/Week</p>
              <p className="text-2xl font-bold">
                {report.detailed_metrics.postsPerWeek?.toFixed(1)}
              </p>
            </div>
          </div>
        </ReportSection>
      ) : report.detailed_metrics_preview ? (
        <ReportSection
          title="Detailed Metrics"
          description="In-depth engagement analysis"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-muted/50 border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
              <p className="text-2xl font-bold text-primary">
                {report.detailed_metrics_preview.engagementRate?.toFixed(2)}%
              </p>
            </div>
            
            <div className="col-span-1 sm:col-span-1 lg:col-span-3 relative">
              <div className="grid gap-4 sm:grid-cols-3 blur-sm pointer-events-none select-none">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Avg. Likes/Post</p>
                  <p className="text-2xl font-bold">—</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Avg. Comments/Post</p>
                  <p className="text-2xl font-bold">—</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Posts/Week</p>
                  <p className="text-2xl font-bold">—</p>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                <Button asChild size="sm">
                  <Link to="/dashboard/billing">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Unlock All Metrics
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </ReportSection>
      ) : (
        <LockedSection
          title="Detailed Metrics"
          description="Unlock in-depth engagement analysis"
          icon={<BarChart3 className="h-5 w-5" />}
          placeholderContent={<MetricsPlaceholder />}
        />
      )}

      {/* B5: Top Posts Table */}
      {hasProAccess && report.raw_metrics?.posts ? (
        <ReportSection
          title="Top Posts Analysis"
          description="Your best performing content"
          icon={<FileBarChart className="h-5 w-5" />}
        >
          <TopPostsTable posts={report.raw_metrics.posts} />
        </ReportSection>
      ) : (
        <LockedSection
          title="Top Posts Analysis"
          description="See your best performing content"
          icon={<FileBarChart className="h-5 w-5" />}
          placeholderContent={<PostsPlaceholder />}
        />
      )}

      {/* B7: AI Insights - NO REGENERATE */}
      {hasProAccess ? (
        <ReportSection
          title="AI-Powered Insights"
          description="Personalized growth strategies powered by AI"
          icon={<Sparkles className="h-5 w-5" />}
        >
          <AiInsightsSection
            auditId={auditId!}
            existingInsights={report.ai_insights || null}
            onInsightsGenerated={handleInsightsGenerated}
          />
        </ReportSection>
      ) : (
        <LockedSection
          title="AI-Powered Insights"
          description="Get personalized growth strategies powered by AI"
          icon={<Sparkles className="h-5 w-5" />}
          placeholderContent={<RecommendationsPlaceholder />}
        />
      )}

      {/* Demographics */}
      {hasProAccess ? (
        <ReportSection
          title="Audience Demographics"
          description="Understand who your audience is"
          icon={<Users className="h-5 w-5" />}
        >
          {report.demographics ? (
            <DemographicsSection demographics={report.demographics} />
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                Demographics data can take time to load from Facebook.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Please check back later or re-run the audit.
              </p>
            </div>
          )}
        </ReportSection>
      ) : (
        <LockedSection
          title="Audience Demographics"
          description="Understand who your audience is"
          icon={<Users className="h-5 w-5" />}
          placeholderContent={<DemographicsPlaceholder />}
        />
      )}

      {/* Upgrade CTA for Free Users */}
      {!hasProAccess && (
        <div className="rounded-2xl p-8 text-center bg-gradient-to-br from-primary to-primary/80">
          <div className="max-w-2xl mx-auto text-primary-foreground">
            <ProBadge size="md" className="mb-4" glow />
            <h2 className="text-2xl font-bold mb-3">
              Unlock Your Full Report
            </h2>
            <p className="opacity-90 mb-6 max-w-lg mx-auto">
              Get detailed metrics, AI-powered insights, demographic analysis, 
              and export your report as a professional PDF.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/dashboard/billing">
                <Sparkles className="mr-2 h-5 w-5" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
