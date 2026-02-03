import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAudit } from '@/hooks/useAudits';
import { useSubscription } from '@/hooks/useSubscription';
import { usePdfExport } from '@/hooks/usePdfExport';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProBadge } from '@/components/ui/pro-badge';
import { ReportSection } from '@/components/report/ReportSection';
import { ReportSidebar } from '@/components/report/ReportSidebar';
import { HeroScoreSection } from '@/components/report/HeroScoreSection';
import { ActionCard, ImpactLevel, EffortLevel } from '@/components/report/ActionCard';
import { EngagementChart, PostTypeChart, BestTimeHeatmap } from '@/components/report/EngagementChart';
import { ReportFilters, ReportCategory, ReportPriority } from '@/components/report/ReportFilters';
import { AiInsightsSection } from '@/components/report/AiInsightsSection';
import { DemographicsSection } from '@/components/report/DemographicsSection';
import { ShareReportDialog } from '@/components/report/ShareReportDialog';
import { ExecutiveSummary } from '@/components/report/ExecutiveSummary';
import { ScoreExplanationGrid } from '@/components/report/ScoreExplanations';
import { PostsTabView } from '@/components/report/PostsTabView';
import { CreativePreview } from '@/components/report/CreativePreview';
import { BenchmarksCard } from '@/components/report/BenchmarksCard';
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
  Image,
  PieChart,
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
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
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
  const computedMetrics = report.detailed_metrics || {};
  const rawMetrics = report.raw_metrics || {};
  const posts = rawMetrics.posts || [];

  // Filter recommendations
  const filteredRecommendations = recommendations.filter((rec: any) => {
    if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && rec.priority !== priorityFilter) return false;
    return true;
  });

  // Extract next actions from recommendations
  const nextActions = recommendations
    .filter((r: any) => r.priority === 'high')
    .slice(0, 3)
    .map((r: any) => r.title);

  // Get paid vs organic data if available
  const paidVsOrganic = computedMetrics.paidVsOrganic || null;

  // Get benchmarks from computed metrics
  const benchmarks = computedMetrics.benchmarks || {
    postingFrequency: {
      current: computedMetrics.postsPerWeek || 0,
      target: 4,
      unit: 'posts/week',
    },
    engagementRate: {
      current: computedMetrics.engagementRate || 0,
      min: 1,
      max: 3,
    },
  };

  // Extract creatives for preview
  const creatives = posts
    .filter((p: any) => p.full_picture)
    .slice(0, 6)
    .map((p: any) => ({
      id: p.id,
      type: p.media_type || p.type || 'photo',
      thumbnail_url: p.full_picture,
      engagement: (p.likes || 0) + (p.comments || 0) + (p.shares || 0),
      permalink_url: p.permalink_url,
    }));

  const handleInsightsGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['audit', auditId] });
  };

  // Get real chart data from computed metrics - NO MOCK DATA
  const engagementTrendData = computedMetrics.engagementTrend || null;
  const hasRealEngagementData = engagementTrendData && Array.isArray(engagementTrendData) && engagementTrendData.length > 0;

  // Post type data - only use if real data exists
  const postTypeData = computedMetrics.postTypeAnalysis || null;
  const hasRealPostTypeData = postTypeData && Array.isArray(postTypeData) && postTypeData.length > 0;

  // Heatmap data - only use if real data exists
  const heatmapData = computedMetrics.bestTimeToPost || null;
  const hasRealHeatmapData = heatmapData && Array.isArray(heatmapData) && heatmapData.length > 0;

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
    <div className="w-full overflow-x-hidden">
      {/* B1: Sticky Report Header */}
      <div
        className={cn(
          'sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 transition-all duration-300',
          isScrolled && 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
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
                  {format(new Date(report.created_at), 'MMM d, yyyy')}
                </span>
                {computedMetrics.requestedRange?.preset && (
                  <Badge variant="outline" className="text-xs">
                    {computedMetrics.requestedRange.preset.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
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

      <ShareReportDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        auditId={auditId!}
        existingShareSlug={report.report?.share_slug}
        existingIsPublic={report.report?.is_public}
      />

      {/* 3-Column Layout: Main + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-5 mt-5">
        {/* Main Column */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Executive Summary */}
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

          {/* Hero Score */}
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

          {/* Score Explanations */}
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
              detailedMetrics={computedMetrics}
              inputSummary={report.input_summary}
            />
          </ReportSection>

          {/* Action Plan */}
          <ReportSection
            title="Action Plan"
            description={hasProAccess ? 'Personalized recommendations to improve your page' : 'Top recommendations for your page'}
            icon={<MessageSquare className="h-5 w-5" />}
          >
            <ReportFilters
              category={categoryFilter}
              priority={priorityFilter}
              onCategoryChange={setCategoryFilter}
              onPriorityChange={setPriorityFilter}
              showProFilters={hasProAccess}
            />
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
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

          {/* Performance Charts */}
          {hasProAccess ? (
            <ReportSection
              title="Performance Trends"
              description="Detailed engagement trends and content analysis"
              icon={<TrendingUp className="h-5 w-5" />}
            >
              <div className="grid gap-6 lg:grid-cols-2">
                {hasRealEngagementData ? (
                  <EngagementChart
                    data={engagementTrendData}
                    title="Engagement Over Time"
                    showComparison={false}
                  />
                ) : (
                  <ChartEmptyState title="Engagement Over Time" chartType="line" />
                )}
                
                {hasRealPostTypeData ? (
                  <PostTypeChart
                    data={postTypeData.map((d: any) => ({
                      type: d.type,
                      engagement: d.avgEngagement || d.engagement || 0,
                      posts: d.count || d.posts || 0,
                    }))}
                    title="Post Type Performance"
                  />
                ) : (
                  <ChartEmptyState title="Post Type Performance" chartType="bar" />
                )}
              </div>
              <div className="mt-6">
                {hasRealHeatmapData ? (
                  <BestTimeHeatmap data={heatmapData} title="Best Time to Post" />
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

          {/* Posts Analysis with Tabs */}
          {hasProAccess && posts.length > 0 ? (
            <ReportSection
              title="Posts: What Worked vs What Didn't"
              description="Analyze your best and worst performing content"
              icon={<FileBarChart className="h-5 w-5" />}
            >
              <PostsTabView posts={posts} />
            </ReportSection>
          ) : hasProAccess ? (
            <ReportSection
              title="Posts Analysis"
              description="Your post performance"
              icon={<FileBarChart className="h-5 w-5" />}
            >
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No posts available for analysis.</p>
                <p className="text-sm mt-1">Try a longer date range or run another audit later.</p>
              </div>
            </ReportSection>
          ) : (
            <LockedSection
              title="Posts Analysis"
              description="See your best and worst performing posts"
              icon={<FileBarChart className="h-5 w-5" />}
              placeholderContent={<PostsPlaceholder />}
            />
          )}

          {/* Creative Preview */}
          {hasProAccess && creatives.length > 0 && (
            <ReportSection
              title="Creative Preview"
              description="Your top performing visual content"
              icon={<Image className="h-5 w-5" />}
            >
              <CreativePreview
                creatives={creatives}
                postTypeStats={hasRealPostTypeData ? postTypeData.map((d: any) => ({
                  type: d.type,
                  avgEngagement: d.avgEngagement || d.engagement || 0,
                  count: d.count || d.posts || 0,
                })) : []}
              />
            </ReportSection>
          )}

          {/* AI Insights */}
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
        </div>

        {/* Sidebar */}
        <ReportSidebar
          hasProAccess={hasProAccess}
          overallScore={report.score_total || 0}
          breakdown={{
            engagement: scores.engagement || 0,
            consistency: scores.consistency || 0,
            readiness: scores.readiness || 0,
          }}
          nextActions={nextActions}
          paidVsOrganic={paidVsOrganic}
          benchmarks={{
            postingFrequency: {
              current: benchmarks.postingFrequency?.current || 0,
              target: `${benchmarks.postingFrequency?.target || 4}/week`,
            },
            engagementRate: {
              current: benchmarks.engagementRate?.current || 0,
              range: `${benchmarks.engagementRate?.min || 1}-${benchmarks.engagementRate?.max || 3}%`,
            },
          }}
          className="hidden lg:block"
        />
      </div>

      {/* Upgrade CTA for Free Users */}
      {!hasProAccess && (
        <div className="rounded-2xl p-8 text-center bg-gradient-to-br from-primary to-primary/80 mt-8">
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
