import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRunAudit } from '@/hooks/useAudits';
import { useSubscription } from '@/hooks/useSubscription';
import {
  CheckCircle2,
  Facebook,
  Loader2,
  PlayCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface FBConnection {
  id: string;
  page_id: string;
  page_name: string;
  is_active: boolean;
  connected_at: string;
}

interface AuditFlowProps {
  onComplete?: (auditId: string) => void;
}

type FlowStep = 'connect' | 'select' | 'running' | 'complete';

export function AuditFlow({ onComplete }: AuditFlowProps) {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isPro, usage, hasReachedLimit } = useSubscription();
  const runAudit = useRunAudit();

  const [step, setStep] = useState<FlowStep>('connect');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connections, setConnections] = useState<FBConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<FBConnection | null>(null);
  const [completedAuditId, setCompletedAuditId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }

    // Listen for OAuth callback
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'fb-oauth-success') {
        setConnecting(false);
        handleOAuthSuccess(event.data.pages);
      } else if (event.data.type === 'fb-oauth-error') {
        setConnecting(false);
        toast({
          title: 'Connection Failed',
          description: event.data.error,
          variant: 'destructive',
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('fb_connections')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('connected_at', { ascending: false });

      if (error) throw error;
      
      setConnections(data || []);
      
      // If user has connections, go to select step
      if (data && data.length > 0) {
        setStep('select');
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-oauth?action=get-auth-url`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Open popup for OAuth
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        result.authUrl,
        'facebook-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error: any) {
      setConnecting(false);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to start Facebook connection',
        variant: 'destructive',
      });
    }
  };

  const handleOAuthSuccess = async (pages: any[]) => {
    if (pages.length === 0) {
      toast({
        title: 'No Pages Found',
        description: 'Make sure you have admin access to at least one Facebook page.',
        variant: 'destructive',
      });
      return;
    }

    // If only one page, auto-select and save it
    if (pages.length === 1) {
      await saveAndSelectPage(pages[0]);
    } else {
      // Multiple pages - for now just save the first one
      // TODO: Show page selection dialog
      await saveAndSelectPage(pages[0]);
    }
  };

  const saveAndSelectPage = async (page: any) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-oauth?action=save-connection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            page_id: page.id,
            page_name: page.name,
            access_token: page.access_token,
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Page Connected!',
        description: `${page.name} is now connected.`,
      });

      await fetchConnections();
      
      // Auto-run audit on the newly connected page
      if (result.connection) {
        await handleRunAudit(result.connection);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Save',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRunAudit = async (connection: FBConnection) => {
    // Check usage limits for free users
    if (!isPro && hasReachedLimit('audits')) {
      toast({
        title: 'Audit Limit Reached',
        description: `You've used all ${usage.auditsLimit} audits this month. Upgrade to Pro for unlimited audits.`,
        variant: 'destructive',
      });
      return;
    }

    setSelectedConnection(connection);
    setStep('running');

    try {
      const result = await runAudit.mutateAsync(connection.id);
      setCompletedAuditId(result.audit_id);
      setStep('complete');
    } catch (error) {
      setStep('select');
    }
  };

  const handleViewReport = () => {
    if (completedAuditId) {
      navigate(`/dashboard/reports/${completedAuditId}`);
      onComplete?.(completedAuditId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Step 1: Connect Facebook
  if (step === 'connect') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1877F2]/10 mx-auto mb-6">
          <Facebook className="h-10 w-10 text-[#1877F2]" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Connect Your Facebook Page</h2>
        <p className="text-muted-foreground mb-6">
          Connect your Facebook page to automatically analyze your engagement, 
          content performance, and get personalized recommendations.
        </p>
        
        {!isPro && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm text-muted-foreground">
            <p>
              <strong>Free Plan:</strong> {usage.auditsRemaining} of {usage.auditsLimit} audits remaining this month
            </p>
          </div>
        )}

        <Button
          onClick={handleConnect}
          disabled={connecting}
          size="lg"
          className="w-full bg-[#1877F2] hover:bg-[#166fe5]"
        >
          {connecting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Facebook className="mr-2 h-5 w-5" />
              Connect with Facebook
            </>
          )}
        </Button>
      </div>
    );
  }

  // Step 2: Select Page & Run Audit
  if (step === 'select') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Page Connected!</h2>
          <p className="text-muted-foreground">
            Select a page to run your audit
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {connections.map((conn) => (
            <div
              key={conn.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1877F2] text-white">
                  <Facebook className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{conn.page_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Connected {new Date(conn.connected_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleRunAudit(conn)}
                disabled={runAudit.isPending}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Audit
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={handleConnect} disabled={connecting}>
            <Facebook className="mr-2 h-4 w-4" />
            Connect Another Page
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Running Audit
  if (step === 'running') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="relative mb-8">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse-glow">
            <Zap className="h-12 w-12 text-primary animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3">Analyzing Your Page...</h2>
        <p className="text-muted-foreground mb-2">
          Fetching data from <strong>{selectedConnection?.page_name}</strong>
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          This usually takes 10-20 seconds
        </p>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Processing...</span>
        </div>
      </div>
    );
  }

  // Step 4: Complete
  if (step === 'complete') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10 mx-auto mb-6 animate-bounce-soft">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Audit Complete! 🎉</h2>
        <p className="text-muted-foreground mb-8">
          Your page analysis is ready. View your personalized report and recommendations.
        </p>
        <Button onClick={handleViewReport} size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          View Your Report
        </Button>
      </div>
    );
  }

  return null;
}
