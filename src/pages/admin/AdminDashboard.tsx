import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  Building2,
  Download,
  FileBarChart,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { format, formatDistanceToNow, startOfMonth } from 'date-fns';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  // Fetch organization stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats', orgId],
    queryFn: async () => {
      if (!orgId) {
        return { totalUsers: 0, totalAudits: 0, monthlyAudits: 0, activeSubscriptions: 0 };
      }

      // Total users in org
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      // Total audits in org
      const { count: totalAudits } = await supabase
        .from('audits')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      // Audits this month
      const monthStart = startOfMonth(new Date()).toISOString();
      const { count: monthlyAudits } = await supabase
        .from('audits')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .gte('created_at', monthStart);

      // Active subscriptions (users in org with active subscription)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('organization_id', orgId);

      let activeSubscriptions = 0;
      if (profiles && profiles.length > 0) {
        const userIds = profiles.map(p => p.user_id);
        const { count } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .in('user_id', userIds)
          .eq('status', 'active');
        activeSubscriptions = count || 0;
      }

      return {
        totalUsers: totalUsers || 0,
        totalAudits: totalAudits || 0,
        monthlyAudits: monthlyAudits || 0,
        activeSubscriptions,
      };
    },
    enabled: !!orgId,
  });

  // Fetch recent users
  const { data: recentUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-recent-users', orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      // Get audit counts for each user
      const usersWithStats = await Promise.all(
        (data || []).map(async (user) => {
          const { count } = await supabase
            .from('audits')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.user_id);

          return {
            ...user,
            auditCount: count || 0,
          };
        })
      );

      return usersWithStats;
    },
    enabled: !!orgId,
  });

  const isLoading = statsLoading || usersLoading;

  // No organization message
  if (!orgId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your team and view audit analytics.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Organization</h3>
          <p className="text-muted-foreground">
            You need to be part of an organization to access admin features.
          </p>
        </div>
      </div>
    );
  }

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
            <Link to="/admin/users">
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
          value={stats?.totalUsers || 0}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title="Total Audits"
          value={stats?.totalAudits || 0}
          icon={FileBarChart}
          description="All time"
          loading={isLoading}
        />
        <StatCard
          title="This Month"
          value={stats?.monthlyAudits || 0}
          icon={BarChart3}
          loading={isLoading}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          icon={TrendingUp}
          loading={isLoading}
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
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {(user.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{user.auditCount} audits</p>
                      <p>{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users in your organization yet</p>
              </div>
            )}
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
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/admin/audits">
                <Download className="mr-3 h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">Download audits as CSV</p>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
