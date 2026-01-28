import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProBadge } from '@/components/ui/pro-badge';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Lock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ReportCategory = 'all' | 'engagement' | 'content' | 'audience';
export type ReportPriority = 'all' | 'high' | 'medium' | 'low';

interface ReportFiltersProps {
  category: ReportCategory;
  priority: ReportPriority;
  onCategoryChange: (category: ReportCategory) => void;
  onPriorityChange: (priority: ReportPriority) => void;
  showProFilters?: boolean;
}

export function ReportFilters({
  category,
  priority,
  onCategoryChange,
  onPriorityChange,
  showProFilters = false,
}: ReportFiltersProps) {
  const { isPro } = useSubscription();
  const [showFilters, setShowFilters] = useState(false);

  const categories: { value: ReportCategory; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'content', label: 'Content' },
    { value: 'audience', label: 'Audience' },
  ];

  const priorities: { value: ReportPriority; label: string; color: string }[] = [
    { value: 'all', label: 'All Priorities', color: '' },
    { value: 'high', label: 'High', color: 'text-destructive' },
    { value: 'medium', label: 'Medium', color: 'text-warning' },
    { value: 'low', label: 'Low', color: 'text-muted-foreground' },
  ];

  const hasActiveFilters = category !== 'all' || priority !== 'all';

  const clearFilters = () => {
    onCategoryChange('all');
    onPriorityChange('all');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(hasActiveFilters && 'border-primary text-primary')}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              {(category !== 'all' ? 1 : 0) + (priority !== 'all' ? 1 : 0)}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 rounded-lg border border-border bg-muted/30">
          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select value={category} onValueChange={(v) => onCategoryChange(v as ReportCategory)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Priority</label>
            <Select value={priority} onValueChange={(v) => onPriorityChange(v as ReportPriority)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((pri) => (
                  <SelectItem key={pri.value} value={pri.value}>
                    <span className={pri.color}>{pri.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pro-only: Date Range */}
          {showProFilters && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                Date Range
                {!isPro && <Lock className="h-3 w-3" />}
              </label>
              <Select disabled={!isPro}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Last 30 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
