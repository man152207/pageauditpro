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
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: BarChart3,
      title: 'Engagement Analysis',
      description: 'Deep dive into your likes, comments, shares, and calculate true engagement rates.',
    },
    {
      icon: TrendingUp,
      title: 'Growth Tracking',
      description: 'Monitor follower trends, identify growth patterns, and spot opportunities.',
    },
    {
      icon: Lightbulb,
      title: 'AI Recommendations',
      description: 'Get personalized suggestions to improve your content and grow your audience.',
    },
    {
      icon: FileBarChart,
      title: 'Detailed Reports',
      description: 'Export professional PDF reports to share with clients or team members.',
    },
    {
      icon: Shield,
      title: 'Data Security',
      description: 'Your data is encrypted and never shared. We take privacy seriously.',
    },
    {
      icon: Users,
      title: 'Team Features',
      description: 'Collaborate with your team, manage multiple pages, and track performance.',
    },
  ];

  const comparisonData = [
    { feature: 'Manual Page Audit', free: true, pro: true },
    { feature: 'Engagement Rate Calculation', free: true, pro: true },
    { feature: 'Basic Score (0-100)', free: true, pro: true },
    { feature: 'Basic Recommendations', free: true, pro: true },
    { feature: 'Facebook Auto-Connect', free: false, pro: true },
    { feature: 'Advanced Insights (Reach, Impressions)', free: false, pro: true },
    { feature: 'Top/Worst Posts Analysis', free: false, pro: true },
    { feature: 'Best Time to Post', free: false, pro: true },
    { feature: '7/30 Day Action Plans', free: false, pro: true },
    { feature: 'PDF Export', free: false, pro: true },
    { feature: 'Shareable Report Links', free: false, pro: true },
    { feature: 'History & Comparisons', free: false, pro: true },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Smart Facebook Page Audit Platform
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up">
              Grow Your Facebook Page with{' '}
              <span className="gradient-text">Data-Driven</span> Insights
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up">
              Get instant page health scores, engagement analysis, and AI-powered 
              recommendations to boost your Facebook presence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/audit">
                  <Zap className="mr-2 h-5 w-5" />
                  Run Free Audit
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/sample-report">
                  View Sample Report
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-muted-foreground animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm">5 free audits/month</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm">Instant results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Optimize Your Page
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful analytics and insights to help you understand your audience 
              and create better content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-border bg-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free vs Pro Comparison */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Free vs Pro Comparison
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free and upgrade when you need advanced insights and automation.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-muted/50">
                <div className="p-4 font-semibold">Feature</div>
                <div className="p-4 text-center font-semibold">Free</div>
                <div className="p-4 text-center font-semibold flex items-center justify-center gap-2">
                  <ProBadge /> Pro
                </div>
              </div>

              {/* Rows */}
              {comparisonData.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="p-4 text-sm">{row.feature}</div>
                  <div className="p-4 text-center">
                    {row.free ? (
                      <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" asChild>
                <Link to="/pricing">
                  View Full Pricing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Crown className="h-12 w-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Grow Your Facebook Page?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of page owners who use Pagelyzer to optimize their 
              content strategy and grow their audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8">
                <Link to="/audit">
                  <Zap className="mr-2 h-5 w-5" />
                  Run Free Audit Now
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/features">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
