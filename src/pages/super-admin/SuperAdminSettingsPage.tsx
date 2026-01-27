import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Facebook,
  FileText,
  Globe,
  Key,
  Loader2,
  Save,
  Settings,
  Shield,
  Webhook,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingValue {
  key: string;
  value: string;
  is_sensitive: boolean;
}

export default function SuperAdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Settings state
  const [settings, setSettings] = useState({
    // General
    app_name: 'Pagelyzer',
    support_email: 'support@pagelyzer.io',
    logo_url: '',
    
    // Facebook
    facebook_app_id: '',
    facebook_app_secret: '',
    facebook_redirect_url: '',
    
    // Stripe
    stripe_publishable_key: '',
    stripe_webhook_secret: '',
    
    // SEO - Basic
    seo_title: 'Pagelyzer - Smart Facebook Page Audit Platform',
    seo_description: 'Get instant page health scores, engagement analysis, and AI-powered recommendations.',
    seo_keywords: '',
    og_image_url: '',
    favicon_url: '',
    canonical_url: 'https://pagelyzer.io',
    
    // SEO - Search Console Verification
    google_verification: '',
    bing_verification: '',
    yandex_verification: '',
    pinterest_verification: '',
    
    // SEO - Analytics & Tracking
    google_analytics_id: '',
    google_tag_manager_id: '',
    facebook_pixel_id: '',
    
    // SEO - Sitemap & Robots
    sitemap_url: 'https://pagelyzer.io/sitemap.xml',
    robots_txt_content: '',
    
    // Security
    require_2fa_admins: true,
    session_timeout_minutes: 30,
    rate_limit_per_minute: 60,
    enable_audit_logs: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value_encrypted, is_sensitive')
        .eq('scope', 'global');

      if (error) throw error;

      if (data) {
        const newSettings = { ...settings };
        data.forEach((item) => {
          const key = item.key as keyof typeof settings;
          if (key in newSettings) {
            // For sensitive values, show placeholder if exists
            if (item.is_sensitive && item.value_encrypted) {
              (newSettings[key] as any) = '••••••••';
            } else {
              (newSettings[key] as any) = item.value_encrypted || '';
            }
          }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = (key: keyof typeof settings, value: string | boolean | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async (settingsToSave: { key: string; value: string; is_sensitive: boolean }[]) => {
    setSaving(true);
    
    try {
      for (const setting of settingsToSave) {
        // Skip if it's a masked value
        if (setting.is_sensitive && setting.value === '••••••••') {
          continue;
        }

        const { error } = await supabase
          .from('settings')
          .upsert({
            scope: 'global',
            scope_id: null,
            key: setting.key,
            value_encrypted: setting.value, // In production, encrypt this!
            is_sensitive: setting.is_sensitive,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'scope,scope_id,key',
          });

        if (error) throw error;
      }

      toast({
        title: 'Settings saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = () => {
    saveSettings([
      { key: 'app_name', value: settings.app_name, is_sensitive: false },
      { key: 'support_email', value: settings.support_email, is_sensitive: false },
      { key: 'logo_url', value: settings.logo_url, is_sensitive: false },
    ]);
  };

  const handleSaveIntegrations = () => {
    saveSettings([
      { key: 'facebook_app_id', value: settings.facebook_app_id, is_sensitive: false },
      { key: 'facebook_app_secret', value: settings.facebook_app_secret, is_sensitive: true },
      { key: 'facebook_redirect_url', value: settings.facebook_redirect_url, is_sensitive: false },
    ]);
  };

  const handleSavePayment = () => {
    saveSettings([
      { key: 'stripe_publishable_key', value: settings.stripe_publishable_key, is_sensitive: false },
      { key: 'stripe_webhook_secret', value: settings.stripe_webhook_secret, is_sensitive: true },
    ]);
  };

  const handleSaveSeo = () => {
    saveSettings([
      // Basic SEO
      { key: 'seo_title', value: settings.seo_title, is_sensitive: false },
      { key: 'seo_description', value: settings.seo_description, is_sensitive: false },
      { key: 'seo_keywords', value: settings.seo_keywords, is_sensitive: false },
      { key: 'og_image_url', value: settings.og_image_url, is_sensitive: false },
      { key: 'favicon_url', value: settings.favicon_url, is_sensitive: false },
      { key: 'canonical_url', value: settings.canonical_url, is_sensitive: false },
      // Search Console Verification
      { key: 'google_verification', value: settings.google_verification, is_sensitive: false },
      { key: 'bing_verification', value: settings.bing_verification, is_sensitive: false },
      { key: 'yandex_verification', value: settings.yandex_verification, is_sensitive: false },
      { key: 'pinterest_verification', value: settings.pinterest_verification, is_sensitive: false },
      // Analytics & Tracking
      { key: 'google_analytics_id', value: settings.google_analytics_id, is_sensitive: false },
      { key: 'google_tag_manager_id', value: settings.google_tag_manager_id, is_sensitive: false },
      { key: 'facebook_pixel_id', value: settings.facebook_pixel_id, is_sensitive: false },
      // Sitemap & Robots
      { key: 'sitemap_url', value: settings.sitemap_url, is_sensitive: false },
      { key: 'robots_txt_content', value: settings.robots_txt_content, is_sensitive: false },
    ]);
  };

  const handleSaveSecurity = () => {
    saveSettings([
      { key: 'require_2fa_admins', value: String(settings.require_2fa_admins), is_sensitive: false },
      { key: 'session_timeout_minutes', value: String(settings.session_timeout_minutes), is_sensitive: false },
      { key: 'rate_limit_per_minute', value: String(settings.rate_limit_per_minute), is_sensitive: false },
      { key: 'enable_audit_logs', value: String(settings.enable_audit_logs), is_sensitive: false },
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings, integrations, and security policies.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-1">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              General Settings
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name</Label>
                <Input 
                  id="appName" 
                  value={settings.app_name}
                  onChange={(e) => updateSetting('app_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input 
                  id="supportEmail" 
                  type="email" 
                  value={settings.support_email}
                  onChange={(e) => updateSetting('support_email', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input 
                id="logoUrl" 
                placeholder="https://..." 
                value={settings.logo_url}
                onChange={(e) => updateSetting('logo_url', e.target.value)}
              />
            </div>

            <Button onClick={handleSaveGeneral} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* Facebook API */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-[#1877F2]" />
                  Facebook API
                </h3>
                <Badge variant="outline" className={settings.facebook_app_id ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                  {settings.facebook_app_id ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground">
                  To enable Facebook OAuth, create an app at{' '}
                  <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    developers.facebook.com
                  </a>
                </p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fbAppId">App ID</Label>
                  <Input 
                    id="fbAppId" 
                    placeholder="Enter Facebook App ID" 
                    value={settings.facebook_app_id}
                    onChange={(e) => updateSetting('facebook_app_id', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fbAppSecret">App Secret</Label>
                  <div className="relative">
                    <Input
                      id="fbAppSecret"
                      type={showSecrets.fbSecret ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={settings.facebook_app_secret}
                      onChange={(e) => updateSetting('facebook_app_secret', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => toggleSecret('fbSecret')}
                    >
                      {showSecrets.fbSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fbRedirectUrl">OAuth Redirect URL</Label>
                <Input 
                  id="fbRedirectUrl" 
                  placeholder="https://yourapp.com/auth/facebook/callback" 
                  value={settings.facebook_redirect_url}
                  onChange={(e) => updateSetting('facebook_redirect_url', e.target.value)}
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">Required Scopes:</p>
                <code className="text-xs">pages_show_list, pages_read_engagement, pages_read_user_content, read_insights</code>
              </div>
            </div>

            {/* Webhooks Info */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                Webhook Endpoints
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium mb-1">Stripe Webhook URL:</p>
                  <code className="text-xs break-all">
                    {window.location.origin.replace('preview', 'api')}/functions/v1/stripe-webhook
                  </code>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium mb-1">Facebook OAuth Callback:</p>
                  <code className="text-xs break-all">
                    {window.location.origin.replace('preview', 'api')}/functions/v1/facebook-oauth?action=callback
                  </code>
                </div>
              </div>
            </div>

            <Button onClick={handleSaveIntegrations} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Integration Settings
            </Button>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Gateway (Stripe)
              </h2>
              <Badge variant="outline" className="bg-success/10 text-success">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Connected via Lovable
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-success/10 border border-success/20 flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Stripe is Connected</p>
                <p className="text-muted-foreground">
                  Your Stripe Secret Key is already configured through Lovable's secure integration.
                  You only need to add the webhook secret below.
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stripePublic">Publishable Key (Optional)</Label>
                <Input 
                  id="stripePublic" 
                  placeholder="pk_live_..." 
                  value={settings.stripe_publishable_key}
                  onChange={(e) => updateSetting('stripe_publishable_key', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">For client-side Stripe.js (optional)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripeWebhook">Webhook Signing Secret</Label>
                <div className="relative">
                  <Input
                    id="stripeWebhook"
                    type={showSecrets.stripeWebhook ? 'text' : 'password'}
                    placeholder="whsec_..."
                    value={settings.stripe_webhook_secret}
                    onChange={(e) => updateSetting('stripe_webhook_secret', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => toggleSecret('stripeWebhook')}
                  >
                    {showSecrets.stripeWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Get this from Stripe Dashboard → Webhooks</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Webhook Setup Required</p>
                <p className="text-muted-foreground">
                  Add a webhook endpoint in Stripe Dashboard pointing to your webhook URL above.
                  Select events: checkout.session.completed, customer.subscription.*, invoice.payment_failed
                </p>
              </div>
            </div>

            <Button onClick={handleSavePayment} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Payment Settings
            </Button>
          </div>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo">
          <div className="space-y-6">
            {/* Basic SEO & OpenGraph */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Basic SEO & OpenGraph
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">Default Title</Label>
                  <Input 
                    id="seoTitle" 
                    placeholder="Pagelyzer - Smart Facebook Page Audit Platform"
                    value={settings.seo_title}
                    onChange={(e) => updateSetting('seo_title', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Max 60 characters recommended</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input 
                    id="canonicalUrl" 
                    placeholder="https://pagelyzer.io"
                    value={settings.canonical_url}
                    onChange={(e) => updateSetting('canonical_url', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Input 
                  id="seoDescription" 
                  placeholder="Get instant page health scores, engagement analysis, and AI-powered recommendations."
                  value={settings.seo_description}
                  onChange={(e) => updateSetting('seo_description', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Max 160 characters recommended</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Meta Keywords</Label>
                <Input 
                  id="seoKeywords" 
                  placeholder="facebook audit, page analysis, social media, engagement"
                  value={settings.seo_keywords}
                  onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ogImage">OG Image URL</Label>
                  <Input 
                    id="ogImage" 
                    placeholder="https://pagelyzer.io/og-image.png" 
                    value={settings.og_image_url}
                    onChange={(e) => updateSetting('og_image_url', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">1200x630px recommended</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input 
                    id="favicon" 
                    placeholder="https://pagelyzer.io/favicon.ico" 
                    value={settings.favicon_url}
                    onChange={(e) => updateSetting('favicon_url', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Search Console Verification */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Search Console Verification
              </h2>
              
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground">
                  Add verification codes from search engines to verify site ownership. These will be added as meta tags in the HTML head.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="googleVerification">Google Search Console</Label>
                  <Input 
                    id="googleVerification" 
                    placeholder="google-site-verification=..."
                    value={settings.google_verification}
                    onChange={(e) => updateSetting('google_verification', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Get from Google Search Console
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bingVerification">Bing Webmaster</Label>
                  <Input 
                    id="bingVerification" 
                    placeholder="MSVALIDATE.01=..."
                    value={settings.bing_verification}
                    onChange={(e) => updateSetting('bing_verification', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Get from Bing Webmaster Tools
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yandexVerification">Yandex Webmaster</Label>
                  <Input 
                    id="yandexVerification" 
                    placeholder="yandex-verification=..."
                    value={settings.yandex_verification}
                    onChange={(e) => updateSetting('yandex_verification', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    <a href="https://webmaster.yandex.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Get from Yandex Webmaster
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pinterestVerification">Pinterest</Label>
                  <Input 
                    id="pinterestVerification" 
                    placeholder="p:domain_verify=..."
                    value={settings.pinterest_verification}
                    onChange={(e) => updateSetting('pinterest_verification', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    <a href="https://business.pinterest.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Get from Pinterest Business
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics & Tracking */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics & Tracking
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                  <Input 
                    id="googleAnalytics" 
                    placeholder="G-XXXXXXXXXX"
                    value={settings.google_analytics_id}
                    onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">GA4 Measurement ID</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gtmId">Google Tag Manager ID</Label>
                  <Input 
                    id="gtmId" 
                    placeholder="GTM-XXXXXXX"
                    value={settings.google_tag_manager_id}
                    onChange={(e) => updateSetting('google_tag_manager_id', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fbPixel">Facebook Pixel ID</Label>
                  <Input 
                    id="fbPixel" 
                    placeholder="XXXXXXXXXXXXXXXX"
                    value={settings.facebook_pixel_id}
                    onChange={(e) => updateSetting('facebook_pixel_id', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sitemap & Robots */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Sitemap & Robots
              </h2>
              
              <div className="space-y-2">
                <Label htmlFor="sitemapUrl">Sitemap URL</Label>
                <Input 
                  id="sitemapUrl" 
                  placeholder="https://pagelyzer.io/sitemap.xml"
                  value={settings.sitemap_url}
                  onChange={(e) => updateSetting('sitemap_url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The sitemap will be auto-generated and available at this URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="robotsTxt">robots.txt Content</Label>
                <textarea 
                  id="robotsTxt"
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  placeholder={`User-agent: *\nAllow: /\n\nSitemap: https://pagelyzer.io/sitemap.xml`}
                  value={settings.robots_txt_content}
                  onChange={(e) => updateSetting('robots_txt_content', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Custom robots.txt content. Leave empty to use default.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                <p className="font-medium mb-1">Current Sitemap Location:</p>
                <code className="text-xs break-all">
                  {settings.sitemap_url || 'https://pagelyzer.io/sitemap.xml'}
                </code>
              </div>
            </div>

            <Button onClick={handleSaveSeo} disabled={saving} size="lg">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save All SEO Settings
            </Button>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Require 2FA for Admins</p>
                  <p className="text-sm text-muted-foreground">
                    Force all admin users to enable two-factor authentication
                  </p>
                </div>
                <Switch 
                  checked={settings.require_2fa_admins}
                  onCheckedChange={(v) => updateSetting('require_2fa_admins', v)}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Session Timeout (minutes)</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out inactive users
                  </p>
                </div>
                <Input 
                  type="number" 
                  value={settings.session_timeout_minutes}
                  onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value) || 30)}
                  className="w-24" 
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Rate Limiting</p>
                  <p className="text-sm text-muted-foreground">
                    Maximum requests per minute per IP
                  </p>
                </div>
                <Input 
                  type="number" 
                  value={settings.rate_limit_per_minute}
                  onChange={(e) => updateSetting('rate_limit_per_minute', parseInt(e.target.value) || 60)}
                  className="w-24" 
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Enable Audit Logs</p>
                  <p className="text-sm text-muted-foreground">
                    Log all admin actions for security review
                  </p>
                </div>
                <Switch 
                  checked={settings.enable_audit_logs}
                  onCheckedChange={(v) => updateSetting('enable_audit_logs', v)}
                />
              </div>
            </div>

            <Button onClick={handleSaveSecurity} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Security Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
