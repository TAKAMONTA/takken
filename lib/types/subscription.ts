// サブスクリプション関連の型定義

export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing'
}

export interface SubscriptionFeatures {
  questionLimit: number; // -1 = 無制限
  pastExamYears: number;
  aiExplanationLimit: number; // -1 = 無制限
  advancedAnalytics: boolean;
  successPatternAnalysis: boolean;
  spacedRepetition: boolean;
  adFree: boolean;
  offlineQuestions: boolean;
  prioritySupport: boolean;
  customStudyPlans: boolean;
}

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number; // 月額料金（円）
  yearlyPrice?: number; // 年額料金（円）
  features: SubscriptionFeatures;
  stripePriceId?: string;
  stripeYearlyPriceId?: string;
  popular?: boolean;
}

export interface UserSubscription {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageStats {
  userId: string;
  questionsAnswered: number;
  aiExplanationsUsed: number;
  lastResetDate: Date;
  monthlyQuestionCount: number;
  monthlyAiCount: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface SubscriptionCheckoutSession {
  id: string;
  url: string;
  plan: SubscriptionPlan;
  userId: string;
}

// プラン設定
export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  [SubscriptionPlan.FREE]: {
    id: SubscriptionPlan.FREE,
    name: '無料プラン',
    description: '基本的な学習機能を利用できます',
    price: 0,
    features: {
      questionLimit: 500,
      pastExamYears: 3,
      aiExplanationLimit: 10, // 月10回まで
      advancedAnalytics: false,
      successPatternAnalysis: false,
      spacedRepetition: false,
      adFree: false,
      offlineQuestions: false,
      prioritySupport: false,
      customStudyPlans: false
    }
  },
  [SubscriptionPlan.PREMIUM]: {
    id: SubscriptionPlan.PREMIUM,
    name: 'プレミアムプラン',
    description: '全機能を無制限で利用できます',
    price: 980,
    yearlyPrice: 9800, // 2ヶ月分お得
    popular: true,
    features: {
      questionLimit: -1, // 無制限
      pastExamYears: 10,
      aiExplanationLimit: -1, // 無制限
      advancedAnalytics: true,
      successPatternAnalysis: true,
      spacedRepetition: true,
      adFree: true,
      offlineQuestions: true,
      prioritySupport: true,
      customStudyPlans: true
    }
  }
};

// 機能制限チェック用のヘルパー関数
export function hasFeatureAccess(
  userPlan: SubscriptionPlan,
  feature: keyof SubscriptionFeatures
): boolean {
  return PLAN_CONFIGS[userPlan].features[feature] as boolean;
}

export function getFeatureLimit(
  userPlan: SubscriptionPlan,
  feature: keyof SubscriptionFeatures
): number {
  return PLAN_CONFIGS[userPlan].features[feature] as number;
}

export function canUseFeature(
  userPlan: SubscriptionPlan,
  feature: keyof SubscriptionFeatures,
  currentUsage?: number
): boolean {
  const limit = getFeatureLimit(userPlan, feature);
  
  // 無制限の場合
  if (limit === -1) return true;
  
  // 使用量が指定されていない場合は制限のみチェック
  if (currentUsage === undefined) return limit > 0;
  
  // 使用量が制限内かチェック
  return currentUsage < limit;
}

export function getPlanDisplayName(plan: SubscriptionPlan): string {
  return PLAN_CONFIGS[plan].name;
}

export function getPlanPrice(plan: SubscriptionPlan, yearly = false): number {
  const config = PLAN_CONFIGS[plan];
  return yearly && config.yearlyPrice ? config.yearlyPrice : config.price;
}

export function getPlanFeatures(plan: SubscriptionPlan): SubscriptionFeatures {
  return PLAN_CONFIGS[plan].features;
}
