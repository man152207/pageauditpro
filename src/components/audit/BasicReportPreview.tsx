import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScoreCard } from '@/components/ui/score-card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  ThumbsUp,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BasicReportPreviewProps {
  auditId: string;
  pageName: string;
  score: number;
  breakdown: {
    engagement: number;
    consistency: number;
    readiness: number;
  };
  recommendations: any[];
}

export function BasicReportPreview({
  auditId,
  pageName,
  score,
  breakdown,
  recommendations,
}: BasicReportPreviewProps) {
  // Only show first 2 recommendations
  const topRecommendations = recommendations.filter(r => !r.isPro).slice(0, 2);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-muted-foreground bg-muted';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Basic Report</h3>
          <p className="text-sm text-muted-foreground">{pageName}</p>
        </div>
        <Badge variant="outline" className="text-success border-success/30 bg-success/10">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Complete
        </Badge>
      </div>

      {/* Score Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          title="Overall Score"
          score={score}
          icon={BarChart3}
        />
        <ScoreCard
          title="Engagement"
          score={breakdown.engagement}
          icon={ThumbsUp}
        />
        <ScoreCard
          title="Consistency"
          score={breakdown.consistency}
          icon={TrendingUp}
        />
        <ScoreCard
          title="Readiness"
          score={breakdown.readiness}
          icon={Zap}
        />
      </div>

      {/* Top Recommendations */}
      {topRecommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Top Recommendations</h4>
          {topRecommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
            >
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{rec.title}</span>
                  <Badge variant="outline" className={cn('text-xs', getPriorityColor(rec.priority))}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Full Report CTA */}
      <div className="pt-4 border-t border-border">
        <Button asChild className="w-full">
          <Link to={`/dashboard/reports/${auditId}`}>
            View Full Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
