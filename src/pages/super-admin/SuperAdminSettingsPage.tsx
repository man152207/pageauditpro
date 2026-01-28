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
  Copy,
  CreditCard,
  Eye,
  EyeOff,
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
import { IntegrationSettings } from '@/components/settings/IntegrationSettings';

const SUPABASE_FUNCTIONS_URL = 'https://wrjqheztddmazlifbzbi.supabase.co/functions/v1';
const PRODUCTION_DOMAIN = 'https://pagelyzer.io';

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
  const [settings, setSettings] = useState<Record<string, string>>({
    // General
    app_name: 'Pagelyzer',
    support_email: 'support@pagelyzer.io',
    logo_url: '',
    
    // Facebook
    facebook_app_id: '',
    facebook_app_secret: '',
    
    // Stripe
    stripe_secret_key: '',
    stripe_publishable_key: '',
    stripe_webhook_secret: '',
    
    // PayPal
    paypal_client_id: '',
    paypal_client_secret: '',
    paypal_sandbox_mode: 'true',
    
    // eSewa
    esewa_merchant_id: '',
    esewa_secret_key: '',
    esewa_sandbox_mode: 'true',
    
    // Email (Resend)
    resend_api_key: '',
    email_from_address: '',
    email_from_name: '',
    
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
    sitemap_url: `${SUPABASE_FUNCTIONS_URL}/sitemap`,
    robots_txt_content: '',
    
    // Security
    require_2fa_admins: 'true',
    session_timeout_minutes: '30',
    rate_limit_per_minute: '60',
    enable_audit_logs: 'true',
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
              newSettings[key] = '••••••••';
            } else {
              newSettings[key] = item.value_encrypted || '';
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

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
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
            value_encrypted: setting.value,
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
      { key: 'require_2fa_admins', value: settings.require_2fa_admins, is_sensitive: false },
      { key: 'session_timeout_minutes', value: settings.session_timeout_minutes, is_sensitive: false },
      { key: 'rate_limit_per_minute', value: settings.rate_limit_per_minute, is_sensitive: false },
      { key: 'enable_audit_logs', value: settings.enable_audit_logs, is_sensitive: false },
    ]);
  };

  // Webhook URLs for display
  const webhookUrls = [
    {
      name: 'Stripe Webhook',
      url: `${SUPABASE_FUNCTIONS_URL}/stripe-webhook`,
      description: 'Add this URL in Stripe Dashboard → Developers → Webhooks',
    },
    {
      name: 'Facebook OAuth Callback (Page Connect)',
      url: `${SUPABASE_FUNCTIONS_URL}/facebook-oauth?action=callback`,
      description: 'Use this for Facebook Page connection OAuth flow',
    },
    {
      name: 'Facebook Login Callback',
      url: `${SUPABASE_FUNCTIONS_URL}/facebook-auth-login?action=callback`,
      description: 'Add this to Facebook App → Facebook Login → Valid OAuth Redirect URIs',
    },
    {
      name: 'PayPal Return URL',
      url: `${PRODUCTION_DOMAIN}/dashboard?payment=success&gateway=paypal`,
      description: 'Users are redirected here after PayPal payment',
    },
    {
      name: 'eSewa Success Callback',
      url: `${SUPABASE_FUNCTIONS_URL}/esewa-checkout?action=success`,
      description: 'Configure in eSewa merchant dashboard',
    },
    {
      name: 'Sitemap',
      url: `${SUPABASE_FUNCTIONS_URL}/sitemap`,
      description: 'Submit this to search engines',
    },
  ];

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
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
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

        {/* Integrations - Using IntegrationSettings Component */}
        <TabsContent value="integrations">
          <IntegrationSettings
            settings={settings}
            updateSetting={updateSetting}
            saveSettings={saveSettings}
            saving={saving}
          />
        </TabsContent>

        {/* Webhooks & Callback URLs */}
        <TabsContent value="webhooks">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                Webhook & Callback URLs
              </h2>
              
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                <p className="font-medium mb-1">Production Domain</p>
                <p className="text-muted-foreground">
                  All webhooks use your Supabase project URL. Your app domain is <strong>{PRODUCTION_DOMAIN}</strong>
                </p>
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
                    <code className="text-xs break-all block bg-background p-2 rounded border">
                      {webhook.url}
                    </code>
                    <p className="text-xs text-muted-foreground">{webhook.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stripe Webhook Setup */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Stripe Webhook Configuration
              </h3>
              
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Webhook Setup Required</p>
                  <p className="text-muted-foreground">
                    Add a webhook endpoint in Stripe Dashboard → Developers → Webhooks pointing to the URL above.
                    Select events: <code className="text-xs">checkout.session.completed</code>, <code className="text-xs">customer.subscription.*</code>, <code className="text-xs">invoice.payment_failed</code>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeWebhook">Webhook Signing Secret</Label>
                <div className="relative flex gap-1">
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
                    onClick={() => toggleSecret('stripeWebhook')}
                  >
                    {showSecrets.stripeWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Get this from Stripe Dashboard → Webhooks after creating the endpoint</p>
              </div>

              <Button 
                onClick={() => saveSettings([
                  { key: 'stripe_webhook_secret', value: settings.stripe_webhook_secret, is_sensitive: true },
                ])} 
                disabled={saving}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Webhook Secret
              </Button>
            </div>
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
              
              <div className="p-4 rounded-lg bg-success/10 border border-success/20 flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Dynamic Sitemap Active</p>
                  <p className="text-muted-foreground">
                    Your sitemap is automatically generated and updated with all pages and public reports.
                  </p>
                  <a 
                    href={`${SUPABASE_FUNCTIONS_URL}/sitemap`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline text-xs mt-1 inline-block"
                  >
                    View Live Sitemap →
                  </a>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sitemapUrl">Sitemap URL (for Search Consoles)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="sitemapUrl" 
                    value={`${SUPABASE_FUNCTIONS_URL}/sitemap`}
                    readOnly
                    className="bg-muted"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(`${SUPABASE_FUNCTIONS_URL}/sitemap`)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submit this URL to Google Search Console and other search engines
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="robotsTxt">robots.txt Content</Label>
                <textarea 
                  id="robotsTxt"
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  placeholder={`User-agent: *\nAllow: /\n\nSitemap: ${SUPABASE_FUNCTIONS_URL}/sitemap`}
                  value={settings.robots_txt_content}
                  onChange={(e) => updateSetting('robots_txt_content', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Custom robots.txt content. Leave empty to use default.
                </p>
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
                  checked={settings.require_2fa_admins === 'true'}
                  onCheckedChange={(v) => updateSetting('require_2fa_admins', String(v))}
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
                  onChange={(e) => updateSetting('session_timeout_minutes', e.target.value)}
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
                  onChange={(e) => updateSetting('rate_limit_per_minute', e.target.value)}
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
                  checked={settings.enable_audit_logs === 'true'}
                  onCheckedChange={(v) => updateSetting('enable_audit_logs', String(v))}
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
