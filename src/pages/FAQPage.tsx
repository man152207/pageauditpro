import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // General
  {
    category: 'General',
    question: 'What is Pagelyzer?',
    answer: 'Pagelyzer is a smart Facebook Page audit platform that analyzes your page performance, calculates engagement rates, and provides AI-powered recommendations to help you grow your audience and improve your content strategy.',
  },
  {
    category: 'General',
    question: 'How does the page audit work?',
    answer: 'Our audit analyzes key metrics including your page completeness, posting frequency, engagement rates, content quality, and audience growth. We then generate a comprehensive score (0-100) with actionable recommendations tailored to your page.',
  },
  {
    category: 'General',
    question: 'Do I need to connect my Facebook account?',
    answer: 'For a basic manual audit, no connection is required - you just enter your page information. However, to unlock advanced insights like reach, impressions, and automatic data fetching, you\'ll need to connect your Facebook account with a Pro subscription.',
  },
  // Pricing
  {
    category: 'Pricing',
    question: 'Is there a free plan?',
    answer: 'Yes! Our free plan includes 5 manual audits per month with basic engagement analysis, score breakdown, and general recommendations. It\'s perfect for getting started and understanding your page performance.',
  },
  {
    category: 'Pricing',
    question: 'What\'s included in the Pro plan?',
    answer: 'Pro includes unlimited audits, Facebook auto-connect, advanced insights (reach, impressions), top/worst posts analysis, best time to post recommendations, 7/30-day action plans, PDF export, shareable report links, and historical comparisons.',
  },
  {
    category: 'Pricing',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely! You can cancel your subscription at any time from your dashboard. Your Pro features will remain active until the end of your current billing period.',
  },
  {
    category: 'Pricing',
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 7-day money-back guarantee for first-time subscribers. If you\'re not satisfied with the Pro features, contact our support team within 7 days of your purchase for a full refund.',
  },
  // Features
  {
    category: 'Features',
    question: 'What metrics are included in the audit?',
    answer: 'Our audit covers: profile completeness, posting frequency, engagement rate (likes, comments, shares), content quality analysis, audience growth trends, best performing post types, optimal posting times, and competitor benchmarking.',
  },
  {
    category: 'Features',
    question: 'Can I export my audit reports?',
    answer: 'Yes! Pro subscribers can export professional PDF reports that are perfect for sharing with clients, team members, or stakeholders. Reports include all metrics, visualizations, and recommendations.',
  },
  {
    category: 'Features',
    question: 'How often should I run an audit?',
    answer: 'We recommend running an audit at least once a month to track your progress and identify new opportunities. Pro subscribers can set up automatic weekly audits for continuous monitoring.',
  },
  // Security
  {
    category: 'Security',
    question: 'Is my Facebook data secure?',
    answer: 'Yes, we take security seriously. We only request read-only access to your public page data and insights. We never post on your behalf, never access private messages, and all data is encrypted using industry-standard protocols.',
  },
  {
    category: 'Security',
    question: 'What data do you collect?',
    answer: 'We collect only publicly available page metrics and, with your permission, Page Insights data. This includes follower counts, post engagement metrics, and audience demographics. We never collect personal user data from your followers.',
  },
];

const categories = ['All', 'General', 'Pricing', 'Features', 'Security'];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const filteredFAQs = activeCategory === 'All' 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="py-10 sm:py-14 lg:py-16">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </div>
          <h1 className="mb-2">
            Got Questions? We've Got Answers
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Find answers to common questions about Pagelyzer, pricing, features, and more.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 animate-fade-in-up">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="text-xs h-8"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 animate-fade-in-up stagger-1">
          {filteredFAQs.map((faq, index) => {
            const isOpen = openItems.includes(index);
            return (
              <div
                key={index}
                className={cn(
                  'rounded-lg border bg-card overflow-hidden transition-all duration-200',
                  isOpen ? 'border-primary/30 shadow-sm' : 'border-border hover:border-primary/20'
                )}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {faq.category}
                    </span>
                    <span className="font-medium text-sm">{faq.question}</span>
                  </div>
                  <ChevronDown className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0',
                    isOpen && 'rotate-180'
                  )} />
                </button>
                <div className={cn(
                  'overflow-hidden transition-all duration-200',
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}>
                  <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-10 text-center p-6 rounded-xl bg-muted/50 border border-border animate-fade-in-up">
          <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
          <h3 className="mb-1.5">Still Have Questions?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/contact">
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/audit">
                <Zap className="mr-2 h-4 w-4" />
                Try Free Audit
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
