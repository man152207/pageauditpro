import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Crown,
  Download,
  FileBarChart,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SampleReportPage() {
  // Mock report data
  const pageData = {
    name: 'Example Business Page',
    url: 'facebook.com/examplebusiness',
    followers: 12450,
    likes: 11200,
    auditDate: 'January 28, 2026',
  };

  const overallScore = 72;

  const scoreBreakdown = [
    { category: 'Profile Completeness', score: 85, maxScore: 100, color: 'bg-success' },
    { category: 'Engagement Rate', score: 68, maxScore: 100, color: 'bg-accent' },
    { category: 'Posting Frequency', score: 72, maxScore: 100, color: 'bg-accent' },
    { category: 'Content Quality', score: 65, maxScore: 100, color: 'bg-warning' },
    { category: 'Audience Growth', score: 70, maxScore: 100, color: 'bg-accent' },
  ];

  const recommendations = [
    {
      icon: Target,
      title: 'Increase Posting Frequency',
      description: 'Post at least 5 times per week to maintain audience engagement.',
      priority: 'high',
    },
    {
      icon: MessageSquare,
      title: 'Improve Response Time',
      description: 'Aim to respond to comments within 2 hours for better engagement.',
      priority: 'high',
    },
    {
      icon: Lightbulb,
      title: 'Diversify Content Types',
      description: 'Add more video content - videos get 3x more engagement than images.',
      priority: 'medium',
    },
    {
      icon: TrendingUp,
      title: 'Optimize Posting Time',
      description: 'Your audience is most active between 6-9 PM. Schedule posts accordingly.',
      priority: 'medium',
    },
  ];

  const metrics = [
    { label: 'Total Followers', value: '12,450', change: '+5.2%', positive: true },
    { label: 'Engagement Rate', value: '3.4%', change: '+0.8%', positive: true },
    { label: 'Avg. Post Reach', value: '2,340', change: '-2.1%', positive: false },
    { label: 'Posts This Month', value: '18', change: '+12%', positive: true },
  ];

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-success' };
    if (score >= 60) return { label: 'Good', color: 'text-accent' };
    if (score >= 40) return { label: 'Average', color: 'text-warning' };
    return { label: 'Needs Work', color: 'text-destructive' };
  };

  const scoreInfo = getScoreLabel(overallScore);

  return (
    <div className="py-10 sm:py-14 lg:py-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <FileBarChart className="h-3.5 w-3.5" />
            Sample Report
          </div>
          <h1 className="mb-2">
            See What Your Audit Report Looks Like
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            This is an example of the comprehensive audit report you'll receive 
            when you analyze your Facebook page with Pagelyzer.
          </p>
        </div>

        {/* Report Card */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden animate-fade-in-up">
          {/* Report Header */}
          <div className="bg-primary p-5 sm:p-6 text-primary-foreground">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-primary-foreground">{pageData.name}</h3>
                  <p className="text-xs opacity-80">{pageData.url}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-80">Audit Date</p>
                <p className="text-sm font-medium">{pageData.auditDate}</p>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="p-5 sm:p-6 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24 mx-auto md:mx-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(overallScore / 100) * 264} 264`}
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{overallScore}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="mb-1">Overall Score: <span className={scoreInfo.color}>{scoreInfo.label}</span></h3>
                <p className="text-sm text-muted-foreground">
                  Your page is performing well but there's room for improvement. 
                  Focus on the recommendations below to boost your score.
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="p-5 sm:p-6 border-b border-border bg-muted/30">
            <h4 className="mb-3">Key Metrics</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.map((metric, i) => (
                <div key={i} className="p-3 rounded-lg bg-card border border-border">
                  <p className="text-xs text-muted-foreground mb-0.5">{metric.label}</p>
                  <p className="text-xl font-bold">{metric.value}</p>
                  <p className={cn('text-xs font-medium', metric.positive ? 'text-success' : 'text-destructive')}>
                    {metric.change}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="p-5 sm:p-6 border-b border-border">
            <h4 className="mb-3">Score Breakdown</h4>
            <div className="space-y-3">
              {scoreBreakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-32 sm:w-36 text-xs font-medium">{item.category}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-1000', item.color)}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-xs font-semibold">{item.score}/100</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <h4>Recommendations</h4>
              <ProBadge />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                      rec.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                    )}>
                      <rec.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-0.5">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 sm:mt-10 text-center animate-fade-in-up">
          <h3 className="mb-2">Ready to Audit Your Page?</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Get your personalized report with actionable recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/audit">
                <Zap className="mr-2 h-4 w-4" />
                Run Free Audit
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
