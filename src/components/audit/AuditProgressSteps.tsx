import { cn } from '@/lib/utils';
import { Check, Loader2, Database, Calculator, FileBarChart } from 'lucide-react';

export type AuditStepId = 'fetching' | 'calculating' | 'building';

interface AuditProgressStepsProps {
  currentStep: AuditStepId;
  pageName?: string;
  className?: string;
}

const steps = [
  { id: 'fetching' as const, label: 'Fetching Page Data', icon: Database },
  { id: 'calculating' as const, label: 'Calculating Metrics', icon: Calculator },
  { id: 'building' as const, label: 'Building Report', icon: FileBarChart },
];

const stepOrder: Record<AuditStepId, number> = {
  fetching: 0,
  calculating: 1,
  building: 2,
};

/**
 * 3-Step Progress Indicator (C3)
 * Clean, readable, mobile-friendly audit progress UI
 */
export function AuditProgressSteps({ currentStep, pageName, className }: AuditProgressStepsProps) {
  const currentIndex = stepOrder[currentStep];

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6 sm:p-8', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold mb-2">Analyzing Your Page</h3>
        {pageName && (
          <p className="text-muted-foreground">
            Running audit for <span className="font-medium text-foreground">{pageName}</span>
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-0 max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                {/* Icon Circle */}
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-300',
                    isComplete && 'bg-success border-success text-success-foreground',
                    isCurrent && 'bg-primary/10 border-primary text-primary animate-pulse',
                    !isComplete && !isCurrent && 'bg-muted border-border text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <Check className="h-6 w-6" />
                  ) : isCurrent ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isCurrent && 'text-primary',
                      isComplete && 'text-success',
                      !isComplete && !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Step {index + 1} of 3
                  </p>
                </div>
              </div>

              {/* Connector (not after last step) */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block w-12 lg:w-20 h-0.5 mx-2">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      index < currentIndex ? 'bg-success' : 'bg-border'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Message */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Loader2 className="h-4 w-4 animate-spin" />
          {currentStep === 'fetching' && 'Connecting to Facebook API...'}
          {currentStep === 'calculating' && 'Analyzing engagement patterns...'}
          {currentStep === 'building' && 'Generating your report...'}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline progress for smaller spaces
 */
export function AuditProgressInline({ currentStep }: { currentStep: AuditStepId }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isComplete = index < stepOrder[currentStep];
        const isCurrent = index === stepOrder[currentStep];
        
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                isComplete && 'bg-success text-success-foreground',
                isCurrent && 'bg-primary text-primary-foreground',
                !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
              )}
            >
              {isComplete ? <Check className="h-3 w-3" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                'w-8 h-0.5 rounded-full',
                isComplete ? 'bg-success' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
