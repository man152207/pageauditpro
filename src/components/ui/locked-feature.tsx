import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface LockedFeatureProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function LockedFeature({
  children,
  title = 'Pro Feature',
  description = 'Upgrade to Pro to unlock this feature',
  className,
}: LockedFeatureProps) {
  return (
    <div className={cn('relative rounded-xl overflow-hidden', className)}>
      {/* Blurred content */}
      <div className="relative">
        <div className="pointer-events-none select-none">
          {children}
        </div>
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-background/60" />
      </div>

      {/* Overlay content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4 animate-bounce-soft">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <ProBadge glow />
        </div>
        
        <p className="text-sm text-muted-foreground mb-5 max-w-xs">
          {description}
        </p>
        
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/dashboard/billing">
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Link>
        </Button>
      </div>
    </div>
  );
}
