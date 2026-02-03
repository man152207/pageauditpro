import * as React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';

interface PlanBadgeProps {
  className?: string;
  showRenewal?: boolean;
  showUsage?: boolean;
}

/**
 * Dynamic plan badge that shows Pro status with golden styling
 * or Free status with upgrade prompt
 */
export function PlanBadge({ className, showRenewal = true, showUsage = true }: PlanBadgeProps) {
  const { isPro, subscription, usage, planName } = useSubscription();

  if (isPro) {
    const renewsAt = subscription?.subscription?.renews_at;
    const renewalText = renewsAt ? format(new Date(renewsAt), 'MMM d, yyyy') : null;

    return (
      <div className={cn('flex items-center gap-2 flex-wrap', className)}>
        <span className="plan-badge-pro">
          <Crown className="h-3.5 w-3.5" />
          <span>Pro Member</span>
        </span>
        {showRenewal && renewalText && (
          <span className="text-sm text-muted-foreground">
            Renews {renewalText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className="plan-badge-free">
        <span>{planName || 'Free'} Plan</span>
      </span>
      {showUsage && (
        <span className="text-sm text-muted-foreground">
          {usage.auditsRemaining}/{usage.auditsLimit} audits remaining
        </span>
      )}
      <span className="text-muted-foreground">·</span>
      <Link 
        to="/dashboard/billing" 
        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
      >
        <Sparkles className="h-3 w-3" />
        Upgrade
      </Link>
    </div>
  );
}

/**
 * Compact version for headers
 */
export function PlanBadgeCompact({ className }: { className?: string }) {
  const { isPro } = useSubscription();

  if (isPro) {
    return (
      <span className={cn('plan-badge-pro', className)}>
        <Crown className="h-3 w-3" />
        <span>Pro</span>
      </span>
    );
  }

  return (
    <Link to="/dashboard/billing" className={cn('plan-badge-free hover:bg-muted/80', className)}>
      <span>Free</span>
    </Link>
  );
}
