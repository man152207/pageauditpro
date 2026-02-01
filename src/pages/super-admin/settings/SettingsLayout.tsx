import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Settings, Key, Webhook, Globe, Shield, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

// Facebook icon as inline SVG
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const settingsTabs = [
  { id: 'general', label: 'General', icon: Settings, path: '/super-admin/settings/general' },
  { id: 'integrations', label: 'Integrations', icon: Key, path: '/super-admin/settings/integrations' },
  { id: 'facebook', label: 'Facebook', icon: FacebookIcon, path: '/super-admin/settings/facebook' },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook, path: '/super-admin/settings/webhooks' },
  { id: 'seo', label: 'SEO', icon: Globe, path: '/super-admin/settings/seo' },
  { id: 'security', label: 'Security', icon: Shield, path: '/super-admin/settings/security' },
  { id: 'promotions', label: 'Promotions', icon: Gift, path: '/super-admin/settings/promotions' },
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
