import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Settings, Key, Webhook, Globe, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsTabs = [
  { id: 'general', label: 'General', icon: Settings, path: '/super-admin/settings/general' },
  { id: 'integrations', label: 'Integrations', icon: Key, path: '/super-admin/settings/integrations' },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook, path: '/super-admin/settings/webhooks' },
  { id: 'seo', label: 'SEO', icon: Globe, path: '/super-admin/settings/seo' },
  { id: 'security', label: 'Security', icon: Shield, path: '/super-admin/settings/security' },
];

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect /super-admin/settings to /super-admin/settings/general
  useEffect(() => {
    if (location.pathname === '/super-admin/settings' || location.pathname === '/super-admin/settings/') {
      navigate('/super-admin/settings/general', { replace: true });
    }
  }, [location.pathname, navigate]);

  const currentTab = settingsTabs.find(tab => location.pathname.startsWith(tab.path))?.id || 'general';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings, integrations, and security policies.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-lg border">
          {settingsTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <Outlet />
    </div>
  );
}
