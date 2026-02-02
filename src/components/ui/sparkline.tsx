import { cn } from '@/lib/utils';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'accent';
  height?: number;
  width?: number | string;
  className?: string;
  showArea?: boolean;
}

const colorMap = {
  primary: {
    stroke: 'hsl(var(--primary))',
    fill: 'hsl(var(--primary) / 0.15)',
  },
  success: {
    stroke: 'hsl(var(--success))',
    fill: 'hsl(var(--success) / 0.15)',
  },
  warning: {
    stroke: 'hsl(var(--warning))',
    fill: 'hsl(var(--warning) / 0.15)',
  },
  destructive: {
    stroke: 'hsl(var(--destructive))',
    fill: 'hsl(var(--destructive) / 0.15)',
  },
  accent: {
    stroke: 'hsl(var(--accent))',
    fill: 'hsl(var(--accent) / 0.15)',
  },
};

export function Sparkline({
  data,
  color = 'primary',
  height = 32,
  width = 80,
  className,
  showArea = true,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  const colors = colorMap[color];

  // Determine trend for color override
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const trendColor = trend > 0 ? 'success' : trend < 0 ? 'destructive' : color;
  const finalColors = trend !== 0 ? colorMap[trendColor] : colors;

  return (
    <div 
      className={cn('sparkline-container', className)} 
      style={{ height, width: typeof width === 'number' ? width : undefined }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={finalColors.fill} stopOpacity={0.8} />
              <stop offset="100%" stopColor={finalColors.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={finalColors.stroke}
            strokeWidth={1.5}
            fill={showArea ? `url(#sparkline-gradient-${color})` : 'transparent'}
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Mini sparkline for inline use
export function MiniSparkline({
  data,
  positive = true,
  className,
}: {
  data: number[];
  positive?: boolean;
  className?: string;
}) {
  return (
    <Sparkline
      data={data}
      color={positive ? 'success' : 'destructive'}
      height={24}
      width={56}
      showArea={false}
      className={className}
    />
  );
}
