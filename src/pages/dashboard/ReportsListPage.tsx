import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
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
  FileBarChart,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

type SortField = 'created_at' | 'score_total' | 'page_name';
type SortOrder = 'asc' | 'desc';

export default function ReportsListPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['audits', 'all', user?.id, sortField, sortOrder],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', user.id)
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Filter audits
  const filteredAudits = audits.filter((audit) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      audit.page_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.page_url?.toLowerCase().includes(searchQuery.toLowerCase());

    // Score filter
    let matchesScore = true;
    if (scoreFilter === 'excellent') {
      matchesScore = (audit.score_total || 0) >= 80;
    } else if (scoreFilter === 'good') {
      matchesScore = (audit.score_total || 0) >= 60 && (audit.score_total || 0) < 80;
    } else if (scoreFilter === 'needs-work') {
      matchesScore = (audit.score_total || 0) < 60;
    }

    return matchesSearch && matchesScore;
  });

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="secondary">Pending</Badge>;
    if (score >= 80) return <Badge className="bg-success/10 text-success border-success/20">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-warning/10 text-warning border-warning/20">Good</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Needs Work</Badge>;
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View and manage all your audit reports."
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
        <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Date</SelectItem>
            <SelectItem value="score_total">Score</SelectItem>
            <SelectItem value="page_name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredAudits.length} of {audits.length} reports
        </p>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))
        ) : filteredAudits.length > 0 ? (
          filteredAudits.map((audit, index) => (
            <Link
              key={audit.id}
              to={`/dashboard/reports/${audit.id}`}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border bg-card',
                'hover:border-primary/30 hover:shadow-sm transition-all duration-200 group',
                'animate-fade-in',
                index < 5 && `stagger-${index + 1}`
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                  <FileBarChart className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-primary transition-colors">
                    {audit.page_name || 'Untitled Audit'}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(audit.created_at), 'MMM d, yyyy')}
                    </span>
                    {audit.page_url && (
                      <span className="flex items-center gap-1 truncate">
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{audit.page_url}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:justify-end">
                {getScoreBadge(audit.score_total)}
                <div className="text-right">
                  <p className="text-2xl font-bold">{audit.score_total ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            icon={FileBarChart}
            title="No reports found"
            description={searchQuery || scoreFilter !== 'all' 
              ? "Try adjusting your filters to see more results."
              : "Run your first audit to see your reports here."}
            action={
              !searchQuery && scoreFilter === 'all'
                ? { label: 'Run Audit', href: '/dashboard/audit' }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
