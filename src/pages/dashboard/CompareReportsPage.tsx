import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-header';
import { ScoreCard } from '@/components/ui/score-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  ThumbsUp,
  TrendingUp,
  Zap,
  GitCompare,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CompareReportsPage() {
  const { user } = useAuth();
  const [selectedAudit1, setSelectedAudit1] = useState<string>('');
  const [selectedAudit2, setSelectedAudit2] = useState<string>('');

  // Fetch all audits for selection
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['audits', 'compare', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const audit1 = audits.find(a => a.id === selectedAudit1);
  const audit2 = audits.find(a => a.id === selectedAudit2);

  const getScoreDiff = (score1: number | null, score2: number | null) => {
    if (score1 === null || score2 === null) return null;
    return score1 - score2;
  };

  const renderDiffBadge = (diff: number | null) => {
    if (diff === null || diff === 0) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Minus className="h-3 w-3" />
          No change
        </Badge>
      );
    }
    return diff > 0 ? (
      <Badge variant="outline" className="border-success/50 bg-success/10 text-success flex items-center gap-1">
        <ArrowUp className="h-3 w-3" />
        +{diff}
      </Badge>
    ) : (
      <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-1">
        <ArrowDown className="h-3 w-3" />
        {diff}
      </Badge>
    );
  };

  if (audits.length < 2) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Compare Reports"
          description="Compare two audit reports side-by-side to track your progress."
        />
        <EmptyState
          icon={GitCompare}
          title="Not enough reports"
          description="You need at least 2 audits to compare. Run more audits to unlock this feature."
          action={{ label: 'Run Audit', href: '/dashboard/audit' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compare Reports"
        description="Compare two audit reports side-by-side to track your progress."
      />

      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Reports to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <Select value={selectedAudit1} onValueChange={setSelectedAudit1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first report" />
                </SelectTrigger>
                <SelectContent>
                  {audits.map(audit => (
                    <SelectItem 
                      key={audit.id} 
                      value={audit.id}
                      disabled={audit.id === selectedAudit2}
                    >
                      {audit.page_name || 'Untitled'} - {format(new Date(audit.created_at), 'MMM d, yyyy')} ({audit.score_total}/100)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />

            <div className="flex-1 w-full">
              <Select value={selectedAudit2} onValueChange={setSelectedAudit2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second report" />
                </SelectTrigger>
                <SelectContent>
                  {audits.map(audit => (
                    <SelectItem 
                      key={audit.id} 
                      value={audit.id}
                      disabled={audit.id === selectedAudit1}
                    >
                      {audit.page_name || 'Untitled'} - {format(new Date(audit.created_at), 'MMM d, yyyy')} ({audit.score_total}/100)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      {audit1 && audit2 && (
        <>
          {/* Score Comparison */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Overall Score', key: 'score_total', icon: BarChart3 },
              { label: 'Engagement', key: 'engagement', icon: ThumbsUp },
              { label: 'Consistency', key: 'consistency', icon: TrendingUp },
              { label: 'Readiness', key: 'readiness', icon: Zap },
            ].map(({ label, key, icon: Icon }) => {
              const score1 = key === 'score_total' 
                ? audit1.score_total 
                : (audit1.score_breakdown as any)?.[key];
              const score2 = key === 'score_total' 
                ? audit2.score_total 
                : (audit2.score_breakdown as any)?.[key];
              const diff = getScoreDiff(score1, score2);

              return (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-center">
                        <p className="text-3xl font-bold">{score1 ?? '—'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(audit1.created_at), 'MMM d')}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        {renderDiffBadge(diff)}
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold">{score2 ?? '—'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(audit2.created_at), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recommendations Comparison */}
          <div className="grid gap-6 lg:grid-cols-2">
            {[audit1, audit2].map((audit, index) => {
              const recommendations = (audit.recommendations || []) as any[];
              return (
                <Card key={audit.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="outline">{index === 0 ? 'Before' : 'After'}</Badge>
                      {audit.page_name || 'Untitled'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(audit.created_at), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recommendations.slice(0, 5).map((rec: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">
                          <span className="font-medium">{rec.title}</span>
                          <Badge 
                            variant="outline" 
                            className={cn('ml-2 text-xs', 
                              rec.priority === 'high' ? 'text-destructive' :
                              rec.priority === 'medium' ? 'text-warning' : ''
                            )}
                          >
                            {rec.priority}
                          </Badge>
                        </div>
                      ))}
                      {recommendations.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center pt-2">
                          +{recommendations.length - 5} more
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {(!audit1 || !audit2) && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select two reports above to see the comparison</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
