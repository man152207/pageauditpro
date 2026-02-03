import { Link } from 'react-router-dom';
import { Sparkles, Crown, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PlanBannerProps {
  className?: string;
  variant?: 'compact' | 'full';
}

/**
 * Persistent banner showing subscription status
 * - Pro users: Thank you message with renewal date
 * - Free users: Usage limits with progress bar and upgrade CTA
 */
export function PlanBanner({ className, variant = 'full' }: PlanBannerProps) {
  const { isPro, subscription, usage, planName } = useSubscription();

  if (isPro) {
    const renewsAt = subscription?.subscription?.renews_at;
    const renewalText = renewsAt ? format(new Date(renewsAt), 'MMM d, yyyy') : null;

    if (variant === 'compact') {
      return (
        <div className={cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pro/10 via-pro/5 to-transparent border border-pro/20',
          className
        )}>
          <Crown className="h-4 w-4 text-pro shrink-0" />
          <span className="text-sm font-medium">Pro Member</span>
          {renewalText && (
            <span className="text-xs text-muted-foreground">
              Renews {renewalText}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className={cn(
        'relative overflow-hidden rounded-2xl p-5 sm:p-6',
        'bg-gradient-to-br from-pro/10 via-pro/5 to-accent/5',
        'border border-pro/20',
        className
      )}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-pro/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-accent/5 translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pro/15 text-pro shrink-0">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                Thank you for being a Pro member!
                <span className="plan-badge-pro text-xs">
                  <Crown className="h-3 w-3" />
                  PRO
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                You have unlimited access to all premium features
                {renewalText && <span className="ml-1">· Renews {renewalText}</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/billing">
                Manage Plan
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Free user banner
  const usagePercent = usage.auditsLimit > 0 
    ? ((usage.auditsLimit - usage.auditsRemaining) / usage.auditsLimit) * 100 
    : 0;

  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-muted/50 border border-border',
        className
      )}>
        <div className="flex items-center gap-3">
          <Zap className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm">
            <span className="font-medium">{usage.auditsRemaining}</span>
            <span className="text-muted-foreground">/{usage.auditsLimit} audits left</span>
          </span>
        </div>
        <Button size="sm" variant="ghost" asChild className="text-primary h-7 px-2">
          <Link to="/dashboard/billing">
            Upgrade
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-2xl p-5 sm:p-6 bg-muted/30 border border-border',
      className
    )}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {planName || 'Free'} Plan
                <span className="plan-badge-free text-xs">FREE</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {usage.auditsRemaining} of {usage.auditsLimit} audits remaining this month
              </p>
            </div>
          </div>
          
          <div className="max-w-md">
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1.5">
              Usage resets at the start of each month
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-sm text-muted-foreground max-w-[200px]">
            Upgrade to unlock unlimited audits, AI insights & more
          </div>
          <Button asChild className="btn-premium shrink-0">
            <Link to="/dashboard/billing">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
