import { AlertCircle, Settings, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface IntegrationError {
  error_code: string;
  human_message: string;
  fix_steps: string[];
  is_config_issue: boolean;
  missing_keys?: string[];
}

interface ErrorAlertProps {
  error: IntegrationError;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onDismiss, onRetry }: ErrorAlertProps) {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  const goToSettings = () => {
    navigate('/super-admin/settings');
  };

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-base font-semibold">
        {error.human_message}
      </AlertTitle>
      <AlertDescription className="mt-3">
        <div className="space-y-3">
          <p className="text-sm font-medium">How to fix this:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {error.fix_steps.map((step, index) => (
              <li key={index} className="text-muted-foreground">
                {step}
              </li>
            ))}
          </ol>

          {error.missing_keys && error.missing_keys.length > 0 && (
            <div className="mt-3 p-2 bg-muted/50 rounded-md">
              <p className="text-xs font-medium mb-1">Missing configuration:</p>
              <div className="flex flex-wrap gap-1">
                {error.missing_keys.map((key) => (
                  <code key={key} className="text-xs bg-background px-1.5 py-0.5 rounded">
                    {key}
                  </code>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {error.is_config_issue && isSuperAdmin && (
              <Button size="sm" onClick={goToSettings} className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Go to Settings
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Try Again
              </Button>
            )}
            
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>

          {error.is_config_issue && !isSuperAdmin && (
            <p className="text-xs text-muted-foreground mt-2">
              Please contact your Super Admin to configure this integration.
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface SuccessAlertProps {
  title: string;
  message: string;
  onDismiss?: () => void;
}

export function SuccessAlert({ title, message, onDismiss }: SuccessAlertProps) {
  return (
    <Alert className="my-4 border-success/50 bg-success/10">
      <CheckCircle2 className="h-5 w-5 text-success" />
      <AlertTitle className="text-base font-semibold text-success">
        {title}
      </AlertTitle>
      <AlertDescription className="mt-1 text-sm text-muted-foreground">
        {message}
        {onDismiss && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onDismiss}
            className="ml-2"
          >
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
