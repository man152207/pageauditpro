import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';
import { CheckCircle2, Crown, Sparkles, Zap } from 'lucide-react';

interface Plan {
  name: string;
  price: number;
  billingType: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  isPro?: boolean;
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
  },
];

export default function PricingPage() {
  const { user } = useAuth();

  // For paid plans, redirect to billing if logged in, otherwise to auth
  const getPlanLink = (plan: Plan) => {
    if (plan.price === 0) return '/audit';
    return user ? '/dashboard/billing' : '/auth?mode=signup';
  };

  return (
    <div className="py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
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
              key={index}
              className={`relative rounded-2xl border p-6 ${
                plan.popular
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  {plan.isPro && <ProBadge />}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.billingType}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                asChild
              >
                <Link to={getPlanLink(plan)}>
                  {plan.price === 0 ? (
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
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Have questions? Check out our FAQ or contact support.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/faq">View FAQ</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
