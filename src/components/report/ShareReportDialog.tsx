import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useShareReport } from '@/hooks/useShareReport';
import { Copy, ExternalLink, Link2Off, Loader2, Share2 } from 'lucide-react';

interface ShareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditId: string;
  existingShareSlug?: string | null;
  existingIsPublic?: boolean;
}

export function ShareReportDialog({
  open,
  onOpenChange,
  auditId,
  existingShareSlug,
  existingIsPublic = false,
}: ShareReportDialogProps) {
  const { createShareLink, revokeShareLink, copyToClipboard, isSharing } = useShareReport();
  const [isPublic, setIsPublic] = useState(existingIsPublic);
  const [shareUrl, setShareUrl] = useState<string | null>(
    existingShareSlug ? `${window.location.origin}/r/${existingShareSlug}` : null
  );

  useEffect(() => {
    setIsPublic(existingIsPublic);
    setShareUrl(existingShareSlug ? `${window.location.origin}/r/${existingShareSlug}` : null);
  }, [existingShareSlug, existingIsPublic]);

  const handleTogglePublic = async (checked: boolean) => {
    if (checked) {
      const url = await createShareLink(auditId);
      if (url) {
        setShareUrl(url);
        setIsPublic(true);
      }
    } else {
      const success = await revokeShareLink(auditId);
      if (success) {
        setShareUrl(null);
        setIsPublic(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Report
          </DialogTitle>
          <DialogDescription>
            Create a shareable link for this audit report. Anyone with the link can view the report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public">Make report public</Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone with the link to view this report
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={isSharing}
            />
          </div>

          {/* Share URL */}
          {isPublic && shareUrl && (
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(shareUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(shareUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isSharing && (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>{isPublic ? 'Creating share link...' : 'Revoking share link...'}</span>
            </div>
          )}

          {/* Revoke info */}
          {isPublic && shareUrl && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Link2Off className="h-3 w-3" />
              Toggle off to revoke access and disable the share link
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
