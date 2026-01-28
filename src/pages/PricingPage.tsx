import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';
import { CheckCircle2, Crown, Sparkles, Zap, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  name: string;
  price: number;
  billingType: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  isPro?: boolean;
  priceId?: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: 0,
    billingType: 'forever',
    description: 'Get started with basic manual audits',
    features: [
      '5 manual audits per month',
      'Basic engagement analysis',
      'Score breakdown (0-100)',
      'General recommendations',
      'Email support',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Pro One-Time',
    price: 29.99,
    billingType: 'one-time',
    description: 'Perfect for a single deep-dive audit',
    features: [
      '1 automatic Pro audit',
      'Facebook auto-connect',
      'Advanced insights & metrics',
      'Top/worst posts analysis',
      'Best time to post',
      '7-day action plan',
      'PDF export',
      'Shareable report link',
    ],
    cta: 'Get Pro Audit',
    isPro: true,
    priceId: 'price_pro_onetime',
  },
  {
    name: 'Pro Monthly',
    price: 49.99,
    billingType: 'per month',
    description: 'For ongoing page optimization',
    features: [
      'Unlimited Pro audits',
      'All One-Time features',
      '30-day action plans',
      'Historical comparisons',
      '90-day history access',
      'AI content recommendations',
      'Priority support',
      'Multiple pages support',
    ],
    cta: 'Subscribe Now',
    popular: true,
    isPro: true,
    priceId: 'price_pro_monthly',
  },
  {
    name: 'Agency',
    price: 199.99,
    billingType: 'per month',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro Monthly',
      'Up to 10 team members',
      'White-label reports',
      'Custom branding',
      'Client management',
      '365-day history',
      '500 audits per month',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    isPro: true,
    priceId: 'price_agency',
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanClick = async (plan: Plan) => {
    if (plan.price === 0) {
      navigate('/audit');
      return;
    }

    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }

    // For paid plans, initiate checkout
    setLoadingPlan(plan.name);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: 'Unable to start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-20 lg:py-28">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade when you need advanced insights and automation.
            No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border p-6 transition-all duration-300 animate-fade-in-up',
                `stagger-${Math.min(index + 1, 5)}`,
                plan.popular
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 scale-[1.02]'
                  : 'border-border bg-card hover:border-primary/30 hover:shadow-card-hover hover:-translate-y-1'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-glow animate-pulse-glow">
                    <Sparkles className="h-3.5 w-3.5" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  {plan.isPro && <ProBadge />}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.billingType}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm group">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
                onClick={() => handlePlanClick(plan)}
                disabled={loadingPlan === plan.name}
              >
                {loadingPlan === plan.name ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : plan.price === 0 ? (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    {plan.cta}
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    {plan.cta}
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-16 animate-fade-in">
          <p className="text-muted-foreground mb-6">
            Have questions? Check out our FAQ or contact support.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" asChild size="lg">
              <Link to="/faq">
                View FAQ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" asChild size="lg">
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
