import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  CheckCircle2, 
  Bookmark, 
  Check, 
  Lightbulb,
  TrendingUp,
  Clock,
  Zap,
  Target,
  MessageSquare,
  Share2,
  Users,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/ui/pro-badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export type ImpactLevel = 'high' | 'medium' | 'low';
export type EffortLevel = 'easy' | 'medium' | 'hard';

interface ActionCardProps {
  title: string;
  description: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  category?: string;
  steps?: string[];
  isPro?: boolean;
  isCompleted?: boolean;
  isSaved?: boolean;
  onMarkComplete?: () => void;
  onSave?: () => void;
  className?: string;
}

const impactConfig = {
  high: { label: 'High Impact', color: 'bg-success/10 text-success border-success/20' },
  medium: { label: 'Medium Impact', color: 'bg-warning/10 text-warning border-warning/20' },
  low: { label: 'Low Impact', color: 'bg-muted text-muted-foreground border-border' },
};

const effortConfig = {
  easy: { label: 'Easy', color: 'bg-accent/10 text-accent border-accent/20' },
  medium: { label: 'Medium', color: 'bg-warning/10 text-warning border-warning/20' },
  hard: { label: 'Hard', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const categoryIcons: Record<string, React.ElementType> = {
  engagement: TrendingUp,
  content: MessageSquare,
  timing: Clock,
  growth: Users,
  optimization: Zap,
  strategy: Target,
  sharing: Share2,
  analytics: BarChart3,
  default: Lightbulb,
};

export function ActionCard({
  title,
  description,
  impact,
  effort,
  category = 'default',
  steps = [],
  isPro = false,
  isCompleted = false,
  isSaved = false,
  onMarkComplete,
  onSave,
  className,
}: ActionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const [saved, setSaved] = useState(isSaved);

  const Icon = categoryIcons[category.toLowerCase()] || categoryIcons.default;
  const impactStyle = impactConfig[impact];
  const effortStyle = effortConfig[effort];

  const handleComplete = () => {
    setCompleted(!completed);
    onMarkComplete?.();
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave?.();
  };

  return (
    <div
      className={cn(
        'action-card-premium rounded-xl border bg-card transition-all duration-200',
        completed ? 'border-success/30 bg-success/5' : 'border-border hover:border-primary/20',
        'hover:shadow-md',
        className
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
            completed ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
          )}>
            {completed ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className={cn(
                'font-semibold text-base leading-tight',
                completed && 'line-through text-muted-foreground'
              )}>
                {title}
              </h4>
              {isPro && <ProBadge size="sm" />}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border',
                impactStyle.color
              )}>
                {impactStyle.label}
              </span>
              <span className={cn(
                'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border',
                effortStyle.color
              )}>
                {effortStyle.label}
              </span>
            </div>
          </div>
        </div>

        {/* Steps (Collapsible) */}
        {steps.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )} />
                <span>{isOpen ? 'Hide steps' : `Show ${steps.length} steps`}</span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <Button
            variant={completed ? 'default' : 'outline'}
            size="sm"
            onClick={handleComplete}
            className={cn(completed && 'bg-success hover:bg-success/90')}
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {completed ? 'Completed' : 'Mark Done'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={cn(saved && 'text-primary')}
          >
            <Bookmark className={cn('mr-1.5 h-3.5 w-3.5', saved && 'fill-current')} />
            {saved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Compact version for lists
export function ActionCardCompact({
  title,
  impact,
  effort,
  isPro,
  onClick,
}: {
  title: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  isPro?: boolean;
  onClick?: () => void;
}) {
  const impactStyle = impactConfig[impact];
  const effortStyle = effortConfig[effort];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/20 hover:bg-muted/30 transition-all text-left group"
    >
      <CheckCircle2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      <span className="flex-1 text-sm font-medium truncate">{title}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={cn('px-1.5 py-0.5 text-[10px] font-medium rounded', impactStyle.color)}>
          {impact.charAt(0).toUpperCase()}
        </span>
        <span className={cn('px-1.5 py-0.5 text-[10px] font-medium rounded', effortStyle.color)}>
          {effort.charAt(0).toUpperCase()}
        </span>
        {isPro && <ProBadge size="sm" />}
      </div>
    </button>
  );
}
