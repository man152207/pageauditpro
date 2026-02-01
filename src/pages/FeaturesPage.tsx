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
    <div className="py-12 sm:py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h1 className="mb-3">
            Powerful Features for Every Need
          </h1>
          <p className="text-muted-foreground">
            From basic audits to advanced AI-powered insights, we have everything 
            you need to grow your Facebook presence.
          </p>
        </div>

        {/* Free Features */}
        <div className="mb-12 sm:mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="feature-icon-success">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2>Free Features</h2>
              <p className="text-sm text-muted-foreground">Get started without a credit card</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {freeFeatures.map((feature, index) => (
              <div
                key={index}
                className="premium-card"
              >
                <div className="feature-icon-success mb-3">
                  <feature.icon className="h-4 w-4" />
                </div>
                <h4 className="font-semibold mb-1.5">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Features */}
        <div className="mb-12 sm:mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="feature-icon-primary">
              <Crown className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <h2>Pro Features</h2>
              <ProBadge />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {proFeatures.map((feature, index) => (
              <div
                key={index}
                className="premium-card"
              >
                <div className="feature-icon-primary mb-3">
                  <feature.icon className="h-4 w-4" />
                </div>
                <h4 className="font-semibold mb-1.5">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <h3 className="mb-2">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-5">
            Try our free audit first, then upgrade when you need more.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/audit">
                <Zap className="mr-2 h-4 w-4" />
                Run Free Audit
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/pricing">
                View Pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
