import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HistoricalScorePoint {
  date: string;
  score: number;
  count: number;
}

/**
 * Fetches the last N audit scores grouped by date for sparkline visualization.
 * Returns real historical data instead of mock values.
 */
export function useHistoricalScores(dataPoints = 7) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['audits', 'historical-scores', user?.id, dataPoints],
    queryFn: async (): Promise<HistoricalScorePoint[]> => {
      if (!user) return [];

      // Fetch recent audits with scores
      const { data, error } = await supabase
        .from('audits')
        .select('score_total, created_at')
        .eq('user_id', user.id)
        .not('score_total', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50); // Get last 50 audits to aggregate

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Group by date and calculate average score per day
      const grouped: Record<string, { total: number; count: number }> = {};
      
      data.forEach((audit) => {
        const date = new Date(audit.created_at).toISOString().split('T')[0];
        if (!grouped[date]) {
          grouped[date] = { total: 0, count: 0 };
        }
        grouped[date].total += audit.score_total || 0;
        grouped[date].count += 1;
      });

      // Convert to array and sort by date
      const points = Object.entries(grouped)
        .map(([date, { total, count }]) => ({
          date,
          score: Math.round(total / count),
          count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Return last N data points
      return points.slice(-dataPoints);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Returns sparkline-ready array of scores.
 * Falls back to empty array if no data available.
 */
export function useSparklineData(dataPoints = 7) {
  const { data: historicalData = [], isLoading } = useHistoricalScores(dataPoints);

  // Extract just the scores for sparkline visualization
  const scores = historicalData.map((d) => d.score);

  return {
    data: scores,
    isLoading,
    hasData: scores.length > 0,
  };
}
