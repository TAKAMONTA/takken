import { subscriptionService } from './subscription-service';
import { logger } from './logger';

export interface FeatureLimit {
  canUse: boolean;
  remaining?: number;
  limit?: number;
  message?: string;
}

export class FeatureLimits {
  private static instance: FeatureLimits;

  private constructor() {}

  public static getInstance(): FeatureLimits {
    if (!FeatureLimits.instance) {
      FeatureLimits.instance = new FeatureLimits();
    }
    return FeatureLimits.instance;
  }

  /**
   * AI機能の使用制限をチェック
   */
  async checkAIUsage(userId: string): Promise<FeatureLimit> {
    try {
      const result = await subscriptionService.checkAIUsageLimit(userId);
      
      if (result.canUse) {
        return {
          canUse: true,
          remaining: result.remaining === -1 ? undefined : result.remaining,
          limit: result.remaining === -1 ? undefined : 3,
          message: result.remaining === -1 
            ? 'AI機能を無制限でご利用いただけます' 
            : `今月の残り回数: ${result.remaining}回`
        };
      } else {
        return {
          canUse: false,
          remaining: 0,
          limit: 3,
          message: '今月のAI機能使用回数に達しました。プレミアムプランにアップグレードすると無制限でご利用いただけます。'
        };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to check AI usage', err, { userId });
      return {
        canUse: false,
        remaining: 0,
        message: 'AI機能の利用状況を確認できませんでした。'
      };
    }
  }

  /**
   * 過去問アクセス制限をチェック
   */
  async checkPastQuestionsAccess(userId: string, questionYear: string): Promise<FeatureLimit> {
    try {
      const hasPremium = await subscriptionService.hasPremiumAccess(userId);
      
      if (hasPremium) {
        return {
          canUse: true,
          message: 'すべての年度の問題にアクセスできます'
        };
      }

      // 無料ユーザーは直近3年分のみ
      const currentYear = new Date().getFullYear();
      const questionYearNum = parseInt(questionYear.replace(/[^\d]/g, ''));
      const yearsDiff = currentYear - questionYearNum;

      if (yearsDiff <= 3) {
        return {
          canUse: true,
          message: '直近3年分の問題にアクセスできます'
        };
      } else {
        return {
          canUse: false,
          message: 'この年度の問題はプレミアムプランでのみご利用いただけます'
        };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to check past questions access', err, { userId, questionYear });
      return {
        canUse: false,
        message: '問題へのアクセス権限を確認できませんでした。'
      };
    }
  }

  /**
   * 広告表示制御
   */
  async shouldShowAds(userId: string): Promise<boolean> {
    try {
      const hasPremium = await subscriptionService.hasPremiumAccess(userId);
      return !hasPremium; // プレミアムユーザーは広告非表示
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to check ad display', err, { userId });
      return true; // エラーの場合は広告表示
    }
  }

  /**
   * プッシュ通知機能の制限
   */
  async checkPushNotificationAccess(userId: string): Promise<FeatureLimit> {
    try {
      const hasPremium = await subscriptionService.hasPremiumAccess(userId);
      
      if (hasPremium) {
        return {
          canUse: true,
          message: 'プッシュ通知と学習リマインダーをご利用いただけます'
        };
      } else {
        return {
          canUse: false,
          message: 'プッシュ通知機能はプレミアムプランでのみご利用いただけます'
        };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to check push notification access', err, { userId });
      return {
        canUse: false,
        message: 'プッシュ通知機能の利用権限を確認できませんでした。'
      };
    }
  }

  /**
   * オフライン問題ダウンロードの制限
   */
  async checkOfflineDownloadAccess(userId: string): Promise<FeatureLimit> {
    try {
      const hasPremium = await subscriptionService.hasPremiumAccess(userId);
      
      if (hasPremium) {
        return {
          canUse: true,
          message: 'すべての問題をオフラインでダウンロードできます'
        };
      } else {
        return {
          canUse: false,
          message: 'オフライン問題ダウンロードはプレミアムプランでのみご利用いただけます'
        };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to check offline download access', err, { userId });
      return {
        canUse: false,
        message: 'オフライン機能の利用権限を確認できませんでした。'
      };
    }
  }

  /**
   * 詳細学習分析の制限
   */
  async checkAnalyticsAccess(userId: string): Promise<FeatureLimit> {
    try {
      const hasPremium = await subscriptionService.hasPremiumAccess(userId);
      
      if (hasPremium) {
        return {
          canUse: true,
          message: '詳細な学習分析とレポートをご利用いただけます'
        };
      } else {
        return {
          canUse: false,
          message: '詳細学習分析はプレミアムプランでのみご利用いただけます'
        };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to check analytics access', err, { userId });
      return {
        canUse: false,
        message: '学習分析機能の利用権限を確認できませんでした。'
      };
    }
  }

  /**
   * AI問題生成機能の制限
   */
  async checkAIQuestionGenerationAccess(userId: string): Promise<FeatureLimit> {
    try {
      const hasPremium = await subscriptionService.hasPremiumAccess(userId);
      
      if (hasPremium) {
        return {
          canUse: true,
          message: 'AI問題生成機能をご利用いただけます'
        };
      } else {
        return {
          canUse: false,
          message: 'AI問題生成機能はプレミアムプランでのみご利用いただけます'
        };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to check AI question generation access', err, { userId });
      return {
        canUse: false,
        message: 'AI問題生成機能の利用権限を確認できませんでした。'
      };
    }
  }

  /**
   * 機能使用時の共通処理
   */
  async useFeature(userId: string, featureType: 'ai' | 'analytics' | 'offline' | 'push' | 'question_generation'): Promise<boolean> {
    try {
      switch (featureType) {
        case 'ai':
          const aiLimit = await this.checkAIUsage(userId);
          if (aiLimit.canUse) {
            await subscriptionService.recordAIUsage(userId);
            return true;
          }
          return false;
        
        case 'analytics':
          const analyticsLimit = await this.checkAnalyticsAccess(userId);
          return analyticsLimit.canUse;
        
        case 'offline':
          const offlineLimit = await this.checkOfflineDownloadAccess(userId);
          return offlineLimit.canUse;
        
        case 'push':
          const pushLimit = await this.checkPushNotificationAccess(userId);
          return pushLimit.canUse;
        
        case 'question_generation':
          const questionLimit = await this.checkAIQuestionGenerationAccess(userId);
          return questionLimit.canUse;
        
        default:
          return false;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Failed to use feature ${featureType}`, err, { userId, featureType });
      return false;
    }
  }
}

export const featureLimits = FeatureLimits.getInstance();
