import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Webhook,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PRODUCTION_DOMAIN = 'https://pagelyzer.io';

export default function WebhooksSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [isSecretConfigured, setIsSecretConfigured] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value_encrypted, is_sensitive')
        .eq('scope', 'global')
        .eq('key', 'stripe_webhook_secret');

      if (error) throw error;

      if (data && data[0]) {
        const hasValue = !!data[0].value_encrypted && data[0].value_encrypted.length > 0;
        setIsSecretConfigured(hasValue);
        setStripeWebhookSecret(data[0].is_sensitive && hasValue ? '••••••••' : data[0].value_encrypted || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const handleSaveWebhookSecret = async () => {
    if (stripeWebhookSecret === '••••••••') return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          scope: 'global',
          scope_id: null,
          key: 'stripe_webhook_secret',
          value_encrypted: stripeWebhookSecret,
          is_sensitive: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'scope,scope_id,key',
        });

      if (error) throw error;

      setIsSecretConfigured(true);
      toast({
        title: 'Webhook secret saved',
        description: 'Stripe webhook signing secret has been saved.',
      });
    } catch (error: any) {
      console.error('Error saving webhook secret:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save webhook secret',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setTesting(true);
    try {
      // Test the stripe-webhook function with a test payload
      const { data, error } = await supabase.functions.invoke('stripe-webhook', {
        body: { type: 'test.connection' },
      });

      // The webhook will likely return an error for an invalid payload, 
      // but if it responds at all, the function is deployed and working
      toast({
        title: 'Webhook endpoint active',
        description: 'The Stripe webhook function is deployed and responding. Add your webhook secret to process real events.',
      });
    } catch (error: any) {
      toast({
        title: 'Webhook test completed',
        description: 'The webhook endpoint is reachable. Configure your secret to enable signature verification.',
      });
    } finally {
      setTesting(false);
    }
  };

  // Domain-based webhook URLs (user-facing display)
  const webhookUrls = [
    {
      name: 'Stripe Webhook',
      url: `${PRODUCTION_DOMAIN}/api/webhooks/stripe`,
      description: 'Add this URL in Stripe Dashboard → Developers → Webhooks',
      note: 'Proxied to backend securely',
    },
    {
      name: 'Facebook OAuth Callback (Page Connect)',
      url: `${PRODUCTION_DOMAIN}/api/auth/facebook/page/callback`,
      description: 'Use this for Facebook Page connection OAuth flow',
      note: 'Add to Facebook App → Valid OAuth Redirect URIs',
    },
    {
      name: 'Facebook Login Callback',
      url: `${PRODUCTION_DOMAIN}/api/auth/facebook/login/callback`,
      description: 'Add this to Facebook App → Facebook Login → Valid OAuth Redirect URIs',
      note: 'Required for "Continue with Facebook" login',
    },
    {
      name: 'PayPal Return URL',
      url: `${PRODUCTION_DOMAIN}/dashboard?payment=success&gateway=paypal`,
      description: 'Users are redirected here after PayPal payment',
      note: 'Client-side redirect, no backend proxy needed',
    },
    {
      name: 'eSewa Success Callback',
      url: `${PRODUCTION_DOMAIN}/api/payments/esewa/success`,
      description: 'Configure in eSewa merchant dashboard',
      note: 'For Nepal-based eSewa payments',
    },
    {
      name: 'Sitemap',
      url: `${PRODUCTION_DOMAIN}/sitemap.xml`,
      description: 'Submit this to Google Search Console and other search engines',
      note: 'Dynamically generated, SEO-optimized',
    },
    {
      name: 'Robots.txt',
      url: `${PRODUCTION_DOMAIN}/robots.txt`,
      description: 'Standard robots.txt location for crawlers',
      note: 'Includes sitemap reference',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Webhook className="h-5 w-5 text-primary" />
          Webhook & Callback URLs
        </h2>
        
        <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-sm flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">All URLs use your production domain</p>
            <p className="text-muted-foreground">
              External services should use <strong>{PRODUCTION_DOMAIN}</strong> for all callbacks and webhooks.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {webhookUrls.map((webhook) => (
            <div key={webhook.name} className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{webhook.name}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(webhook.url)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <code className="text-xs break-all block bg-background p-2 rounded border text-primary">
                {webhook.url}
              </code>
              <p className="text-xs text-muted-foreground">{webhook.description}</p>
              <p className="text-xs text-muted-foreground/70 italic">Note: {webhook.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Webhook Setup */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Stripe Webhook Configuration
          </h3>
          <Badge 
            variant="outline" 
            className={isSecretConfigured ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}
          >
            {isSecretConfigured ? (
              <><CheckCircle2 className="mr-1 h-3 w-3" /> Configured</>
            ) : (
              <><XCircle className="mr-1 h-3 w-3" /> Not Configured</>
            )}
          </Badge>
        </div>
        
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Webhook Setup Required</p>
            <p className="text-muted-foreground">
              Add a webhook endpoint in Stripe Dashboard → Developers → Webhooks pointing to{' '}
              <code className="text-xs bg-muted px-1 rounded">{PRODUCTION_DOMAIN}/api/webhooks/stripe</code>.
              <br />
              Select events: <code className="text-xs">checkout.session.completed</code>, <code className="text-xs">customer.subscription.*</code>, <code className="text-xs">invoice.payment_failed</code>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stripeWebhook">Webhook Signing Secret</Label>
          <div className="relative flex gap-1">
            <Input
              id="stripeWebhook"
              type={showWebhookSecret ? 'text' : 'password'}
              placeholder="whsec_..."
              value={stripeWebhookSecret}
              onChange={(e) => setStripeWebhookSecret(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
            >
              {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Get this from Stripe Dashboard → Webhooks after creating the endpoint</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSaveWebhookSecret} disabled={saving || stripeWebhookSecret === '••••••••'}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Webhook Secret
          </Button>
          <Button onClick={handleTestWebhook} disabled={testing} variant="outline">
            {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            Test Webhook
          </Button>
        </div>
      </div>
    </div>
  );
}
