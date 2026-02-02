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
  Star,
  Award,
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
      description: 'Understand what content resonates with your audience and drives meaningful interactions.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations tailored to your specific page and audience.',
    },
    {
      icon: Clock,
      title: 'Save Hours Weekly',
      description: 'Comprehensive audits in seconds. No more manual spreadsheet analysis.',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Monitor your page health over time and celebrate improvements.',
    },
    {
      icon: FileBarChart,
      title: 'Pro Reports',
      description: 'Export beautiful PDF reports to impress clients and stakeholders.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption. Your data is never shared or sold.',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Connect Your Page',
      description: 'Securely link your Facebook page with read-only access',
    },
    {
      step: 2,
      title: 'Get AI Analysis',
      description: 'Our AI analyzes engagement patterns and content performance',
    },
    {
      step: 3,
      title: 'Take Action',
      description: 'Follow personalized recommendations to grow faster',
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
    { title: 'Increase posting frequency to 5x/week', impact: 'High', effort: 'Easy' },
    { title: 'Add video content for 2x engagement', impact: 'High', effort: 'Medium' },
    { title: 'Respond to comments within 2 hours', impact: 'Medium', effort: 'Easy' },
    { title: 'Post between 7-9 PM for best reach', impact: 'Medium', effort: 'Easy' },
    { title: 'Include clear CTAs in every post', impact: 'High', effort: 'Easy' },
    { title: 'Create weekly content series', impact: 'High', effort: 'Medium' },
  ];

  const useCases = [
    {
      icon: Users,
      title: 'Marketing Agencies',
      description: 'Deliver professional audits that impress clients and justify your retainer.',
      outcomes: ['Client-ready PDF reports', 'White-label options', 'Bulk page management'],
    },
    {
      icon: Crown,
      title: 'Brand Managers',
      description: 'Keep leadership informed with data-driven insights and clear action plans.',
      outcomes: ['Executive dashboards', 'Competitor benchmarks', 'Monthly trend reports'],
    },
    {
      icon: Sparkles,
      title: 'Content Creators',
      description: 'Stop guessing. Know exactly what content your audience wants to see.',
      outcomes: ['Content optimization', 'Best time analysis', 'Growth predictions'],
    },
  ];

  const securityFeatures = [
    { icon: Lock, title: 'Read-Only Access', description: 'We never post or modify your page. Ever.' },
    { icon: Shield, title: 'Bank-Level Encryption', description: 'AES-256 encryption for all data at rest.' },
    { icon: Globe, title: 'GDPR Compliant', description: 'Full compliance with EU privacy regulations.' },
  ];

  const faqs = [
    { q: 'Is Pagelyzer free to use?', a: 'Yes! Get 3 free audits per month. Upgrade to Pro for unlimited audits and advanced features like AI insights and PDF exports.' },
    { q: 'How do I connect my Facebook page?', a: 'Click "Connect Facebook", authorize with Facebook, select your page, and you\'re done. Takes under 30 seconds.' },
    { q: 'What data do you access?', a: 'Only public page information, post metrics, and engagement data. We never access private messages or personal profiles.' },
    { q: 'Can I analyze competitor pages?', a: 'You can only analyze pages you manage with admin access. We respect Facebook\'s terms of service.' },
    { q: 'How often should I run an audit?', a: 'We recommend weekly for active pages, or at least monthly to track progress and catch issues early.' },
    { q: 'What makes Pagelyzer different?', a: 'We focus on actionable AI recommendations, not just data. Every insight comes with specific steps you can take today.' },
    { q: 'Can I export reports?', a: 'Pro users can export beautiful PDF reports and share via public links. Perfect for client deliverables.' },
    { q: 'Do you support Instagram?', a: 'Currently Facebook pages only. Instagram support is on our 2025 roadmap.' },
  ];

  const comparisonData = [
    { feature: 'Manual Page Audit', free: true, pro: true },
    { feature: 'Health Score (0-100)', free: true, pro: true },
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
      <section className="relative py-16 sm:py-20 md:py-24 hero-pattern-premium overflow-hidden">
        {/* Floating orbs */}
        <div className="floating-orb w-[400px] h-[400px] bg-primary/10 -top-32 -left-32" />
        <div className="floating-orb w-[300px] h-[300px] bg-accent/8 -bottom-20 -right-20" style={{ animationDelay: '3s' }} />

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-primary text-sm font-medium mb-6 animate-fade-in border border-primary/15">
                <Facebook className="h-4 w-4" />
                <span>Free Facebook Page Audit Tool</span>
              </div>

              <h1 className="mb-5 animate-fade-in-up text-balance">
                Grow Your Page with{' '}
                <span className="gradient-text">AI-Powered Insights</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in-up stagger-1 text-pretty">
                Get instant health scores, engagement analysis, and personalized action plans to boost your Facebook presence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up stagger-2">
                <Button size="lg" asChild className="btn-premium h-12 px-8 text-base">
                  <Link to="/dashboard/audit">
                    <Zap className="mr-2 h-5 w-5" />
                    Run Free Audit
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-6 text-base">
                  <Link to="/sample-report">
                    <Play className="mr-2 h-4 w-4" />
                    View Sample Report
                  </Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-muted-foreground animate-fade-in stagger-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  </div>
                  <span className="text-sm font-medium">GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                    <Shield className="h-3.5 w-3.5 text-success" />
                  </div>
                  <span className="text-sm font-medium">256-bit SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                    <Star className="h-3.5 w-3.5 text-success" />
                  </div>
                  <span className="text-sm font-medium">10K+ Audits</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative animate-fade-in-up stagger-2 hidden lg:block">
              <div className="relative rounded-2xl border border-border bg-card p-4 shadow-2xl">
                <div className="rounded-xl bg-muted/30 p-6 vector-dots">
                  {/* Mock dashboard header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="h-4 w-28 bg-muted rounded mb-1.5" />
                        <div className="h-3 w-20 bg-muted/70 rounded" />
                      </div>
                    </div>
                    <div className="badge-success text-xs py-1">
                      <span className="w-1.5 h-1.5 bg-success rounded-full mr-1.5" />
                      Live
                    </div>
                  </div>
                  
                  {/* Score cards */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { score: 85, label: 'Overall', color: 'text-primary' },
                      { score: 72, label: 'Engagement', color: 'text-accent' },
                      { score: 91, label: 'Growth', color: 'text-success' }
                    ].map((item, i) => (
                      <div key={i} className="rounded-xl bg-card border border-border p-4 text-center shadow-sm">
                        <div className={cn('text-2xl font-bold mb-1', item.color)}>{item.score}</div>
                        <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chart placeholder */}
                  <div className="h-28 bg-gradient-to-br from-primary/8 to-accent/5 rounded-xl flex items-end justify-around p-4 border border-border/50">
                    {[45, 70, 50, 85, 60, 95, 75].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-5 bg-primary/30 rounded-t-md transition-all duration-300 hover:bg-primary chart-bar-enter"
                        style={{ 
                          height: `${h}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-xl animate-bounce-soft">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-success">+23%</div>
                    <div className="text-xs text-muted-foreground">This month</div>
                  </div>
                </div>
              </div>

              {/* Floating score */}
              <div className="absolute -top-3 -right-3 bg-card border border-border rounded-xl px-4 py-3 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-pro" />
                  <span className="text-sm font-bold">A+ Score</span>
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
            <div className="badge-primary mb-4">Why Pagelyzer</div>
            <h2>Everything You Need to Grow</h2>
            <p>Powerful analytics and AI insights designed for Facebook pages of all sizes.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group premium-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="feature-icon-primary mb-5">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-lg mb-2">{benefit.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-4">Simple Process</div>
            <h2>How It Works</h2>
            <p>Get your first audit in under 2 minutes. No credit card required.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 md:gap-6">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.12}s` }}>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                  )}
                  <div className="step-number mx-auto mb-5 relative z-10">{step.step}</div>
                  <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
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
            <div className="badge-primary mb-4">Comprehensive Analysis</div>
            <h2>What We Analyze</h2>
            <p>Deep dive into every aspect of your Facebook page performance.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="group interactive-card p-5 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="feature-icon-primary mx-auto mb-3">
                  <metric.icon className="h-5 w-5" />
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
            <div className="badge-primary mb-4">Actionable Insights</div>
            <h2>Sample Recommendations</h2>
            <p>Every audit includes specific, actionable recommendations like these.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="action-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="font-medium text-sm leading-snug">{rec.title}</h4>
                  <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                </div>
                <div className="flex gap-2">
                  <span className={cn(
                    'badge-impact-' + rec.impact.toLowerCase()
                  )}>
                    {rec.impact} Impact
                  </span>
                  <span className="badge-effort-easy">
                    {rec.effort}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" variant="outline" asChild className="h-12 px-8">
              <Link to="/sample-report">
                See Full Sample Report
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== USE CASES ========== */}
      <section className="section-tight bg-muted/30">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-4">Built For You</div>
            <h2>Who Uses Pagelyzer</h2>
            <p>Trusted by agencies, brands, and creators worldwide.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="premium-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon-primary mb-5">
                  <useCase.icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-lg mb-2">{useCase.title}</h4>
                <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECURITY ========== */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-primary mb-4">Security First</div>
              <h2 className="mb-4">Your Data is Safe With Us</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                We take security seriously. Your data is encrypted, never shared, and you can delete it anytime.
              </p>
              
              <div className="space-y-5">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="feature-icon-primary shrink-0">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-1">{feature.title}</h4>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="aspect-square w-80 rounded-3xl bg-gradient-to-br from-primary/6 to-accent/6 p-10 flex items-center justify-center vector-dots border border-border/50">
                <Shield className="h-28 w-28 text-primary/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-40 rounded-full border-4 border-primary/20 animate-pulse-slow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FREE VS PRO ========== */}
      <section className="section-tight bg-muted/30">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-4">Simple Pricing</div>
            <h2>Free vs Pro</h2>
            <p>Start free and upgrade when you need more power.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-lg">
              <div className="grid grid-cols-3 bg-muted/50">
                <div className="p-4 sm:p-5 font-semibold text-sm">Feature</div>
                <div className="p-4 sm:p-5 text-center font-semibold text-sm">Free</div>
                <div className="p-4 sm:p-5 text-center font-semibold text-sm flex items-center justify-center gap-2">
                  <ProBadge /> Pro
                </div>
              </div>

              {comparisonData.map((row, index) => (
                <div key={index} className="grid grid-cols-3 border-t border-border hover:bg-muted/30 transition-colors">
                  <div className="p-4 sm:p-5 text-sm font-medium">{row.feature}</div>
                  <div className="p-4 sm:p-5 text-center">
                    {row.free ? (
                      <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </div>
                  <div className="p-4 sm:p-5 text-center">
                    <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" asChild className="h-12 px-8">
                <Link to="/pricing">
                  View Full Pricing
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
            <div className="badge-primary mb-4">FAQ</div>
            <h2>Common Questions</h2>
            <p>Got questions? We've got answers.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-border rounded-xl px-5 sm:px-6 bg-card data-[state=open]:shadow-md transition-all duration-200"
                >
                  <AccordionTrigger className="text-left font-semibold py-5 hover:no-underline text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-10 p-6 rounded-2xl bg-muted/50 border border-border text-center">
              <p className="text-muted-foreground mb-4">Still have questions?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
                <Button asChild>
                  <Link to="/dashboard/audit">Try Free Audit</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-20 sm:py-24 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 vector-dots opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-foreground/10 mb-6">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-primary-foreground">
              Ready to Grow Your Page?
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg max-w-lg mx-auto">
              Join thousands of marketers who use Pagelyzer to boost their Facebook presence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="h-12 px-8 text-base shadow-xl">
                <Link to="/dashboard/audit">
                  <Zap className="mr-2 h-5 w-5" />
                  Run Free Audit
                </Link>
              </Button>
              <Button
                size="lg"
                asChild
                className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/25 hover:bg-primary-foreground/20 h-12 px-8 text-base"
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
        <div className="container py-14 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 font-bold text-xl mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <BarChart3 className="h-5 w-5" />
                </div>
                Pagelyzer
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Free Facebook Page Audit Tool. Get actionable insights to grow your audience.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-3">
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
              <h4 className="font-semibold mb-4 text-sm">Resources</h4>
              <ul className="space-y-3">
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
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-3">
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

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Pagelyzer. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
