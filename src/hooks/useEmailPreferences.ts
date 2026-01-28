import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EmailPreferences {
  audit_reports: boolean;
  weekly_summaries: boolean;
  performance_alerts: boolean;
  marketing_updates: boolean;
  unsubscribed_all: boolean;
}

const defaultPreferences: EmailPreferences = {
  audit_reports: true,
  weekly_summaries: true,
  performance_alerts: true,
  marketing_updates: false,
  unsubscribed_all: false,
};

export function useEmailPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value_encrypted')
        .eq('scope', 'user')
        .eq('scope_id', user.id)
        .like('key', 'email_%');

      if (error) throw error;

      if (data && data.length > 0) {
        const prefs = { ...defaultPreferences };
        data.forEach((item) => {
          const key = item.key.replace('email_', '') as keyof EmailPreferences;
          if (key in prefs) {
            (prefs[key] as boolean) = item.value_encrypted === 'true';
          }
        });
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error fetching email preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = async (key: keyof EmailPreferences, value: boolean) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          scope: 'user',
          scope_id: user.id,
          key: `email_${key}`,
          value_encrypted: String(value),
          is_sensitive: false,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'scope,scope_id,key',
        });

      if (error) throw error;

      setPreferences((prev) => ({ ...prev, [key]: value }));

      // If unsubscribed_all is true, disable all other preferences
      if (key === 'unsubscribed_all' && value) {
        const updates = Object.keys(defaultPreferences)
          .filter((k) => k !== 'unsubscribed_all')
          .map((k) => ({
            scope: 'user',
            scope_id: user.id,
            key: `email_${k}`,
            value_encrypted: 'false',
            is_sensitive: false,
            updated_at: new Date().toISOString(),
          }));

        await supabase.from('settings').upsert(updates, { onConflict: 'scope,scope_id,key' });
        setPreferences({
          audit_reports: false,
          weekly_summaries: false,
          performance_alerts: false,
          marketing_updates: false,
          unsubscribed_all: true,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating email preference:', error);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  return { preferences, loading, saving, updatePreference };
}
