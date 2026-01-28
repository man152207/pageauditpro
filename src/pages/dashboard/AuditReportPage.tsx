import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAudit } from '@/hooks/useAudits';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreCard } from '@/components/ui/score-card';
import { ProBadge } from '@/components/ui/pro-badge';
import { PageHeader } from '@/components/ui/page-header';
import { ReportSection } from '@/components/report/ReportSection';
import { ReportFilters, ReportCategory, ReportPriority } from '@/components/report/ReportFilters';
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
  CheckCircle2,
  Download,
  FileBarChart,
  Loader2,
  MessageSquare,
  Share2,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuditReportPage() {
  const { auditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading, error } = useAudit(auditId);
  const { isPro } = useSubscription();

  const [categoryFilter, setCategoryFilter] = useState<ReportCategory>('all');
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority>('all');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your report...</p>
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-muted-foreground bg-muted';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={report.page_name || 'Audit Report'}
        description={`Analyzed on ${new Date(report.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`}
        actions={
          <div className="flex items-center gap-3">
            {hasProAccess ? (
              <>
                <Button variant="outline" disabled>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link to="/pricing">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade for Full Report
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {/* Score Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          title="Overall Score"
          score={report.score_total || 0}
          icon={BarChart3}
        />
        <ScoreCard
          title="Engagement"
          score={scores.engagement || 0}
          icon={ThumbsUp}
        />
        <ScoreCard
          title="Consistency"
          score={scores.consistency || 0}
          icon={TrendingUp}
        />
        <ScoreCard
          title="Readiness"
          score={scores.readiness || 0}
          icon={Zap}
        />
      </div>

      {/* Filters */}
      <ReportFilters
        category={categoryFilter}
        priority={priorityFilter}
        onCategoryChange={setCategoryFilter}
        onPriorityChange={setPriorityFilter}
        showProFilters={hasProAccess}
      />

      {/* Recommendations (visible to all, but limited for free) */}
      <ReportSection
        title="Recommendations"
        description={hasProAccess ? 'All personalized recommendations' : 'Top recommendations for your page'}
        icon={<MessageSquare className="h-5 w-5" />}
      >
        <div className="space-y-4">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((rec: any, index: number) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border border-border',
                  'transition-colors hover:bg-muted/30'
                )}
              >
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge variant="outline" className={cn('text-xs', getPriorityColor(rec.priority))}>
                      {rec.priority}
                    </Badge>
                    {rec.isPro && <ProBadge size="sm" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recommendations match your filters.
            </p>
          )}

          {!hasProAccess && recommendations.length > 2 && (
            <div className="pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-3">
                +{recommendations.length - 2} more recommendations available with Pro
              </p>
              <Button asChild variant="outline">
                <Link to="/pricing">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Unlock All Recommendations
                </Link>
              </Button>
            </div>
          )}
        </div>
      </ReportSection>

      {/* Basic Metrics (visible to all) */}
      {report.input_summary && (
        <ReportSection
          title="Page Overview"
          description="Basic metrics from your page"
          icon={<Users className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Followers</p>
              <p className="text-2xl font-bold">
                {report.input_summary.followers?.toLocaleString() || '—'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Posts Analyzed</p>
              <p className="text-2xl font-bold">
                {report.input_summary.postsAnalyzed || '—'}
              </p>
            </div>
          </div>
        </ReportSection>
      )}

      {/* PRO SECTIONS - Locked for Free Users */}

      {/* Detailed Metrics */}
      {hasProAccess && report.detailed_metrics ? (
        <ReportSection
          title="Detailed Metrics"
          description="In-depth engagement analysis"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
              <p className="text-2xl font-bold text-primary">
                {report.detailed_metrics.engagementRate?.toFixed(2)}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Avg. Likes/Post</p>
              <p className="text-2xl font-bold">
                {Math.round((report.detailed_metrics.totalLikes || 0) / (report.detailed_metrics.postsCount || 1))}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Avg. Comments/Post</p>
              <p className="text-2xl font-bold">
                {Math.round((report.detailed_metrics.totalComments || 0) / (report.detailed_metrics.postsCount || 1))}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Posts/Week</p>
              <p className="text-2xl font-bold">
                {report.detailed_metrics.postsPerWeek?.toFixed(1)}
              </p>
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

      {/* Post Analysis */}
      {hasProAccess && report.raw_metrics?.posts ? (
        <ReportSection
          title="Top Posts Analysis"
          description="Your best performing content"
          icon={<FileBarChart className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {report.raw_metrics.posts.slice(0, 5).map((post: any, i: number) => (
              <div key={post.id || i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {post.type || 'Post'} • {new Date(post.created_time).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.likes} likes • {post.comments} comments • {post.shares} shares
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {post.likes + post.comments + post.shares}
                  </p>
                  <p className="text-xs text-muted-foreground">engagements</p>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      ) : (
        <LockedSection
          title="Top Posts Analysis"
          description="See your best performing content"
          icon={<FileBarChart className="h-5 w-5" />}
          placeholderContent={<PostsPlaceholder />}
        />
      )}

      {/* AI Insights - Always locked for demo since we don't have real AI integration */}
      <LockedSection
        title="AI-Powered Insights"
        description="Get personalized growth strategies powered by AI"
        icon={<Sparkles className="h-5 w-5" />}
        placeholderContent={<RecommendationsPlaceholder />}
      />

      {/* Demographics */}
      <LockedSection
        title="Audience Demographics"
        description="Understand who your audience is"
        icon={<Users className="h-5 w-5" />}
        placeholderContent={<DemographicsPlaceholder />}
      />

      {/* Upgrade CTA for Free Users */}
      {!hasProAccess && (
        <div className="rounded-2xl p-8 text-center bg-primary">
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
              <Link to="/pricing">
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
