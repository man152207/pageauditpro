import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon, title, description, action, className }, ref) => {
    return (
      <div ref={ref} className={cn('empty-state animate-fade-in', className)}>
        {Icon && (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        
        {description && (
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            {description}
          </p>
        )}
        
        {action && (
          action.href ? (
            <Button asChild>
              <Link to={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
