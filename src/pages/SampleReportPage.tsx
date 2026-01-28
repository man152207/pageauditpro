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
    <div className="py-12 lg:py-20">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FileBarChart className="h-4 w-4" />
            Sample Report
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            See What Your Audit Report Looks Like
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This is an example of the comprehensive audit report you'll receive 
            when you analyze your Facebook page with Pagelyzer.
          </p>
        </div>

        {/* Report Card */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden animate-fade-in-up">
          {/* Report Header */}
          <div className="bg-primary p-6 lg:p-8 text-primary-foreground">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{pageData.name}</h2>
                  <p className="text-sm opacity-80">{pageData.url}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Audit Date</p>
                <p className="font-medium">{pageData.auditDate}</p>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="p-6 lg:p-8 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 mx-auto md:mx-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(overallScore / 100) * 352} 352`}
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{overallScore}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Overall Score: <span className={scoreInfo.color}>{scoreInfo.label}</span></h3>
                <p className="text-muted-foreground">
                  Your page is performing well but there's room for improvement. 
                  Focus on the recommendations below to boost your score.
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="p-6 lg:p-8 border-b border-border bg-muted/30">
            <h3 className="font-semibold mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric, i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border">
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className={cn('text-sm font-medium', metric.positive ? 'text-success' : 'text-destructive')}>
                    {metric.change}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="p-6 lg:p-8 border-b border-border">
            <h3 className="font-semibold mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              {scoreBreakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-40 text-sm font-medium">{item.category}</div>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-1000', item.color)}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm font-semibold">{item.score}/100</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold">Recommendations</h3>
              <ProBadge />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      rec.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                    )}>
                      <rec.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center animate-fade-in-up">
          <h3 className="text-xl font-semibold mb-3">Ready to Audit Your Page?</h3>
          <p className="text-muted-foreground mb-6">
            Get your personalized report with actionable recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/audit">
                <Zap className="mr-2 h-5 w-5" />
                Run Free Audit
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/pricing">
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
