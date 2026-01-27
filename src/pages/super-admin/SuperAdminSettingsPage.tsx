import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  CreditCard,
  Eye,
  EyeOff,
  Facebook,
  Globe,
  Key,
  Lock,
  Mail,
  Save,
  Settings,
  Shield,
  Webhook,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminSettingsPage() {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your changes have been saved successfully.',
    });
  };

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
                <Input id="appName" defaultValue="PageAudit Pro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" type="email" defaultValue="support@pageaudit.pro" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" placeholder="https://..." />
            </div>

            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* Facebook API */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Facebook className="h-5 w-5 text-[#1877F2]" />
                Facebook API
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fbAppId">App ID</Label>
                  <Input id="fbAppId" placeholder="Enter Facebook App ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fbAppSecret">App Secret</Label>
                  <div className="relative">
                    <Input
                      id="fbAppSecret"
                      type={showSecrets.fbSecret ? 'text' : 'password'}
                      placeholder="••••••••"
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
                <Input id="fbRedirectUrl" placeholder="https://yourapp.com/auth/facebook/callback" />
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">Required Scopes:</p>
                <code className="text-xs">pages_show_list, pages_read_engagement, pages_read_user_content</code>
              </div>
            </div>

            {/* Webhooks */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                Webhook Settings
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook Endpoint URL</Label>
                <Input id="webhookUrl" placeholder="https://yourapp.com/api/webhooks" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook Secret</Label>
                <div className="relative">
                  <Input
                    id="webhookSecret"
                    type={showSecrets.webhook ? 'text' : 'password'}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => toggleSecret('webhook')}
                  >
                    {showSecrets.webhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Integration Settings
            </Button>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <h2 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Gateway (Stripe)
            </h2>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Security Warning</p>
                <p className="text-muted-foreground">
                  Payment keys are encrypted at rest. Never share these keys publicly.
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stripePublic">Publishable Key</Label>
                <Input id="stripePublic" placeholder="pk_live_..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripeSecret">Secret Key</Label>
                <div className="relative">
                  <Input
                    id="stripeSecret"
                    type={showSecrets.stripe ? 'text' : 'password'}
                    placeholder="sk_live_..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => toggleSecret('stripe')}
                  >
                    {showSecrets.stripe ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripeWebhook">Webhook Signing Secret</Label>
              <div className="relative">
                <Input
                  id="stripeWebhook"
                  type={showSecrets.stripeWebhook ? 'text' : 'password'}
                  placeholder="whsec_..."
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
            </div>

            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Payment Settings
            </Button>
          </div>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              SEO & OpenGraph Settings
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Default Title</Label>
                <Input id="seoTitle" defaultValue="PageAudit Pro - Smart Facebook Page Audit Platform" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Input id="seoDescription" defaultValue="Get instant page health scores, engagement analysis, and AI-powered recommendations." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogImage">OG Image URL</Label>
                <Input id="ogImage" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input id="favicon" placeholder="https://..." />
              </div>
            </div>

            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save SEO Settings
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
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out inactive users
                  </p>
                </div>
                <Input type="number" defaultValue="30" className="w-24" />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Rate Limiting</p>
                  <p className="text-sm text-muted-foreground">
                    Maximum requests per minute per IP
                  </p>
                </div>
                <Input type="number" defaultValue="60" className="w-24" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Enable Audit Logs</p>
                  <p className="text-sm text-muted-foreground">
                    Log all admin actions for security review
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Security Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
