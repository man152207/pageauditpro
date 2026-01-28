import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionFeatures {
  canAutoAudit: boolean;
  canExportPdf: boolean;
  canShareReport: boolean;
  canViewFullMetrics: boolean;
  canViewDemographics: boolean;
  canViewAIInsights: boolean;
}

export interface UsageLimits {
  audits_per_month: number;
  pdf_exports: number;
  history_days: number;
}

export interface UsageStats {
  auditsUsed: number;
  auditsLimit: number;
  auditsRemaining: number;
}

export function useSubscription() {
  const { subscription, isPro, isLoading } = useAuth();

  const features: SubscriptionFeatures = subscription?.features || {
    canAutoAudit: false,
    canExportPdf: false,
    canShareReport: false,
    canViewFullMetrics: false,
    canViewDemographics: false,
    canViewAIInsights: false,
  };

  const limits: UsageLimits = subscription?.limits || {
    audits_per_month: 3,
    pdf_exports: 0,
    history_days: 7,
  };

  const usage: UsageStats = subscription?.usage || {
    auditsUsed: 0,
    auditsLimit: 3,
    auditsRemaining: 3,
  };

  const plan = subscription?.plan || {
    id: null,
    name: 'Free',
    billing_type: 'free',
    price: 0,
    currency: 'USD',
  };

  const canUseFeature = (feature: keyof SubscriptionFeatures): boolean => {
    return features[feature] === true;
  };

  const hasReachedLimit = (limitType: 'audits' | 'pdf_exports'): boolean => {
    if (isPro) return false;
    
    if (limitType === 'audits') {
      return usage.auditsRemaining <= 0;
    }
    
    return false;
  };

  const getRemainingUsage = (limitType: 'audits' | 'pdf_exports'): number => {
    if (isPro) return Infinity;
    
    if (limitType === 'audits') {
      return usage.auditsRemaining;
    }
    
    return 0;
  };

  return {
    // State
    subscription,
    isPro,
    isLoading,
    
    // Plan info
    plan,
    planName: plan.name,
    
    // Features
    features,
    canUseFeature,
    
    // Limits & Usage
    limits,
    usage,
    hasReachedLimit,
    getRemainingUsage,
  };
}
