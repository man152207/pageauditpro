import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart3,
  CheckCircle2,
  Copy,
  FileText,
  Globe,
  Loader2,
  Save,
  Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PRODUCTION_DOMAIN = 'https://pagelyzer.io';

export default function SEOSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    seo_title: 'Pagelyzer - Smart Facebook Page Audit Platform',
    seo_description: 'Get instant page health scores, engagement analysis, and AI-powered recommendations.',
    seo_keywords: '',
    og_image_url: '',
    favicon_url: '',
    canonical_url: PRODUCTION_DOMAIN,
    google_verification: '',
    bing_verification: '',
    yandex_verification: '',
    pinterest_verification: '',
    google_analytics_id: '',
    google_tag_manager_id: '',
    facebook_pixel_id: '',
    robots_txt_content: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  // Auto-save default SEO values if they don't exist in database
  const initializeDefaultSettings = async (existingKeys: Set<string>) => {
    const defaultSettings = [
      { key: 'seo_title', value: 'Pagelyzer - Smart Facebook Page Audit Platform' },
      { key: 'seo_description', value: 'Get instant page health scores, engagement analysis, and AI-powered recommendations.' },
      { key: 'canonical_url', value: PRODUCTION_DOMAIN },
      { key: 'sitemap_url', value: `${PRODUCTION_DOMAIN}/sitemap.xml` },
    ];

    const missingSettings = defaultSettings.filter((s) => !existingKeys.has(s.key));
    
    if (missingSettings.length > 0) {
      for (const setting of missingSettings) {
        await supabase.from('settings').upsert({
          scope: 'global',
          scope_id: null,
          key: setting.key,
          value_encrypted: setting.value,
          is_sensitive: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'scope,scope_id,key' });
      }
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value_encrypted')
        .eq('scope', 'global');

      if (error) throw error;

      const existingKeys = new Set<string>();
      if (data) {
        const newSettings = { ...settings };
        data.forEach((item) => {
          existingKeys.add(item.key);
          if (item.key in newSettings) {
            newSettings[item.key as keyof typeof settings] = item.value_encrypted || '';
          }
        });
        setSettings(newSettings);
      }

      // Initialize default SEO values if they don't exist
      await initializeDefaultSettings(existingKeys);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { key: 'seo_title', value: settings.seo_title },
        { key: 'seo_description', value: settings.seo_description },
        { key: 'seo_keywords', value: settings.seo_keywords },
        { key: 'og_image_url', value: settings.og_image_url },
        { key: 'favicon_url', value: settings.favicon_url },
        { key: 'canonical_url', value: settings.canonical_url },
        { key: 'google_verification', value: settings.google_verification },
        { key: 'bing_verification', value: settings.bing_verification },
        { key: 'yandex_verification', value: settings.yandex_verification },
        { key: 'pinterest_verification', value: settings.pinterest_verification },
        { key: 'google_analytics_id', value: settings.google_analytics_id },
        { key: 'google_tag_manager_id', value: settings.google_tag_manager_id },
        { key: 'facebook_pixel_id', value: settings.facebook_pixel_id },
        { key: 'robots_txt_content', value: settings.robots_txt_content },
        { key: 'sitemap_url', value: `${PRODUCTION_DOMAIN}/sitemap.xml` },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('settings')
          .upsert({
            scope: 'global',
            scope_id: null,
            key: setting.key,
            value_encrypted: setting.value,
            is_sensitive: false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'scope,scope_id,key',
          });

        if (error) throw error;
      }

      toast({
        title: 'SEO settings saved',
        description: 'All SEO settings have been saved successfully.',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
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
              value={settings.seo_title}
              onChange={(e) => updateSetting('seo_title', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Max 60 characters recommended</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="canonicalUrl">Canonical URL</Label>
            <Input 
              id="canonicalUrl" 
              value={settings.canonical_url}
              onChange={(e) => updateSetting('canonical_url', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoDescription">Meta Description</Label>
          <Input 
            id="seoDescription" 
            value={settings.seo_description}
            onChange={(e) => updateSetting('seo_description', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Max 160 characters recommended</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoKeywords">Meta Keywords</Label>
          <Input 
            id="seoKeywords" 
            placeholder="facebook audit, page analysis, social media"
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="bingVerification">Bing Webmaster</Label>
            <Input 
              id="bingVerification" 
              placeholder="MSVALIDATE.01=..."
              value={settings.bing_verification}
              onChange={(e) => updateSetting('bing_verification', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yandexVerification">Yandex Webmaster</Label>
            <Input 
              id="yandexVerification" 
              placeholder="yandex-verification=..."
              value={settings.yandex_verification}
              onChange={(e) => updateSetting('yandex_verification', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pinterestVerification">Pinterest</Label>
            <Input 
              id="pinterestVerification" 
              placeholder="p:domain_verify=..."
              value={settings.pinterest_verification}
              onChange={(e) => updateSetting('pinterest_verification', e.target.value)}
            />
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
              href={`${PRODUCTION_DOMAIN}/sitemap.xml`}
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
              value={`${PRODUCTION_DOMAIN}/sitemap.xml`}
              readOnly
              className="bg-muted"
            />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(`${PRODUCTION_DOMAIN}/sitemap.xml`)}>
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
            placeholder={`User-agent: *\nAllow: /\n\nSitemap: ${PRODUCTION_DOMAIN}/sitemap.xml`}
            value={settings.robots_txt_content}
            onChange={(e) => updateSetting('robots_txt_content', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Custom robots.txt content. Leave empty to use default.
          </p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} size="lg">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save All SEO Settings
      </Button>
    </div>
  );
}
