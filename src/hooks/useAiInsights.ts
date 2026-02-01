import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAiInsights() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInsights = async (auditId: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: { audit_id: auditId },
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to generate insights');
      }

      toast.success('AI insights generated successfully!');
      return data.insights;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate AI insights';
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateInsights, isGenerating };
}
