import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Facebook,
  Loader2,
  Mail,
  Save,
  Wallet,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationCardProps {
  title: string;
  icon: React.ReactNode;
  isConfigured: boolean;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  onTest?: () => void;
  testing?: boolean;
}

function IntegrationCard({ title, icon, isConfigured, children, onSave, saving, onTest, testing }: IntegrationCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <Badge variant="outline" className={isConfigured ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
          {isConfigured ? <><CheckCircle2 className="mr-1 h-3 w-3" /> Configured</> : 'Not Configured'}
        </Badge>
      </div>
      {children}
      <div className="flex gap-2 pt-2">
        <Button onClick={onSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
        {onTest && (
          <Button onClick={onTest} disabled={testing} size="sm" variant="outline">
            {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Test Connection
          </Button>
        )}
      </div>
    </div>
  );
}

interface SecretInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
}

function SecretInput({ id, label, value, onChange, placeholder, helpText }: SecretInputProps) {
  const [show, setShow] = useState(false);
  const { toast } = useToast();

  const copyValue = () => {
    if (value && value !== '••••••••') {
      navigator.clipboard.writeText(value);
      toast({ title: 'Copied to clipboard' });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative flex gap-1">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder || '••••••••'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-20"
        />
        <Button type="button" variant="ghost" size="icon" onClick={() => setShow(!show)} className="shrink-0">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={copyValue} className="shrink-0">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
}

interface IntegrationSettingsProps {
  settings: Record<string, string>;
  updateSetting: (key: string, value: string) => void;
  saveSettings: (settings: Array<{ key: string; value: string; is_sensitive: boolean }>) => Promise<void>;
  saving: boolean;
}

export function IntegrationSettings({ settings, updateSetting, saveSettings, saving }: IntegrationSettingsProps) {
  const { toast } = useToast();
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const testConnection = async (type: string) => {
    setTesting((prev) => ({ ...prev, [type]: true }));
    try {
      let endpoint = '';
      if (type === 'facebook') endpoint = 'facebook-auth-login?action=get-login-url';
      else if (type === 'paypal') endpoint = 'paypal-checkout?action=test';
      else if (type === 'esewa') endpoint = 'esewa-checkout?action=test';
      else if (type === 'email') endpoint = 'send-audit-email';

      const { data, error } = await supabase.functions.invoke(endpoint.split('?')[0], {
        body: { type: 'test' },
      });

      if (error || data?.error) {
        toast({
          title: 'Connection Failed',
          description: data?.error?.human_message || 'Could not connect. Check your configuration.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Connection Successful', description: `${type} is configured correctly.` });
      }
    } catch (e) {
      toast({ title: 'Test Failed', description: 'An error occurred during the test.', variant: 'destructive' });
    } finally {
      setTesting((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Facebook */}
      <IntegrationCard
        title="Facebook API"
        icon={<Facebook className="h-5 w-5 text-[#1877F2]" />}
        isConfigured={!!settings.facebook_app_id && settings.facebook_app_id !== '••••••••'}
        onSave={() => saveSettings([
          { key: 'facebook_app_id', value: settings.facebook_app_id || '', is_sensitive: false },
          { key: 'facebook_app_secret', value: settings.facebook_app_secret || '', is_sensitive: true },
        ])}
        saving={saving}
        onTest={() => testConnection('facebook')}
        testing={testing.facebook}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>App ID</Label>
            <Input value={settings.facebook_app_id || ''} onChange={(e) => updateSetting('facebook_app_id', e.target.value)} placeholder="Enter Facebook App ID" />
          </div>
          <SecretInput id="fb-secret" label="App Secret" value={settings.facebook_app_secret || ''} onChange={(v) => updateSetting('facebook_app_secret', v)} helpText="From developers.facebook.com" />
        </div>
      </IntegrationCard>

      {/* PayPal */}
      <IntegrationCard
        title="PayPal"
        icon={<Wallet className="h-5 w-5 text-[#003087]" />}
        isConfigured={!!settings.paypal_client_id && settings.paypal_client_id !== '••••••••'}
        onSave={() => saveSettings([
          { key: 'paypal_client_id', value: settings.paypal_client_id || '', is_sensitive: false },
          { key: 'paypal_client_secret', value: settings.paypal_client_secret || '', is_sensitive: true },
          { key: 'paypal_sandbox_mode', value: settings.paypal_sandbox_mode || 'true', is_sensitive: false },
        ])}
        saving={saving}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Client ID</Label>
            <Input value={settings.paypal_client_id || ''} onChange={(e) => updateSetting('paypal_client_id', e.target.value)} placeholder="PayPal Client ID" />
          </div>
          <SecretInput id="paypal-secret" label="Client Secret" value={settings.paypal_client_secret || ''} onChange={(v) => updateSetting('paypal_client_secret', v)} helpText="From developer.paypal.com" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Switch checked={settings.paypal_sandbox_mode !== 'false'} onCheckedChange={(v) => updateSetting('paypal_sandbox_mode', String(v))} />
          <Label>Sandbox Mode (Testing)</Label>
        </div>
      </IntegrationCard>

      {/* eSewa */}
      <IntegrationCard
        title="eSewa (Nepal)"
        icon={<Wallet className="h-5 w-5 text-[#60BB46]" />}
        isConfigured={!!settings.esewa_merchant_id && settings.esewa_merchant_id !== '••••••••'}
        onSave={() => saveSettings([
          { key: 'esewa_merchant_id', value: settings.esewa_merchant_id || '', is_sensitive: false },
          { key: 'esewa_secret_key', value: settings.esewa_secret_key || '', is_sensitive: true },
          { key: 'esewa_sandbox_mode', value: settings.esewa_sandbox_mode || 'true', is_sensitive: false },
        ])}
        saving={saving}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Merchant ID</Label>
            <Input value={settings.esewa_merchant_id || ''} onChange={(e) => updateSetting('esewa_merchant_id', e.target.value)} placeholder="eSewa Merchant ID" />
          </div>
          <SecretInput id="esewa-secret" label="Secret Key" value={settings.esewa_secret_key || ''} onChange={(v) => updateSetting('esewa_secret_key', v)} helpText="From merchant.esewa.com.np" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Switch checked={settings.esewa_sandbox_mode !== 'false'} onCheckedChange={(v) => updateSetting('esewa_sandbox_mode', String(v))} />
          <Label>Sandbox Mode (Testing)</Label>
        </div>
      </IntegrationCard>

      {/* Email (Resend) */}
      <IntegrationCard
        title="Email Provider (Resend)"
        icon={<Mail className="h-5 w-5 text-primary" />}
        isConfigured={!!settings.resend_api_key && settings.resend_api_key !== '••••••••'}
        onSave={() => saveSettings([
          { key: 'resend_api_key', value: settings.resend_api_key || '', is_sensitive: true },
          { key: 'email_from_address', value: settings.email_from_address || '', is_sensitive: false },
          { key: 'email_from_name', value: settings.email_from_name || '', is_sensitive: false },
        ])}
        saving={saving}
      >
        <SecretInput id="resend-key" label="Resend API Key" value={settings.resend_api_key || ''} onChange={(v) => updateSetting('resend_api_key', v)} helpText="From resend.com/api-keys" />
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div className="space-y-2">
            <Label>From Email</Label>
            <Input value={settings.email_from_address || ''} onChange={(e) => updateSetting('email_from_address', e.target.value)} placeholder="noreply@yourdomain.com" />
          </div>
          <div className="space-y-2">
            <Label>From Name</Label>
            <Input value={settings.email_from_name || ''} onChange={(e) => updateSetting('email_from_name', e.target.value)} placeholder="Pagelyzer" />
          </div>
        </div>
      </IntegrationCard>
    </div>
  );
}
