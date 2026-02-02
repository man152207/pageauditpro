import { cn } from '@/lib/utils';
import { Download, Calculator, Sparkles, Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export type AuditStep = 'fetching' | 'calculating' | 'generating';

interface AuditProgressProps {
  currentStep: AuditStep;
  pageName?: string;
  className?: string;
}

const steps = [
  {
    id: 'fetching' as const,
    title: 'Fetching Page Data',
    description: 'Connecting to Facebook and retrieving your page metrics',
    icon: Download,
    estimatedTime: '5-10s',
  },
  {
    id: 'calculating' as const,
    title: 'Calculating Metrics',
    description: 'Analyzing engagement rates and performance patterns',
    icon: Calculator,
    estimatedTime: '3-5s',
  },
  {
    id: 'generating' as const,
    title: 'Generating Insights',
    description: 'Creating personalized recommendations for your page',
    icon: Sparkles,
    estimatedTime: '5-8s',
  },
];

function getStepStatus(stepId: AuditStep, currentStep: AuditStep) {
  const stepOrder: AuditStep[] = ['fetching', 'calculating', 'generating'];
  const currentIndex = stepOrder.indexOf(currentStep);
  const stepIndex = stepOrder.indexOf(stepId);

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

export function AuditProgress({ currentStep, pageName, className }: AuditProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={cn('rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 sm:p-8', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4 animate-pulse">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Analyzing Your Page</h3>
        {pageName && (
          <p className="text-muted-foreground">
            Processing <strong className="text-foreground">{pageName}</strong>
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Elapsed: {formatTime(elapsedTime)}
        </p>
      </div>

      {/* Steps */}
      <div className="relative max-w-md mx-auto">
        {/* Connector line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />

        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id, currentStep);
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Step indicator */}
                <div
                  className={cn(
                    'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-300',
                    status === 'completed' && 'bg-success border-success text-success-foreground',
                    status === 'active' && 'bg-primary border-primary text-primary-foreground animate-pulse',
                    status === 'pending' && 'bg-muted border-border text-muted-foreground'
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="h-5 w-5" />
                  ) : status === 'active' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={cn(
                        'font-semibold transition-colors',
                        status === 'completed' && 'text-success',
                        status === 'active' && 'text-foreground',
                        status === 'pending' && 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </h4>
                    {status === 'active' && (
                      <span className="text-xs text-muted-foreground">
                        ~{step.estimatedTime}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm mt-0.5',
                      status === 'pending' ? 'text-muted-foreground/60' : 'text-muted-foreground'
                    )}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Status badge */}
                <div className="shrink-0 pt-1">
                  {status === 'completed' && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success">
                      Done
                    </span>
                  )}
                  {status === 'active' && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary animate-pulse">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer tip */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        This usually takes 15-30 seconds. Please don't close this page.
      </p>
    </div>
  );
}

// Compact horizontal version
export function AuditProgressBar({ currentStep, className }: { currentStep: AuditStep; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(step.id, currentStep);
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                status === 'completed' && 'bg-success text-success-foreground',
                status === 'active' && 'bg-primary text-primary-foreground',
                status === 'pending' && 'bg-muted text-muted-foreground'
              )}
            >
              {status === 'completed' ? (
                <Check className="h-4 w-4" />
              ) : status === 'active' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 rounded-full',
                  status === 'completed' ? 'bg-success' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
