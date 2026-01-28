import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Circle,
  Settings,
  LogIn,
  Webhook,
  Globe,
  AlertCircle
} from 'lucide-react';

const PRODUCTION_DOMAIN = 'https://pagelyzer.io';

// Configuration data
const appSettings = [
  { label: 'App Domains', value: 'pagelyzer.io', description: 'Add to Settings > Basic' },
  { label: 'Website URL', value: `${PRODUCTION_DOMAIN}`, description: 'Main site URL' },
  { label: 'Privacy Policy URL', value: `${PRODUCTION_DOMAIN}/privacy-policy`, description: 'Required for public apps' },
  { label: 'Terms of Service URL', value: `${PRODUCTION_DOMAIN}/terms-of-service`, description: 'Required for public apps' },
];

const oauthSettings = [
  { label: 'Client OAuth login', recommended: true, description: 'Enables standard OAuth client token flow' },
  { label: 'Web OAuth login', recommended: true, description: 'Enables web-based Client OAuth Login' },
  { label: 'Enforce HTTPS', recommended: true, description: 'Strongly recommended for security' },
  { label: 'Force Web OAuth reauthentication', recommended: false, description: 'Prompts password on every login' },
  { label: 'Embedded browser OAuth login', recommended: false, description: 'For webview apps' },
  { label: 'Use Strict Mode for redirect URIs', recommended: true, description: 'Only exact URI matches allowed' },
  { label: 'Login with the JavaScript SDK', recommended: false, description: 'We use server-side OAuth instead' },
  { label: 'Login from devices', recommended: false, description: 'For smart TVs etc.' },
];

const redirectUris = [
  { 
    uri: `${PRODUCTION_DOMAIN}/api/auth/facebook/login/callback`, 
    purpose: '"Continue with Facebook" login',
    section: 'Valid OAuth Redirect URIs'
  },
  { 
    uri: `${PRODUCTION_DOMAIN}/api/auth/facebook/page/callback`, 
    purpose: 'Facebook Page connection',
    section: 'Valid OAuth Redirect URIs'
  },
];

const webhookProducts = [
  { id: 'user', name: 'User', description: 'User data changes, deauthorization' },
  { id: 'page', name: 'Page', description: 'Page insights, posts, messages' },
  { id: 'permissions', name: 'Permissions', description: 'Permission grant/revoke events' },
  { id: 'application', name: 'Application', description: 'App-level events' },
  { id: 'instagram', name: 'Instagram', description: 'Instagram Business data' },
  { id: 'catalog', name: 'Catalog', description: 'Product catalog updates' },
];

const checklistItems = [
  { id: 'domains', label: 'Add App Domains in Settings > Basic', section: 'basic' },
  { id: 'website', label: 'Add Website URL in Settings > Basic', section: 'basic' },
  { id: 'privacy', label: 'Add Privacy Policy URL', section: 'basic' },
  { id: 'terms', label: 'Add Terms of Service URL', section: 'basic' },
  { id: 'oauth', label: 'Configure Client OAuth settings', section: 'login' },
  { id: 'redirect-login', label: 'Add login redirect URI', section: 'login' },
  { id: 'redirect-page', label: 'Add page connect redirect URI', section: 'login' },
  { id: 'deauthorize', label: 'Add Deauthorize callback URL', section: 'login' },
];

// Copy button component
function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label ? `${label} copied!` : 'Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 px-2 text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

// Value display with copy
function CopyableValue({ value, label, description }: { value: string; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2 ml-4">
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate max-w-[300px]">
          {value}
        </code>
        <CopyButton value={value} label={label} />
      </div>
    </div>
  );
}

// URI Card component
function UriCard({ uri, purpose }: { uri: string; purpose: string }) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <code className="text-sm font-mono break-all">{uri}</code>
          <p className="text-xs text-muted-foreground mt-1">For: {purpose}</p>
        </div>
        <CopyButton value={uri} />
      </div>
    </div>
  );
}

export default function FacebookSettings() {
  const [verifyToken, setVerifyToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  
  // Section open states
  const [openSections, setOpenSections] = useState({
    checklist: true,
    appSettings: true,
    login: true,
    webhooks: false,
    jsSdk: false,
  });

  // Load verify token from settings
  useEffect(() => {
    loadVerifyToken();
  }, []);

  const loadVerifyToken = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value_encrypted')
        .eq('key', 'facebook_webhook_verify_token')
        .eq('scope', 'global')
        .maybeSingle();

      if (error) throw error;
      if (data?.value_encrypted) {
        setVerifyToken(data.value_encrypted);
      }
    } catch (error) {
      console.error('Error loading verify token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateToken = () => {
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    setVerifyToken(token.substring(0, 32));
    toast.info('New token generated. Click "Save Token" to apply.');
  };

  const saveToken = async () => {
    if (!verifyToken.trim()) {
      toast.error('Please enter or generate a verify token');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'facebook_webhook_verify_token',
          scope: 'global',
          value_encrypted: verifyToken,
          is_sensitive: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key,scope,scope_id'
        });

      if (error) throw error;
      toast.success('Verify token saved successfully');
    } catch (error) {
      console.error('Error saving verify token:', error);
      toast.error('Failed to save verify token');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCheckItem = (id: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const completedCount = checkedItems.size;
  const totalCount = checklistItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            Facebook Developer Console Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Complete guide for configuring your Facebook App. Copy values below and paste into your{' '}
            <a 
              href="https://developers.facebook.com/apps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Facebook Developer Console
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Quick Setup Checklist */}
      <Collapsible open={openSections.checklist} onOpenChange={() => toggleSection('checklist')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Quick Setup Checklist</CardTitle>
                    <CardDescription>
                      {completedCount}/{totalCount} completed
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={completedCount === totalCount ? 'default' : 'secondary'}>
                    {Math.round((completedCount / totalCount) * 100)}%
                  </Badge>
                  {openSections.checklist ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid gap-2">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleCheckItem(item.id)}
                  >
                    <Checkbox
                      checked={checkedItems.has(item.id)}
                      onCheckedChange={() => toggleCheckItem(item.id)}
                    />
                    <span className={checkedItems.has(item.id) ? 'line-through text-muted-foreground' : ''}>
                      {item.label}
                    </span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {item.section === 'basic' ? 'Settings > Basic' : 'Facebook Login'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* App Settings (Settings > Basic) */}
      <Collapsible open={openSections.appSettings} onOpenChange={() => toggleSection('appSettings')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">App Settings</CardTitle>
                    <CardDescription>Settings → Basic in Facebook Developer Console</CardDescription>
                  </div>
                </div>
                {openSections.appSettings ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {appSettings.map((setting) => (
                <CopyableValue
                  key={setting.label}
                  label={setting.label}
                  value={setting.value}
                  description={setting.description}
                />
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Facebook Login Configuration */}
      <Collapsible open={openSections.login} onOpenChange={() => toggleSection('login')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <LogIn className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Facebook Login</CardTitle>
                    <CardDescription>Use Cases → Facebook Login in Developer Console</CardDescription>
                  </div>
                </div>
                {openSections.login ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              {/* Client OAuth Settings */}
              <div>
                <h4 className="text-sm font-medium mb-3">Client OAuth Settings</h4>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="grid gap-3">
                    {oauthSettings.map((setting) => (
                      <div key={setting.label} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm">{setting.label}</p>
                          <p className="text-xs text-muted-foreground">{setting.description}</p>
                        </div>
                        <Badge variant={setting.recommended ? 'default' : 'secondary'}>
                          {setting.recommended ? '✓ ON' : '✗ OFF'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Valid OAuth Redirect URIs */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  Valid OAuth Redirect URIs
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Add both of these URIs exactly as shown. They must match character-for-character.
                </p>
                <div className="space-y-3">
                  {redirectUris.map((item) => (
                    <UriCard key={item.uri} uri={item.uri} purpose={item.purpose} />
                  ))}
                </div>
              </div>

              {/* Deauthorize Callback URL */}
              <div>
                <h4 className="text-sm font-medium mb-3">Deauthorize Callback URL</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Facebook will call this URL when a user removes your app.
                </p>
                <UriCard 
                  uri={`${PRODUCTION_DOMAIN}/api/webhooks/facebook/deauthorize`} 
                  purpose="User app removal notification" 
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Webhooks Configuration */}
      <Collapsible open={openSections.webhooks} onOpenChange={() => toggleSection('webhooks')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Webhook className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Webhooks</CardTitle>
                    <CardDescription>Use Cases → Webhooks in Developer Console (Optional)</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Optional</Badge>
                  {openSections.webhooks ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              {/* Verify Token */}
              <div>
                <h4 className="text-sm font-medium mb-2">Verify Token</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Use the same token for all webhook products. Facebook uses this to verify your endpoint.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showToken ? 'text' : 'password'}
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value)}
                      placeholder="Enter or generate a verify token..."
                      className="pr-20 font-mono"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <CopyButton value={verifyToken} label="Token" />
                    </div>
                  </div>
                  <Button variant="outline" onClick={generateToken}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                  <Button onClick={saveToken} disabled={isSaving || isLoading}>
                    {isSaving ? 'Saving...' : 'Save Token'}
                  </Button>
                </div>
              </div>

              {/* Product Webhooks */}
              <div>
                <h4 className="text-sm font-medium mb-3">Product Webhook URLs</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  For each product, use the callback URL below and the Verify Token above.
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Product</th>
                        <th className="text-left p-3 font-medium">Callback URL</th>
                        <th className="w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {webhookProducts.map((product) => (
                        <tr key={product.id} className="border-t">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.description}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {PRODUCTION_DOMAIN}/api/webhooks/facebook/{product.id}
                            </code>
                          </td>
                          <td className="p-3">
                            <CopyButton 
                              value={`${PRODUCTION_DOMAIN}/api/webhooks/facebook/${product.id}`}
                              label={`${product.name} webhook URL`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Important Note */}
              <div className="flex gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600 dark:text-amber-400">Important</p>
                  <p className="text-muted-foreground mt-1">
                    Webhooks are optional and only needed if you want real-time updates from Facebook.
                    The login and page connection features work without webhooks configured.
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* JavaScript SDK (Optional) */}
      <Collapsible open={openSections.jsSdk} onOpenChange={() => toggleSection('jsSdk')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">JavaScript SDK</CardTitle>
                    <CardDescription>Only needed if you enable "Login with JavaScript SDK"</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Not Used</Badge>
                  {openSections.jsSdk ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Currently using server-side OAuth (recommended)</p>
                  <p className="text-muted-foreground mt-1">
                    If you later enable "Login with JavaScript SDK", add these to "Allowed Domains for the JavaScript SDK":
                  </p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-0.5 rounded">pagelyzer.io</code>
                      <CopyButton value="pagelyzer.io" />
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-0.5 rounded">pageauditpro.lovable.app</code>
                      <CopyButton value="pageauditpro.lovable.app" />
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
