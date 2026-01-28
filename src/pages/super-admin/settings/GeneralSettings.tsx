import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GeneralSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    app_name: 'Pagelyzer',
    support_email: 'support@pagelyzer.io',
    logo_url: '',
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
        .in('key', ['app_name', 'support_email', 'logo_url']);

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
        { key: 'app_name', value: settings.app_name, is_sensitive: false },
        { key: 'support_email', value: settings.support_email, is_sensitive: false },
        { key: 'logo_url', value: settings.logo_url, is_sensitive: false },
      ];

      for (const setting of settingsToSave) {
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
        description: 'General settings have been saved successfully.',
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

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Changes
      </Button>
    </div>
  );
}
