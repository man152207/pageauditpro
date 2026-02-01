import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useShareReport() {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const createShareLink = async (auditId: string) => {
    setIsSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-report', {
        body: { audit_id: auditId, action: 'create' },
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to create share link');
      }

      setShareUrl(data.share_url);
      toast.success('Share link created!');
      return data.share_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create share link';
      toast.error(message);
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  const revokeShareLink = async (auditId: string) => {
    setIsSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-report', {
        body: { audit_id: auditId, action: 'revoke' },
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to revoke share link');
      }

      setShareUrl(null);
      toast.success('Share link revoked');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke share link';
      toast.error(message);
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return { createShareLink, revokeShareLink, copyToClipboard, isSharing, shareUrl, setShareUrl };
}
