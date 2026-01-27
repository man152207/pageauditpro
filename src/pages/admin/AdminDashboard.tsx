import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import {
  BarChart3,
  Building2,
  Download,
  FileBarChart,
  Plus,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();

  // Mock data - replace with real queries
  const stats = {
    totalUsers: 24,
    totalAudits: 156,
    monthlyAudits: 42,
    activeSubscriptions: 8,
  };

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', audits: 5, joinedAt: '2 days ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', audits: 3, joinedAt: '1 week ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', audits: 8, joinedAt: '2 weeks ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your team and view audit analytics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/branding">
              <Building2 className="mr-2 h-4 w-4" />
              Branding
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/users/invite">
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Audits"
          value={stats.totalAudits}
          icon={FileBarChart}
          description="All time"
        />
        <StatCard
          title="This Month"
          value={stats.monthlyAudits}
          icon={BarChart3}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={TrendingUp}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-semibold">Recent Users</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/users">View all</Link>
            </Button>
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{user.audits} audits</p>
                    <p>{user.joinedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-3">
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/admin/users">
                <Users className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm text-muted-foreground">Invite, edit, or disable users</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/admin/audits">
                <FileBarChart className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">View All Audits</p>
                  <p className="text-sm text-muted-foreground">Filter and export team audits</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/admin/branding">
                <Building2 className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Agency Branding</p>
                  <p className="text-sm text-muted-foreground">Customize reports with your brand</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <Download className="mr-3 h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-muted-foreground">Download audits as CSV</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
