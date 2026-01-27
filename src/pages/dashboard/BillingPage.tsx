import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billing_type: string;
  feature_flags: Record<string, boolean>;
  limits: Record<string, number>;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  renews_at: string | null;
  plans: Plan;
}

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    // Show success/cancel message
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast({
        title: '🎉 Payment Successful!',
        description: 'Your Pro features are now unlocked.',
      });
    } else if (payment === 'cancelled') {
      toast({
        title: 'Payment Cancelled',
        description: 'No charges were made.',
        variant: 'destructive',
      });
    }

    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      // Fetch plans
      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      setPlans(plansData?.map(p => ({
        ...p,
        feature_flags: p.feature_flags as Record<string, boolean>,
        limits: p.limits as Record<string, number>,
      })) || []);

      // Fetch user's active subscription
      if (user) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subData) {
          setSubscription({
            ...subData,
            plans: {
              ...subData.plans,
              feature_flags: subData.plans.feature_flags as Record<string, boolean>,
              limits: subData.plans.limits as Record<string, number>,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (plan: Plan) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to upgrade your plan.',
        variant: 'destructive',
      });
      return;
    }

    setCheckoutLoading(plan.id);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan_id: plan.id,
          success_url: `${window.location.origin}/dashboard/billing?payment=success`,
          cancel_url: `${window.location.origin}/dashboard/billing?payment=cancelled`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view payment history.
        </p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Current Plan
        </h2>

        {subscription ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold">{subscription.plans.name}</span>
                <ProBadge />
              </div>
              <p className="text-sm text-muted-foreground">
                {subscription.renews_at && (
                  <>Renews on {new Date(subscription.renews_at).toLocaleDateString()}</>
                )}
                {subscription.expires_at && !subscription.renews_at && (
                  <>Expires on {new Date(subscription.expires_at).toLocaleDateString()}</>
                )}
              </p>
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              Active
            </Badge>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold">Free Plan</span>
              <p className="text-sm text-muted-foreground">
                Limited to 5 manual audits per month
              </p>
            </div>
            <Button asChild>
              <Link to="#plans">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Features */}
      {subscription && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Your Plan Features</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(subscription.plans.feature_flags || {})
              .filter(([_, enabled]) => enabled)
              .map(([key]) => (
                <div key={key} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-2">Usage Limits</h3>
            <div className="grid gap-2 sm:grid-cols-3 text-sm">
              <div>
                <span className="text-muted-foreground">Audits/month:</span>{' '}
                <span className="font-medium">{subscription.plans.limits.audits_per_month || 'Unlimited'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">PDF Exports:</span>{' '}
                <span className="font-medium">{subscription.plans.limits.pdf_exports || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">History:</span>{' '}
                <span className="font-medium">{subscription.plans.limits.history_days || 0} days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div id="plans" className="space-y-4">
        <h2 className="font-semibold">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {plans
            .filter((p) => p.price > 0)
            .map((plan) => {
              const isCurrentPlan = subscription?.plan_id === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-6 ${
                    isCurrentPlan
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {plan.feature_flags?.pro_audit && <ProBadge />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.description}
                      </p>
                    </div>
                    {isCurrentPlan && (
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        Current
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">
                      /{plan.billing_type.replace('_', ' ')}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6 text-sm">
                    {Object.entries(plan.feature_flags || {})
                      .filter(([_, v]) => v)
                      .slice(0, 5)
                      .map(([k]) => (
                        <li key={k} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                        </li>
                      ))}
                  </ul>

                  <Button
                    className="w-full"
                    disabled={isCurrentPlan || checkoutLoading === plan.id}
                    onClick={() => handleCheckout(plan)}
                  >
                    {checkoutLoading === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
