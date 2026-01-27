import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScoreCard } from '@/components/ui/score-card';
import { LockedFeature } from '@/components/ui/locked-feature';
import { ProBadge } from '@/components/ui/pro-badge';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Crown,
  FileBarChart,
  Loader2,
  MessageSquare,
  RefreshCw,
  Share2,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuditResults {
  overallScore: number;
  engagementScore: number;
  consistencyScore: number;
  readinessScore: number;
  engagementRate: number;
  recommendations: string[];
}

export default function ManualAuditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'form' | 'calculating' | 'results'>('form');
  const [results, setResults] = useState<AuditResults | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    pageName: '',
    pageUrl: '',
    followers: '',
    postsPerWeek: '',
    totalLikes: '',
    totalComments: '',
    totalShares: '',
    numberOfPosts: '10',
    contentMix: 'mixed',
    hasCTA: false,
    hasWhatsApp: false,
    hasPinnedPost: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateScores = (): AuditResults => {
    const followers = parseInt(formData.followers) || 1;
    const totalEngagements = 
      (parseInt(formData.totalLikes) || 0) +
      (parseInt(formData.totalComments) || 0) +
      (parseInt(formData.totalShares) || 0);
    const numberOfPosts = parseInt(formData.numberOfPosts) || 1;
    const postsPerWeek = parseInt(formData.postsPerWeek) || 0;

    // Engagement Rate (per post average)
    const avgEngagementPerPost = totalEngagements / numberOfPosts;
    const engagementRate = (avgEngagementPerPost / followers) * 100;

    // Engagement Score (0-100)
    let engagementScore = Math.min(100, engagementRate * 20);
    if (engagementRate >= 5) engagementScore = 100;
    else if (engagementRate >= 3) engagementScore = Math.max(80, engagementScore);
    else if (engagementRate >= 1) engagementScore = Math.max(60, engagementScore);

    // Consistency Score based on posts per week
    let consistencyScore = 0;
    if (postsPerWeek >= 7) consistencyScore = 100;
    else if (postsPerWeek >= 5) consistencyScore = 85;
    else if (postsPerWeek >= 3) consistencyScore = 70;
    else if (postsPerWeek >= 1) consistencyScore = 50;
    else consistencyScore = 20;

    // Readiness Score
    let readinessScore = 0;
    if (formData.hasCTA) readinessScore += 40;
    if (formData.hasWhatsApp) readinessScore += 30;
    if (formData.hasPinnedPost) readinessScore += 30;

    // Overall Score (weighted average)
    const overallScore = Math.round(
      engagementScore * 0.4 + consistencyScore * 0.35 + readinessScore * 0.25
    );

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (engagementRate < 1) {
      recommendations.push('Focus on creating more engaging content. Ask questions and encourage comments.');
    }
    if (engagementRate < 3) {
      recommendations.push('Try using more calls-to-action in your posts to boost engagement.');
    }
    if (postsPerWeek < 3) {
      recommendations.push('Increase your posting frequency. Aim for at least 3-5 posts per week.');
    }
    if (!formData.hasCTA) {
      recommendations.push('Add a clear CTA button to your page (Shop Now, Contact Us, etc.).');
    }
    if (!formData.hasWhatsApp) {
      recommendations.push('Add WhatsApp integration for direct customer communication.');
    }
    if (!formData.hasPinnedPost) {
      recommendations.push('Create a pinned post highlighting your key offering or promotion.');
    }
    if (formData.contentMix !== 'mixed') {
      recommendations.push('Diversify your content mix. Try reels, carousels, and static posts.');
    }

    return {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      engagementScore: Math.round(engagementScore),
      consistencyScore: Math.round(consistencyScore),
      readinessScore: Math.round(readinessScore),
      engagementRate: Math.round(engagementRate * 100) / 100,
      recommendations,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pageName || !formData.followers) {
      toast({
        title: 'Missing information',
        description: 'Please fill in at least the page name and followers count.',
        variant: 'destructive',
      });
      return;
    }

    setStep('calculating');

    // Simulate calculation time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const calculatedResults = calculateScores();
    setResults(calculatedResults);

    // Save audit to database
    if (user) {
      try {
        await supabase.from('audits').insert({
          user_id: user.id,
          audit_type: 'manual',
          page_name: formData.pageName,
          page_url: formData.pageUrl || null,
          input_data: formData,
          score_total: calculatedResults.overallScore,
          score_breakdown: {
            engagement: calculatedResults.engagementScore,
            consistency: calculatedResults.consistencyScore,
            readiness: calculatedResults.readinessScore,
          },
          recommendations: calculatedResults.recommendations,
          is_pro_unlocked: false,
        });
      } catch (error) {
        console.error('Error saving audit:', error);
      }
    }

    setStep('results');
  };

  const handleNewAudit = () => {
    setFormData({
      pageName: '',
      pageUrl: '',
      followers: '',
      postsPerWeek: '',
      totalLikes: '',
      totalComments: '',
      totalShares: '',
      numberOfPosts: '10',
      contentMix: 'mixed',
      hasCTA: false,
      hasWhatsApp: false,
      hasPinnedPost: false,
    });
    setResults(null);
    setStep('form');
  };

  // Form Step
  if (step === 'form') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Run Manual Audit</h1>
          <p className="text-muted-foreground">
            Enter your page details to get an instant health score and recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Basic Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pageName">Page Name *</Label>
                <Input
                  id="pageName"
                  placeholder="My Business Page"
                  value={formData.pageName}
                  onChange={(e) => handleInputChange('pageName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageUrl">Page URL (optional)</Label>
                <Input
                  id="pageUrl"
                  placeholder="https://facebook.com/mypage"
                  value={formData.pageUrl}
                  onChange={(e) => handleInputChange('pageUrl', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followers">Total Followers *</Label>
                <Input
                  id="followers"
                  type="number"
                  placeholder="10000"
                  value={formData.followers}
                  onChange={(e) => handleInputChange('followers', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postsPerWeek">Posts per Week</Label>
                <Input
                  id="postsPerWeek"
                  type="number"
                  placeholder="5"
                  value={formData.postsPerWeek}
                  onChange={(e) => handleInputChange('postsPerWeek', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Engagement Data */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Engagement Data (Last 10 Posts)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter the combined totals from your last 10 posts
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="totalLikes" className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" /> Total Likes
                </Label>
                <Input
                  id="totalLikes"
                  type="number"
                  placeholder="500"
                  value={formData.totalLikes}
                  onChange={(e) => handleInputChange('totalLikes', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalComments" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Total Comments
                </Label>
                <Input
                  id="totalComments"
                  type="number"
                  placeholder="50"
                  value={formData.totalComments}
                  onChange={(e) => handleInputChange('totalComments', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalShares" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" /> Total Shares
                </Label>
                <Input
                  id="totalShares"
                  type="number"
                  placeholder="20"
                  value={formData.totalShares}
                  onChange={(e) => handleInputChange('totalShares', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Content & Readiness */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Content & Conversion Readiness</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Content Mix</Label>
                <RadioGroup
                  value={formData.contentMix}
                  onValueChange={(value) => handleInputChange('contentMix', value)}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mostly_static" id="static" />
                    <Label htmlFor="static" className="font-normal">Mostly Static</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mostly_reels" id="reels" />
                    <Label htmlFor="reels" className="font-normal">Mostly Reels</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed" className="font-normal">Mixed Content</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Conversion Readiness</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasCTA"
                      checked={formData.hasCTA}
                      onCheckedChange={(checked) => handleInputChange('hasCTA', !!checked)}
                    />
                    <Label htmlFor="hasCTA" className="font-normal">
                      Has CTA button (Shop Now, Contact Us, etc.)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasWhatsApp"
                      checked={formData.hasWhatsApp}
                      onCheckedChange={(checked) => handleInputChange('hasWhatsApp', !!checked)}
                    />
                    <Label htmlFor="hasWhatsApp" className="font-normal">
                      Has WhatsApp/Messenger link
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPinnedPost"
                      checked={formData.hasPinnedPost}
                      onCheckedChange={(checked) => handleInputChange('hasPinnedPost', !!checked)}
                    />
                    <Label htmlFor="hasPinnedPost" className="font-normal">
                      Has pinned post
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            <Zap className="mr-2 h-5 w-5" />
            Calculate Score
          </Button>
        </form>
      </div>
    );
  }

  // Calculating Step
  if (step === 'calculating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse-glow">
              <BarChart3 className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Page...</h2>
          <p className="text-muted-foreground mb-6">
            Calculating engagement rates, consistency, and readiness scores.
          </p>
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  // Results Step
  if (step === 'results' && results) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Audit Results</h1>
            <p className="text-muted-foreground">{formData.pageName}</p>
          </div>
          <Button variant="outline" onClick={handleNewAudit}>
            <RefreshCw className="mr-2 h-4 w-4" />
            New Audit
          </Button>
        </div>

        {/* Score Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <ScoreCard
            title="Overall Score"
            score={results.overallScore}
            icon={BarChart3}
          />
          <ScoreCard
            title="Engagement"
            score={results.engagementScore}
            icon={ThumbsUp}
          />
          <ScoreCard
            title="Consistency"
            score={results.consistencyScore}
            icon={TrendingUp}
          />
          <ScoreCard
            title="Readiness"
            score={results.readinessScore}
            icon={Zap}
          />
        </div>

        {/* Engagement Rate */}
        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
              <p className="text-3xl font-bold">{results.engagementRate}%</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Industry average: 1-3%</p>
              {results.engagementRate >= 3 && (
                <p className="text-success font-medium">Above average! 🎉</p>
              )}
              {results.engagementRate < 1 && (
                <p className="text-destructive font-medium">Needs improvement</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Recommendations
          </h2>
          <ul className="space-y-3">
            {results.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Features Locked */}
        <LockedFeature
          title="Advanced Pro Insights"
          description="Get detailed action plans, best posting times, top posts analysis, and export PDF reports."
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">Pro Features Include:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-pro" />
                    7-day & 30-day action plans
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-pro" />
                    Best time to post analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-pro" />
                    Top/Worst posts identification
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-pro" />
                    AI content recommendations
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Export & Share:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-pro" />
                    Professional PDF report
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-pro" />
                    Shareable report link
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-pro" />
                    Historical comparisons
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-pro" />
                    White-label branding
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </LockedFeature>
      </div>
    );
  }

  return null;
}
