import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  Database,
  DollarSign,
  FileBarChart,
  Key,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Webhook,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  // Mock data - replace with real queries
  const stats = {
    totalUsers: 1250,
    totalRevenue: 15890,
    totalAudits: 4520,
    activeSubscriptions: 342,
  };

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'Facebook API rate limit at 80%', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'New user signups up 25% this week', time: '5 hours ago' },
    { id: 3, type: 'success', message: 'All payment webhooks verified', time: '1 day ago' },
  ];

  const quickLinks = [
    { href: '/super-admin/plans', label: 'Plans & Pricing', icon: CreditCard, description: 'Manage subscription plans' },
    { href: '/super-admin/integrations', label: 'Integrations', icon: Key, description: 'API keys & webhooks' },
    { href: '/super-admin/security', label: 'Security', icon: Shield, description: 'Policies & audit logs' },
    { href: '/super-admin/settings', label: 'Settings', icon: Settings, description: 'System configuration' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">System Dashboard</h1>
          <p className="text-muted-foreground">
            Super Admin control panel for system-wide management.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/super-admin/settings">
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={{ value: 18, isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Audits"
          value={stats.totalAudits.toLocaleString()}
          icon={FileBarChart}
          description="All time"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Alerts */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-semibold">System Alerts</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/super-admin/logs">View all</Link>
            </Button>
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
                >
                  <AlertTriangle className={`h-5 w-5 shrink-0 ${
                    alert.type === 'warning' ? 'text-warning' :
                    alert.type === 'success' ? 'text-success' :
                    'text-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Quick Access</h2>
          <div className="grid gap-3">
            {quickLinks.map((link) => (
              <Button
                key={link.href}
                variant="outline"
                className="justify-start h-auto py-4"
                asChild
              >
                <Link to={link.href}>
                  <link.icon className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{link.label}</p>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Integration Status */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Integration Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Facebook API</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Stripe Webhooks</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Service</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">Not Configured</span>
            </div>
          </div>
        </div>

        {/* Database Stats */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Database Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Records</span>
              <span className="text-sm font-medium">125,430</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage Used</span>
              <span className="text-sm font-medium">2.4 GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Daily Queries</span>
              <span className="text-sm font-medium">~45,000</span>
            </div>
          </div>
        </div>

        {/* Security Overview */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">2FA Enabled</span>
              <span className="text-sm font-medium">Admins Only</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Failed Logins (24h)</span>
              <span className="text-sm font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Rate Limit Events</span>
              <span className="text-sm font-medium">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
