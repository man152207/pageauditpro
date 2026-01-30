import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileBarChart,
  Search,
  Download,
  Filter,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AdminAuditsPage() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  // Fetch organization audits
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['org-audits', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Get unique user IDs for filter
  const uniqueUserIds = [...new Set(audits.map((a) => a.user_id))];

  // Filter audits
  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      !searchQuery ||
      audit.page_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.page_url?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesScore = true;
    if (scoreFilter === 'excellent') {
      matchesScore = (audit.score_total || 0) >= 80;
    } else if (scoreFilter === 'good') {
      matchesScore = (audit.score_total || 0) >= 60 && (audit.score_total || 0) < 80;
    } else if (scoreFilter === 'needs-work') {
      matchesScore = (audit.score_total || 0) < 60;
    }

    const matchesUser = userFilter === 'all' || audit.user_id === userFilter;

    return matchesSearch && matchesScore && matchesUser;
  });

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="secondary">Pending</Badge>;
    if (score >= 80) return <Badge className="bg-success/10 text-success border-success/20">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-warning/10 text-warning border-warning/20">Good</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Needs Work</Badge>;
  };

  const handleExportCSV = () => {
    // Build CSV content
    const headers = ['Page Name', 'URL', 'Score', 'Type', 'Date'];
    const rows = filteredAudits.map((audit) => [
      audit.page_name || 'Untitled',
      audit.page_url || '',
      audit.score_total?.toString() || '',
      audit.audit_type,
      format(new Date(audit.created_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audits-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Audits"
        description="View and export all audits from your organization."
        actions={
          <Button variant="outline" onClick={handleExportCSV} disabled={filteredAudits.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by page name or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={scoreFilter} onValueChange={setScoreFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="excellent">Excellent (80+)</SelectItem>
            <SelectItem value="good">Good (60-79)</SelectItem>
            <SelectItem value="needs-work">Needs Work (&lt;60)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredAudits.length} of {audits.length} audits
        </p>
      )}

      {/* Audits Table */}
      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : filteredAudits.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{audit.page_name || 'Untitled Audit'}</p>
                      {audit.page_url && (
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {audit.page_url}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{audit.score_total ?? '—'}</span>
                      <span className="text-muted-foreground text-sm">/ 100</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {audit.audit_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(audit.created_at), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/dashboard/reports/${audit.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={FileBarChart}
              title="No audits found"
              description={searchQuery || scoreFilter !== 'all' ? 'Try adjusting your filters.' : 'No audits have been run in your organization yet.'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
