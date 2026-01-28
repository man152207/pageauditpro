import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Shield, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SecuritySettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
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
        .select('key, value_encrypted')
        .eq('scope', 'global')
        .in('key', ['require_2fa_admins', 'session_timeout_minutes', 'rate_limit_per_minute', 'enable_audit_logs']);

      if (error) throw error;

      if (data) {
        const newSettings = { ...settings };
        data.forEach((item) => {
          if (item.key in newSettings) {
            newSettings[item.key as keyof typeof settings] = item.value_encrypted || '';
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

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { key: 'require_2fa_admins', value: settings.require_2fa_admins },
        { key: 'session_timeout_minutes', value: settings.session_timeout_minutes },
        { key: 'rate_limit_per_minute', value: settings.rate_limit_per_minute },
        { key: 'enable_audit_logs', value: settings.enable_audit_logs },
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
        title: 'Security settings saved',
        description: 'Security settings have been saved successfully.',
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

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Security Settings
      </Button>
    </div>
  );
}
