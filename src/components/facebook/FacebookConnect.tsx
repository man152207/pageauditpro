import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  ExternalLink,
  Facebook,
  Loader2,
  RefreshCw,
  Trash2,
  Unplug,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FBPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
}

interface FBConnection {
  id: string;
  page_id: string;
  page_name: string;
  is_active: boolean;
  connected_at: string;
  token_expires_at: string | null;
}

export function FacebookConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connections, setConnections] = useState<FBConnection[]>([]);
  const [showPagesDialog, setShowPagesDialog] = useState(false);
  const [availablePages, setAvailablePages] = useState<FBPage[]>([]);
  const [savingPage, setSavingPage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }

    // Listen for OAuth callback
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'fb-oauth-success') {
        setConnecting(false);
        setAvailablePages(event.data.pages);
        setShowPagesDialog(true);
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
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('facebook-oauth', {
        body: {},
        headers: {},
      });

      // Get auth URL from edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-oauth?action=get-auth-url`,
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
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

  const handleSelectPage = async (page: FBPage) => {
    setSavingPage(page.id);

    try {
      const session = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-oauth?action=save-connection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.session?.access_token}`,
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
        description: `${page.name} is now connected to your account.`,
      });

      setShowPagesDialog(false);
      setAvailablePages([]);
      fetchConnections();
    } catch (error: any) {
      toast({
        title: 'Failed to Save',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSavingPage(null);
    }
  };

  const handleDisconnect = async (connection: FBConnection) => {
    if (!confirm(`Disconnect ${connection.page_name}?`)) return;

    try {
      const { error } = await supabase
        .from('fb_connections')
        .update({ is_active: false })
        .eq('id', connection.id);

      if (error) throw error;

      toast({
        title: 'Page Disconnected',
        description: `${connection.page_name} has been disconnected.`,
      });

      fetchConnections();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect page',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connected Pages */}
      {connections.length > 0 && (
        <div className="space-y-3">
          {connections.map((conn) => (
            <div
              key={conn.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1877F2] text-white">
                  <Facebook className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{conn.page_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Connected {new Date(conn.connected_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDisconnect(conn)}
                >
                  <Unplug className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Button */}
      <Button
        onClick={handleConnect}
        disabled={connecting}
        className="w-full bg-[#1877F2] hover:bg-[#166fe5]"
      >
        {connecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Facebook className="mr-2 h-4 w-4" />
            {connections.length > 0 ? 'Connect Another Page' : 'Connect Facebook Page'}
          </>
        )}
      </Button>

      {/* Pages Selection Dialog */}
      <Dialog open={showPagesDialog} onOpenChange={setShowPagesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Page</DialogTitle>
            <DialogDescription>
              Choose which Facebook page you want to connect for auditing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {availablePages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No pages found. Make sure you have admin access to at least one Facebook page.
              </p>
            ) : (
              availablePages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPage(page)}
                  disabled={savingPage === page.id}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
                      <Facebook className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{page.name}</p>
                      {page.category && (
                        <p className="text-xs text-muted-foreground">{page.category}</p>
                      )}
                    </div>
                  </div>
                  {savingPage === page.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPagesDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
