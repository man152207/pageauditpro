import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Crown,
  Facebook,
  FileBarChart,
  Lightbulb,
  LineChart,
  Lock,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

export default function FeaturesPage() {
  const freeFeatures = [
    {
      icon: BarChart3,
      title: 'Manual Page Audit',
      description: 'Enter your page data manually and get instant scores and recommendations.',
    },
    {
      icon: TrendingUp,
      title: 'Engagement Rate',
      description: 'Calculate your true engagement rate based on likes, comments, and shares.',
    },
    {
      icon: LineChart,
      title: 'Score Breakdown',
      description: 'Get a detailed breakdown of your page health across multiple dimensions.',
    },
    {
      icon: Lightbulb,
      title: 'Basic Recommendations',
      description: 'Receive actionable tips to improve your page performance.',
    },
  ];

  const proFeatures = [
    {
      icon: Facebook,
      title: 'Facebook Auto-Connect',
      description: 'Connect your Facebook account and automatically fetch insights data.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Metrics',
      description: 'Access reach, impressions, follower growth, and audience demographics.',
    },
    {
      icon: Sparkles,
      title: 'AI Recommendations',
      description: 'Get personalized AI-powered suggestions for hooks, captions, and CTAs.',
    },
    {
      icon: FileBarChart,
      title: 'Top/Worst Posts',
      description: 'Identify your best and worst performing posts with detailed analysis.',
    },
    {
      icon: TrendingUp,
      title: 'Best Time to Post',
      description: 'Discover when your audience is most active for maximum engagement.',
    },
    {
      icon: Users,
      title: 'Audience Insights',
      description: 'Understand your audience demographics and tailor content accordingly.',
    },
    {
      icon: FileBarChart,
      title: 'Action Plans',
      description: 'Get 7-day and 30-day strategic plans to improve your page.',
    },
    {
      icon: Share2,
      title: 'Export & Share',
      description: 'Download PDF reports and share with clients via unique links.',
    },
  ];

  return (
    <div className="py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for Every Need
          </h1>
          <p className="text-lg text-muted-foreground">
            From basic audits to advanced AI-powered insights, we have everything 
            you need to grow your Facebook presence.
          </p>
        </div>

        {/* Free Features */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Free Features</h2>
              <p className="text-muted-foreground">Get started without a credit card</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {freeFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-card-hover transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Features */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Crown className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Pro Features</h2>
              <ProBadge />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {proFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-card-hover hover:border-primary/20 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Try our free audit first, then upgrade when you need more.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/audit">
                <Zap className="mr-2 h-5 w-5" />
                Run Free Audit
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/pricing">
                View Pricing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
