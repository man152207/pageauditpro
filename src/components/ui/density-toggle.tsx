import { useDensity } from '@/contexts/DensityContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutGrid, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DensityToggleProps {
  className?: string;
}

export function DensityToggle({ className }: DensityToggleProps) {
  const { density, setDensity } = useDensity();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-9 w-9', className)}
            >
              {density === 'compact' ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <LayoutGrid className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle density</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">UI Density: {density}</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setDensity('comfortable')}
          className={cn(density === 'comfortable' && 'bg-accent')}
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          Comfortable
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setDensity('compact')}
          className={cn(density === 'compact' && 'bg-accent')}
        >
          <Minimize2 className="mr-2 h-4 w-4" />
          Compact
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
