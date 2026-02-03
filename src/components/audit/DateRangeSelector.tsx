import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, Info, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths } from 'date-fns';

export type DateRangePreset = '7d' | '30d' | '3m' | '6m' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeSelectorProps {
  selectedPreset: DateRangePreset;
  dateRange: DateRange;
  onPresetChange: (preset: DateRangePreset) => void;
  onDateRangeChange: (range: DateRange) => void;
  showBackendNote?: boolean;
}

const presets: { value: DateRangePreset; label: string; shortLabel: string }[] = [
  { value: '7d', label: 'Last 7 Days', shortLabel: '7D' },
  { value: '30d', label: 'Last 30 Days', shortLabel: '30D' },
  { value: '3m', label: 'Last 3 Months', shortLabel: '3M' },
  { value: '6m', label: 'Last 6 Months', shortLabel: '6M' },
];

export function DateRangeSelector({
  selectedPreset,
  dateRange,
  onPresetChange,
  onDateRangeChange,
  showBackendNote = true,
}: DateRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePresetSelect = (preset: DateRangePreset) => {
    onPresetChange(preset);
    const today = new Date();
    let from: Date;
    
    switch (preset) {
      case '7d':
        from = subDays(today, 7);
        break;
      case '30d':
        from = subDays(today, 30);
        break;
      case '3m':
        from = subMonths(today, 3);
        break;
      case '6m':
        from = subMonths(today, 6);
        break;
      default:
        return;
    }
    
    onDateRangeChange({ from, to: today });
  };

  const formatDateRange = () => {
    if (selectedPreset !== 'custom') {
      const preset = presets.find(p => p.value === selectedPreset);
      return preset?.label || 'Select range';
    }
    return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-base">Select Date Range</h4>
          <p className="text-sm text-muted-foreground">Choose the period to analyze</p>
        </div>
      </div>

      {/* Quick pick buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            variant={selectedPreset === preset.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetSelect(preset.value)}
            className={cn(
              'h-9 px-4 font-semibold transition-all',
              selectedPreset === preset.value && 'shadow-md'
            )}
          >
            {preset.shortLabel}
          </Button>
        ))}
        
        {/* Custom range picker */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={selectedPreset === 'custom' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-9 px-4 font-semibold transition-all',
                selectedPreset === 'custom' && 'shadow-md'
              )}
            >
              Custom
              <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onPresetChange('custom');
                  onDateRangeChange({ from: range.from, to: range.to });
                  setIsCalendarOpen(false);
                }
              }}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Current selection display */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
        <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium">{formatDateRange()}</span>
      </div>

      {/* Tip */}
      <p className="text-xs text-muted-foreground flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>Tip: 30 days+ gives better trend accuracy.</span>
      </p>

      {/* Backend support note */}
      {showBackendNote && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm text-warning-foreground">
          <p className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-warning" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Date range selection is for planning purposes. 
              The audit analyzes available data from Facebook API.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
