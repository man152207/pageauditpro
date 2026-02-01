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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function HomePage() {
  // ========== DATA ==========
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Boost Engagement',
      titleNp: 'सहभागिता बढाउनुहोस्',
      description: 'Understand what content resonates with your audience and optimize for maximum engagement.',
      descriptionNp: 'तपाईंको दर्शकहरूसँग कुन कन्टेन्ट राम्रो काम गर्छ बुझ्नुहोस्।',
    },
    {
      icon: Target,
      title: 'Smart Insights',
      titleNp: 'स्मार्ट अन्तर्दृष्टि',
      description: 'AI-powered analysis provides actionable recommendations tailored to your page.',
      descriptionNp: 'AI-संचालित विश्लेषणले तपाईंको पेजको लागि सिफारिसहरू प्रदान गर्दछ।',
    },
    {
      icon: Clock,
      title: 'Save Time',
      titleNp: 'समय बचत गर्नुहोस्',
      description: 'Get comprehensive audits in seconds, not hours. Focus on creating, not analyzing.',
      descriptionNp: 'सेकेन्डमा व्यापक अडिटहरू प्राप्त गर्नुहोस्, घण्टौंमा होइन।',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      titleNp: 'प्रगति ट्र्याक गर्नुहोस्',
      description: 'Monitor your page health over time and celebrate improvements.',
      descriptionNp: 'समयको साथ आफ्नो पेजको स्वास्थ्य अनुगमन गर्नुहोस्।',
    },
    {
      icon: FileBarChart,
      title: 'Pro Reports',
      titleNp: 'प्रो रिपोर्टहरू',
      description: 'Export beautiful PDF reports to share with clients or stakeholders.',
      descriptionNp: 'ग्राहक वा सरोकारवालाहरूसँग साझा गर्न PDF रिपोर्टहरू निर्यात गर्नुहोस्।',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      titleNp: 'सुरक्षित र निजी',
      description: 'Your data is encrypted and never shared. We respect your privacy.',
      descriptionNp: 'तपाईंको डाटा इन्क्रिप्टेड छ र कहिल्यै साझा गरिँदैन।',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Connect Your Page',
      titleNp: 'पेज जडान गर्नुहोस्',
      description: 'Securely connect your Facebook page with read-only permissions.',
      descriptionNp: 'रिड-ओन्ली अनुमतिहरूसँग सुरक्षित रूपमा आफ्नो Facebook पेज जडान गर्नुहोस्।',
    },
    {
      step: 2,
      title: 'Get Instant Analysis',
      titleNp: 'तुरुन्त विश्लेषण प्राप्त गर्नुहोस्',
      description: 'Our AI analyzes your posts, engagement, and growth patterns in seconds.',
      descriptionNp: 'हाम्रो AI ले तपाईंको पोस्टहरू, सहभागिता, र वृद्धि ढाँचाहरू सेकेन्डमा विश्लेषण गर्छ।',
    },
    {
      step: 3,
      title: 'Take Action',
      titleNp: 'कार्य गर्नुहोस्',
      description: 'Follow personalized recommendations to grow your page faster.',
      descriptionNp: 'आफ्नो पेज छिटो बढाउन व्यक्तिगत सिफारिसहरू पालना गर्नुहोस्।',
    },
  ];

  const metrics = [
    { icon: ThumbsUp, label: 'Engagement Rate', labelNp: 'सहभागिता दर' },
    { icon: TrendingUp, label: 'Growth Trends', labelNp: 'वृद्धि प्रवृत्ति' },
    { icon: MessageSquare, label: 'Comment Analysis', labelNp: 'टिप्पणी विश्लेषण' },
    { icon: Share2, label: 'Share Performance', labelNp: 'शेयर प्रदर्शन' },
    { icon: Clock, label: 'Best Posting Times', labelNp: 'उत्तम पोस्टिङ समय' },
    { icon: Users, label: 'Audience Insights', labelNp: 'दर्शक अन्तर्दृष्टि' },
    { icon: Globe, label: 'Reach Analysis', labelNp: 'पहुँच विश्लेषण' },
    { icon: MousePointerClick, label: 'Click Tracking', labelNp: 'क्लिक ट्र्याकिङ' },
  ];

  const recommendations = [
    {
      title: 'Increase posting frequency',
      impact: 'High',
      difficulty: 'Easy',
      description: 'Post at least 4-5 times per week to maintain audience engagement.',
    },
    {
      title: 'Add more video content',
      impact: 'High',
      difficulty: 'Medium',
      description: 'Videos get 3x more engagement than static images on average.',
    },
    {
      title: 'Respond to comments faster',
      impact: 'Medium',
      difficulty: 'Easy',
      description: 'Quick responses boost algorithm visibility and audience loyalty.',
    },
    {
      title: 'Optimize post timing',
      impact: 'Medium',
      difficulty: 'Easy',
      description: 'Your audience is most active between 7-9 PM. Schedule posts accordingly.',
    },
    {
      title: 'Use more CTAs',
      impact: 'High',
      difficulty: 'Easy',
      description: 'Posts with clear calls-to-action see 40% higher engagement.',
    },
    {
      title: 'Analyze competitor content',
      impact: 'Medium',
      difficulty: 'Medium',
      description: 'Study top performers in your niche for content inspiration.',
    },
  ];

  const useCases = [
    {
      icon: Users,
      title: 'Marketing Agencies',
      titleNp: 'मार्केटिङ एजेन्सीहरू',
      description: 'Deliver professional audits and reports to impress your clients.',
      descriptionNp: 'आफ्ना ग्राहकहरूलाई प्रभावित गर्न व्यावसायिक अडिट र रिपोर्टहरू प्रदान गर्नुहोस्।',
    },
    {
      icon: Crown,
      title: 'Brand Managers',
      titleNp: 'ब्रान्ड प्रबन्धकहरू',
      description: 'Track performance across multiple pages and optimize your strategy.',
      descriptionNp: 'धेरै पेजहरूमा प्रदर्शन ट्र्याक गर्नुहोस् र रणनीति अनुकूलन गर्नुहोस्।',
    },
    {
      icon: Sparkles,
      title: 'Content Creators',
      titleNp: 'सामग्री सिर्जनाकर्ताहरू',
      description: 'Understand what your audience loves and create content that converts.',
      descriptionNp: 'तपाईंको दर्शकहरूले के मन पराउँछन् बुझ्नुहोस् र रूपान्तरण गर्ने सामग्री सिर्जना गर्नुहोस्।',
    },
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: 'Read-Only Access',
      description: 'We only request minimal permissions. We can never post or modify your page.',
    },
    {
      icon: Shield,
      title: 'Encrypted Data',
      description: 'All data is encrypted at rest and in transit using industry-standard protocols.',
    },
    {
      icon: Globe,
      title: 'GDPR Compliant',
      description: 'Your data is processed in compliance with GDPR and privacy regulations.',
    },
  ];

  const faqs = [
    {
      q: 'Is Pagelyzer free to use?',
      qNp: 'के Pagelyzer प्रयोग गर्न निःशुल्क छ?',
      a: 'Yes! You can run 3 free audits per month. Upgrade to Pro for unlimited audits, advanced insights, and PDF exports.',
      aNp: 'हो! तपाईं महिनामा 3 निःशुल्क अडिटहरू चलाउन सक्नुहुन्छ। असीमित अडिटहरू, उन्नत अन्तर्दृष्टि, र PDF निर्यातहरूको लागि Pro मा अपग्रेड गर्नुहोस्।',
    },
    {
      q: 'How do I connect my Facebook page?',
      qNp: 'म मेरो Facebook पेज कसरी जडान गर्छु?',
      a: 'Click "Connect Facebook" and authorize with your Facebook account. Select the page you want to audit, and you\'re done!',
      aNp: '"Connect Facebook" क्लिक गर्नुहोस् र आफ्नो Facebook खाताबाट अधिकृत गर्नुहोस्। तपाईंले अडिट गर्न चाहनुभएको पेज चयन गर्नुहोस्।',
    },
    {
      q: 'What data do you access?',
      qNp: 'तपाईंले कुन डाटा पहुँच गर्नुहुन्छ?',
      a: 'We only access public page information, post metrics, and engagement data. We never access private messages or personal data.',
      aNp: 'हामी केवल सार्वजनिक पेज जानकारी, पोस्ट मेट्रिक्स, र सहभागिता डाटा पहुँच गर्छौं।',
    },
    {
      q: 'Can I analyze competitor pages?',
      qNp: 'के म प्रतिस्पर्धी पेजहरू विश्लेषण गर्न सक्छु?',
      a: 'You can only analyze pages you manage. For competitor insights, you\'d need admin access to their pages.',
      aNp: 'तपाईं केवल आफूले व्यवस्थापन गर्ने पेजहरू विश्लेषण गर्न सक्नुहुन्छ।',
    },
    {
      q: 'How often should I run an audit?',
      qNp: 'म कति पटक अडिट चलाउनु पर्छ?',
      a: 'We recommend running an audit at least once a month to track your progress and identify new opportunities.',
      aNp: 'हामी तपाईंको प्रगति ट्र्याक गर्न र नयाँ अवसरहरू पहिचान गर्न महिनामा कम्तिमा एक पटक अडिट चलाउन सिफारिस गर्छौं।',
    },
    {
      q: 'What makes Pagelyzer different?',
      qNp: 'Pagelyzer लाई के फरक बनाउँछ?',
      a: 'Unlike generic analytics tools, Pagelyzer provides actionable recommendations powered by AI, not just data dashboards.',
      aNp: 'सामान्य एनालिटिक्स उपकरणहरूको विपरीत, Pagelyzer ले AI द्वारा संचालित कार्ययोग्य सिफारिसहरू प्रदान गर्दछ।',
    },
    {
      q: 'Can I export reports?',
      qNp: 'के म रिपोर्टहरू निर्यात गर्न सक्छु?',
      a: 'Yes! Pro users can export beautiful PDF reports and share audit results via public links.',
      aNp: 'हो! Pro प्रयोगकर्ताहरूले PDF रिपोर्टहरू निर्यात गर्न र सार्वजनिक लिंकहरू मार्फत अडिट परिणामहरू साझा गर्न सक्छन्।',
    },
    {
      q: 'Do you support Instagram or other platforms?',
      qNp: 'के तपाईं Instagram वा अन्य प्लेटफर्महरू समर्थन गर्नुहुन्छ?',
      a: 'Currently we focus on Facebook pages. Instagram and LinkedIn support is on our roadmap for 2025.',
      aNp: 'हाल हामी Facebook पेजहरूमा केन्द्रित छौं। Instagram र LinkedIn समर्थन हाम्रो 2025 को रोडम्यापमा छ।',
    },
  ];

  const comparisonData = [
    { feature: 'Manual Page Audit', free: true, pro: true },
    { feature: 'Engagement Rate Calculation', free: true, pro: true },
    { feature: 'Basic Score (0-100)', free: true, pro: true },
    { feature: 'Basic Recommendations', free: true, pro: true },
    { feature: 'Facebook Auto-Connect', free: false, pro: true },
    { feature: 'Advanced Insights', free: false, pro: true },
    { feature: 'Top/Worst Posts Analysis', free: false, pro: true },
    { feature: 'Best Time to Post', free: false, pro: true },
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
    <div className="flex flex-col">
      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden section">
        {/* Gradient backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-32 left-[10%] w-20 h-20 rounded-2xl bg-primary/10 animate-float opacity-40 hidden lg:block" />
        <div className="absolute top-48 right-[12%] w-14 h-14 rounded-full bg-accent/15 animate-float stagger-2 opacity-50 hidden lg:block" />
        <div className="absolute bottom-40 left-[18%] w-10 h-10 rounded-lg bg-success/10 animate-float stagger-3 opacity-40 hidden lg:block" />

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in border border-primary/20">
                <Sparkles className="h-4 w-4" />
                Free Facebook Page Audit Tool
              </div>

              <h1 className="mb-6 animate-fade-in-up text-balance">
                Grow Your Facebook Page with{' '}
                <span className="gradient-text">AI-Powered</span> Insights
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up stagger-1 text-pretty">
                Get instant page health scores, engagement analysis, and personalized 
                recommendations to boost your Facebook presence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up stagger-2">
                <Button size="xl" asChild className="btn-glow">
                  <Link to="/dashboard/audit">
                    <Facebook className="mr-2 h-5 w-5" />
                    Connect Facebook & Run Audit
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link to="/sample-report">
                    View Sample Report
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Trust line */}
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-muted-foreground animate-fade-in stagger-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">GDPR Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">Agency Friendly</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative animate-fade-in-up stagger-2 hidden lg:block">
              <div className="relative rounded-2xl border border-border bg-card p-2 shadow-2xl">
                <div className="rounded-xl bg-muted/50 p-6">
                  {/* Mock dashboard preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-8 w-8 bg-primary/20 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[85, 72, 91].map((score, i) => (
                        <div key={i} className="rounded-lg bg-card border border-border p-4">
                          <div className="text-2xl font-bold text-primary">{score}</div>
                          <div className="h-2 w-16 bg-muted rounded mt-2" />
                        </div>
                      ))}
                    </div>
                    <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg" />
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-lg animate-bounce-soft">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">+23% Growth</div>
                    <div className="text-xs text-muted-foreground">This month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BENEFITS SECTION ========== */}
      <section className="section bg-muted/30">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-4">Why Pagelyzer</div>
            <h2>Everything You Need to Grow</h2>
            <p>
              Powerful analytics and AI insights to help you understand your audience 
              and create content that converts.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={cn(
                  'group premium-card animate-fade-in-up',
                  `stagger-${Math.min(index + 1, 6)}`
                )}
              >
                <div className="feature-icon-primary mb-5">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
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
            <div className="grid md:grid-cols-3 gap-8 md:gap-4">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.15}s` }}>
                  {/* Connector line */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                  
                  <div className="step-number mx-auto mb-4 relative z-10">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHAT WE ANALYZE ========== */}
      <section className="section bg-muted/30">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-4">Comprehensive Analysis</div>
            <h2>What We Analyze</h2>
            <p>Deep dive into every aspect of your Facebook page performance.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* ========== SAMPLE RECOMMENDATIONS ========== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-4">Actionable Insights</div>
            <h2>Example Recommendations</h2>
            <p>Here's a preview of the kind of insights you'll receive.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="interactive-card p-5 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="font-semibold text-sm">{rec.title}</h4>
                  <div className="flex gap-1.5 shrink-0">
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      rec.impact === 'High' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    )}>
                      {rec.impact}
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      rec.difficulty === 'Easy' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                    )}>
                      {rec.difficulty}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{rec.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" variant="outline" asChild>
              <Link to="/sample-report">
                See Full Sample Report
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== USE CASES ========== */}
      <section className="section bg-muted/30">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-4">Built For You</div>
            <h2>Who Uses Pagelyzer</h2>
            <p>Trusted by agencies, brands, and creators worldwide.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="premium-card text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon-primary mx-auto mb-4">
                  <useCase.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                <p className="text-muted-foreground text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECURITY SECTION ========== */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge-primary mb-4">Security First</div>
              <h2 className="mb-4">Your Data is Safe with Us</h2>
              <p className="text-muted-foreground text-lg mb-8">
                We take security seriously. Your Facebook data is encrypted, 
                never shared, and you can delete it anytime.
              </p>
              
              <div className="space-y-6">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="feature-icon-primary shrink-0">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-8 flex items-center justify-center">
                <Shield className="h-32 w-32 text-primary/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FREE VS PRO ========== */}
      <section className="section bg-muted/30">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-4">Simple Pricing</div>
            <h2>Free vs Pro Comparison</h2>
            <p>Start free and upgrade when you need more power.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-card">
              {/* Header */}
              <div className="grid grid-cols-3 bg-muted/50">
                <div className="p-4 font-semibold text-sm">Feature</div>
                <div className="p-4 text-center font-semibold text-sm">Free</div>
                <div className="p-4 text-center font-semibold text-sm flex items-center justify-center gap-2">
                  <ProBadge /> Pro
                </div>
              </div>

              {/* Rows */}
              {comparisonData.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 border-t border-border transition-colors hover:bg-muted/30"
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

            <div className="mt-10 text-center">
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

      {/* ========== FAQ SECTION ========== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="badge-primary mb-4">FAQ</div>
            <h2>Frequently Asked Questions</h2>
            <p>Got questions? We've got answers.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-border rounded-xl px-6 bg-card data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left font-medium py-5 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="section relative overflow-hidden bg-primary">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }} />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Zap className="h-14 w-14 mx-auto mb-6 text-primary-foreground/90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
              Ready to Boost Your Facebook Page?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of page owners who use Pagelyzer to grow their audience
              and increase engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="secondary" asChild className="shadow-lg">
                <Link to="/dashboard/audit">
                  <Zap className="mr-2 h-5 w-5" />
                  Run Free Audit Now
                </Link>
              </Button>
              <Button
                size="xl"
                asChild
                className="bg-primary-foreground/10 text-primary-foreground border-2 border-primary-foreground/30 hover:bg-primary-foreground/20"
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

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-border bg-card">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 font-bold text-lg mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BarChart3 className="h-4 w-4" />
                </div>
                Pagelyzer
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Free Facebook Page Audit Tool. Get insights to grow your page.
              </p>
            </div>

            {/* Product */}
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

            {/* Resources */}
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

            {/* Legal */}
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

          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Pagelyzer. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <span>Built with ❤️ in Nepal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
