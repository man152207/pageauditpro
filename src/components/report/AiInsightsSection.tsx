import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, RefreshCw, Lightbulb } from 'lucide-react';
import { useAiInsights } from '@/hooks/useAiInsights';
import { cn } from '@/lib/utils';

interface AiInsightsSectionProps {
  auditId: string;
  existingInsights: string | null;
  onInsightsGenerated?: (insights: string) => void;
}

export function AiInsightsSection({ 
  auditId, 
  existingInsights, 
  onInsightsGenerated 
}: AiInsightsSectionProps) {
  const { generateInsights, isGenerating } = useAiInsights();
  const [insights, setInsights] = useState<string | null>(existingInsights);

  const handleGenerate = async () => {
    const newInsights = await generateInsights(auditId);
    if (newInsights) {
      setInsights(newInsights);
      onInsightsGenerated?.(newInsights);
    }
  };

  // Parse markdown-style insights into structured format
  const parseInsights = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: { title: string; content: string }[] = [];
    let currentTitle = '';
    let currentContent: string[] = [];

    lines.forEach(line => {
      if (line.startsWith('**') || line.startsWith('##') || line.startsWith('# ')) {
        if (currentTitle && currentContent.length) {
          parsed.push({ title: currentTitle, content: currentContent.join(' ') });
        }
        currentTitle = line.replace(/^[#*\s]+/, '').replace(/\*+$/, '').trim();
        currentContent = [];
      } else if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
        currentContent.push(line.replace(/^[-•\d.]+\s*/, '').trim());
      } else if (line.trim()) {
        currentContent.push(line.trim());
      }
    });

    if (currentTitle && currentContent.length) {
      parsed.push({ title: currentTitle, content: currentContent.join(' ') });
    }

    // If parsing didn't work well, return as single block
    if (parsed.length === 0 && text.trim()) {
      return [{ title: 'AI Analysis', content: text }];
    }

    return parsed;
  };

  if (!insights) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h4 className="font-semibold mb-2">Generate AI-Powered Insights</h4>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Get personalized recommendations and growth strategies based on your page's performance data.
        </p>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing your page...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Insights
            </>
          )}
        </Button>
      </div>
    );
  }

  const parsedInsights = parseInsights(insights);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>AI-Generated Analysis</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Regenerate</span>
        </Button>
      </div>

      <div className="space-y-4">
        {parsedInsights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              'p-4 rounded-lg border border-border',
              'transition-colors hover:bg-muted/30'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h5 className="font-medium mb-1">{insight.title}</h5>
                <p className="text-sm text-muted-foreground">{insight.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
