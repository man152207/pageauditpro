import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  Facebook,
  FileBarChart,
  Globe,
  Lightbulb,
  Lock,
  MessageSquare,
  MousePointerClick,
  Share2,
  Shield,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function HomePage() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Boost Engagement',
      description: 'Understand what content resonates with your audience.',
    },
    {
      icon: Target,
      title: 'Smart Insights',
      description: 'AI-powered analysis with actionable recommendations.',
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Get comprehensive audits in seconds, not hours.',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Monitor your page health and celebrate improvements.',
    },
    {
      icon: FileBarChart,
      title: 'Pro Reports',
      description: 'Export beautiful PDF reports for clients.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and never shared.',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Connect Page',
      description: 'Securely connect your Facebook page',
    },
    {
      step: 2,
      title: 'Get Analysis',
      description: 'AI analyzes your engagement patterns',
    },
    {
      step: 3,
      title: 'Take Action',
      description: 'Follow recommendations to grow faster',
    },
  ];

  const metrics = [
    { icon: ThumbsUp, label: 'Engagement Rate' },
    { icon: TrendingUp, label: 'Growth Trends' },
    { icon: MessageSquare, label: 'Comment Analysis' },
    { icon: Share2, label: 'Share Performance' },
    { icon: Clock, label: 'Best Posting Times' },
    { icon: Users, label: 'Audience Insights' },
    { icon: Globe, label: 'Reach Analysis' },
    { icon: MousePointerClick, label: 'Click Tracking' },
  ];

  const recommendations = [
    { title: 'Increase posting frequency', impact: 'High', difficulty: 'Easy' },
    { title: 'Add more video content', impact: 'High', difficulty: 'Medium' },
    { title: 'Respond to comments faster', impact: 'Medium', difficulty: 'Easy' },
    { title: 'Optimize post timing', impact: 'Medium', difficulty: 'Easy' },
    { title: 'Use more CTAs', impact: 'High', difficulty: 'Easy' },
    { title: 'Analyze competitor content', impact: 'Medium', difficulty: 'Medium' },
  ];

  const useCases = [
    {
      icon: Users,
      title: 'Marketing Agencies',
      description: 'Deliver professional audits to impress your clients.',
    },
    {
      icon: Crown,
      title: 'Brand Managers',
      description: 'Track performance across multiple pages.',
    },
    {
      icon: Sparkles,
      title: 'Content Creators',
      description: 'Create content that converts and grows.',
    },
  ];

  const securityFeatures = [
    { icon: Lock, title: 'Read-Only Access', description: 'We never post or modify your page.' },
    { icon: Shield, title: 'Encrypted Data', description: 'Industry-standard encryption protocols.' },
    { icon: Globe, title: 'GDPR Compliant', description: 'Full privacy regulation compliance.' },
  ];

  const faqs = [
    { q: 'Is Pagelyzer free to use?', a: 'Yes! 3 free audits per month. Upgrade to Pro for unlimited audits and advanced features.' },
    { q: 'How do I connect my Facebook page?', a: 'Click "Connect Facebook" and authorize. Select your page and you\'re done!' },
    { q: 'What data do you access?', a: 'Only public page info, post metrics, and engagement data. Never private messages.' },
    { q: 'Can I analyze competitor pages?', a: 'You can only analyze pages you manage with admin access.' },
    { q: 'How often should I run an audit?', a: 'We recommend at least once a month to track progress.' },
    { q: 'What makes Pagelyzer different?', a: 'AI-powered actionable recommendations, not just data dashboards.' },
    { q: 'Can I export reports?', a: 'Yes! Pro users can export PDF reports and share via public links.' },
    { q: 'Do you support Instagram?', a: 'Currently Facebook only. Instagram support coming in 2025.' },
  ];

  const comparisonData = [
    { feature: 'Manual Page Audit', free: true, pro: true },
    { feature: 'Basic Score (0-100)', free: true, pro: true },
    { feature: 'Basic Recommendations', free: true, pro: true },
    { feature: 'Facebook Auto-Connect', free: false, pro: true },
    { feature: 'AI-Powered Insights', free: false, pro: true },
    { feature: 'PDF Export', free: false, pro: true },
    { feature: 'Shareable Report Links', free: false, pro: true },
    { feature: 'History & Comparisons', free: false, pro: true },
  ];

  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Sample Report', href: '/sample-report' },
    ],
    resources: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
    company: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Data Deletion', href: '/data-deletion' },
    ],
  };

  return (
    <div className="flex flex-col overflow-hidden">
      {/* ========== HERO ========== */}
      <section className="relative py-12 sm:py-16 md:py-20 hero-pattern">
        {/* Floating orbs */}
        <div className="floating-orb w-[300px] h-[300px] bg-primary/20 -top-20 -left-20" />
        <div className="floating-orb w-[250px] h-[250px] bg-accent/15 -bottom-10 -right-10" style={{ animationDelay: '2s' }} />

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5 animate-fade-in border border-primary/20">
                <Facebook className="h-4 w-4" />
                Free Facebook Page Audit
              </div>

              <h1 className="mb-4 sm:mb-5 animate-fade-in-up text-balance">
                Grow Your Page with{' '}
                <span className="gradient-text">AI Insights</span>
              </h1>

              <p className="text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in-up stagger-1 text-pretty">
                Get instant health scores, engagement analysis, and personalized recommendations to boost your Facebook presence.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up stagger-2">
                <Button size="lg" asChild className="btn-glow text-base h-12">
                  <Link to="/dashboard/audit">
                    <Facebook className="mr-2 h-5 w-5" />
                    Connect & Run Audit
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base h-12">
                  <Link to="/sample-report">
                    <Play className="mr-2 h-4 w-4" />
                    View Sample
                  </Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-muted-foreground animate-fade-in stagger-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">GDPR Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Agency Friendly</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative animate-fade-in-up stagger-2 hidden lg:block">
              <div className="relative rounded-2xl border border-border bg-card p-3 shadow-xl">
                <div className="rounded-xl bg-muted/30 p-5 vector-dots">
                  {/* Mock dashboard */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="h-4 w-24 bg-muted rounded" />
                    </div>
                    <div className="badge-success text-xs">Live</div>
                  </div>
                  
                  {/* Score cards */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[{ score: 85, label: 'Overall' }, { score: 72, label: 'Engagement' }, { score: 91, label: 'Growth' }].map((item, i) => (
                      <div key={i} className="rounded-lg bg-card border border-border p-3 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-primary">{item.score}</div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chart placeholder */}
                  <div className="h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-end justify-around p-3">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-4 bg-primary/40 rounded-t transition-all hover:bg-primary"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-3 -left-3 bg-card border border-border rounded-xl p-3 shadow-lg animate-bounce-soft">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-success/15 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">+23%</div>
                    <div className="text-xs text-muted-foreground">This month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BENEFITS ========== */}
      <section className="section bg-muted/30">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-3">Why Pagelyzer</div>
            <h2>Everything You Need to Grow</h2>
            <p>Powerful analytics and AI insights for your Facebook page.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group premium-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="feature-icon-primary mb-4">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold mb-1.5">{benefit.title}</h4>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-3">Simple Process</div>
            <h2>How It Works</h2>
            <p>Get your first audit in under 2 minutes.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 md:gap-3">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                  <div className="step-number mx-auto mb-3 relative z-10">{step.step}</div>
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHAT WE ANALYZE ========== */}
      <section className="section-tight bg-muted/30">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-3">Comprehensive Analysis</div>
            <h2>What We Analyze</h2>
            <p>Deep dive into your Facebook page performance.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="group interactive-card p-4 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="feature-icon-primary mx-auto mb-2 h-10 w-10">
                  <metric.icon className="h-4 w-4" />
                </div>
                <div className="font-medium text-sm">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== RECOMMENDATIONS PREVIEW ========== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-3">Actionable Insights</div>
            <h2>Sample Recommendations</h2>
            <p>Here's a preview of insights you'll receive.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="interactive-card p-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <div className="flex gap-1.5 shrink-0">
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      rec.impact === 'High' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    )}>
                      {rec.impact}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  'text-xs font-medium',
                  rec.difficulty === 'Easy' ? 'text-accent' : 'text-muted-foreground'
                )}>
                  {rec.difficulty} to implement
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link to="/sample-report">
                See Full Report
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== USE CASES ========== */}
      <section className="section-tight bg-muted/30">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-3">Built For You</div>
            <h2>Who Uses Pagelyzer</h2>
            <p>Trusted by agencies, brands, and creators.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="premium-card text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="feature-icon-primary mx-auto mb-3">
                  <useCase.icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold mb-1">{useCase.title}</h4>
                <p className="text-muted-foreground text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECURITY ========== */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="badge-primary mb-3">Security First</div>
              <h2 className="mb-3">Your Data is Safe</h2>
              <p className="text-muted-foreground mb-6">
                We take security seriously. Your data is encrypted, never shared, and deletable anytime.
              </p>
              
              <div className="space-y-4">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="feature-icon-primary shrink-0 h-10 w-10">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-0.5">{feature.title}</h4>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="aspect-square max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 p-8 flex items-center justify-center vector-dots">
                <Shield className="h-24 w-24 text-primary/25" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FREE VS PRO ========== */}
      <section className="section-tight bg-muted/30">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-3">Simple Pricing</div>
            <h2>Free vs Pro</h2>
            <p>Start free and upgrade when you need more.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="rounded-xl border border-border overflow-hidden bg-card shadow-card">
              <div className="grid grid-cols-3 bg-muted/50">
                <div className="p-3 sm:p-4 font-semibold text-sm">Feature</div>
                <div className="p-3 sm:p-4 text-center font-semibold text-sm">Free</div>
                <div className="p-3 sm:p-4 text-center font-semibold text-sm flex items-center justify-center gap-1.5">
                  <ProBadge /> Pro
                </div>
              </div>

              {comparisonData.map((row, index) => (
                <div key={index} className="grid grid-cols-3 border-t border-border hover:bg-muted/20 transition-colors">
                  <div className="p-3 sm:p-4 text-sm">{row.feature}</div>
                  <div className="p-3 sm:p-4 text-center">
                    {row.free ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>}
                  </div>
                  <div className="p-3 sm:p-4 text-center">
                    <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" asChild>
                <Link to="/pricing">
                  View Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-3">FAQ</div>
            <h2>Common Questions</h2>
            <p>Got questions? We've got answers.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-border rounded-lg px-4 sm:px-5 bg-card data-[state=open]:shadow-sm transition-shadow"
                >
                  <AccordionTrigger className="text-left font-medium py-4 hover:no-underline text-sm sm:text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-12 sm:py-16 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 vector-dots opacity-10" />
        
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary-foreground/90" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-primary-foreground">
              Ready to Boost Your Page?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
              Join thousands who use Pagelyzer to grow their audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="secondary" asChild className="shadow-lg h-12">
                <Link to="/dashboard/audit">
                  <Zap className="mr-2 h-4 w-4" />
                  Run Free Audit
                </Link>
              </Button>
              <Button
                size="lg"
                asChild
                className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/20 h-12"
              >
                <Link to="/features">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-border bg-card">
        <div className="container py-10 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BarChart3 className="h-4 w-4" />
                </div>
                Pagelyzer
              </Link>
              <p className="text-muted-foreground text-sm">
                Free Facebook Page Audit Tool
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Pagelyzer. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
