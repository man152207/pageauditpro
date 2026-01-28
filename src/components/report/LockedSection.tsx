import { ReactNode } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LockedSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  placeholderContent?: ReactNode;
  className?: string;
}

/**
 * A section that shows a locked state with placeholder content.
 * IMPORTANT: Never pass real Pro-only data as placeholderContent.
 * Only use static/mock placeholder data that is safe to expose.
 */
export function LockedSection({
  title,
  description = 'Upgrade to Pro to unlock this section',
  icon,
  placeholderContent,
  className,
}: LockedSectionProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden relative', className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{title}</h3>
                <ProBadge size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Placeholder Content with Blur Overlay */}
      <div className="relative">
        {placeholderContent && (
          <div className="p-6 pointer-events-none select-none">
            {placeholderContent}
          </div>
        )}
        
        {/* Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-md bg-background/70 flex flex-col items-center justify-center p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4 animate-bounce-soft">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <p className="text-center text-muted-foreground mb-4 max-w-xs">
            Unlock detailed insights, AI recommendations, and more with Pro
          </p>
          <Button asChild>
            <Link to="/pricing">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Placeholder content generators (safe mock data, never real user data)

export function MetricsPlaceholder() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-lg bg-muted/50">
          <div className="h-3 w-20 bg-muted rounded mb-2" />
          <div className="h-6 w-16 bg-muted rounded mb-1" />
          <div className="h-2 w-12 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function PostsPlaceholder() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <div className="h-12 w-12 bg-muted rounded" />
          <div className="flex-1">
            <div className="h-4 w-3/4 bg-muted rounded mb-2" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
          <div className="text-right">
            <div className="h-5 w-12 bg-muted rounded mb-1" />
            <div className="h-3 w-8 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DemographicsPlaceholder() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <div className="h-4 w-24 bg-muted rounded" />
        {[70, 55, 40, 25].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="flex-1 h-4 bg-muted/50 rounded overflow-hidden">
              <div className="h-full bg-muted rounded" style={{ width: `${w}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="h-40 bg-muted/50 rounded-lg flex items-center justify-center">
        <div className="h-32 w-32 bg-muted rounded-full" />
      </div>
    </div>
  );
}

export function RecommendationsPlaceholder() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <div className="h-5 w-5 bg-muted rounded-full shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="h-4 w-2/3 bg-muted rounded mb-2" />
            <div className="h-3 w-full bg-muted rounded mb-1" />
            <div className="h-3 w-4/5 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
