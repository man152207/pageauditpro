import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmailPreferences } from '@/hooks/useEmailPreferences';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Mail,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { preferences, loading, saving, updatePreference } = useEmailPreferences();

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');

  const handleSavePreferences = () => {
    toast({
      title: 'Preferences saved',
      description: 'Your preferences have been updated.',
    });
  };

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Kathmandu', label: 'Kathmandu (NPT)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your notification preferences and app settings."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Choose what emails you want to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="audit-reports">Audit Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email when an audit completes.
                </p>
              </div>
              <Switch
                id="audit-reports"
                checked={preferences.audit_reports}
                onCheckedChange={(checked) => updatePreference('audit_reports', checked)}
                disabled={loading || saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-summaries">Weekly Summaries</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of your page performance.
                </p>
              </div>
              <Switch
                id="weekly-summaries"
                checked={preferences.weekly_summaries}
                onCheckedChange={(checked) => updatePreference('weekly_summaries', checked)}
                disabled={loading || saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="performance-alerts">Performance Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about significant score changes.
                </p>
              </div>
              <Switch
                id="performance-alerts"
                checked={preferences.performance_alerts}
                onCheckedChange={(checked) => updatePreference('performance_alerts', checked)}
                disabled={loading || saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing">Marketing Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive tips, product updates, and offers.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing_updates}
                onCheckedChange={(checked) => updatePreference('marketing_updates', checked)}
                disabled={loading || saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              App Preferences
            </CardTitle>
            <CardDescription>
              Customize your app experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex-1"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex-1"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="flex-1"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </Button>
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ne">नेपाली (Nepali)</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                  <SelectItem value="es">Español (Spanish)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSavePreferences} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Push Notifications (Coming Soon) */}
        <Card className="lg:col-span-2 opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
              <span className="text-xs bg-muted px-2 py-1 rounded-full font-normal">
                Coming Soon
              </span>
            </CardTitle>
            <CardDescription>
              Get instant notifications in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Push notifications will be available in a future update. Stay tuned!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
