import { firestoreService } from './firestore-service';
import InAppPurchase, { Product, Transaction, Subscription } from '../src/plugins/InAppPurchase';

/**
 * iOS In-App Purchase対応のサブスクリプション管理サービス
 * - iOSアプリでのみ利用可能
 * - Stripeは使用しない（2025年10月削除）
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  productId: string; // iOS In-App Purchase Product ID
}

export interface UserSubscription {
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  transactionId?: string;
}

export class SubscriptionService {
  private static instance: SubscriptionService;
  
  // サブスクリプションプラン定義
  public static readonly PLANS: SubscriptionPlan[] = [
    {
      id: 'premium_monthly',
      name: 'プレミアムプラン（月額）',
      price: 500,
      features: [
        'AI機能無制限利用',
        '広告完全非表示',
        '全年度過去問アクセス',
        'AI問題生成機能',
        '詳細学習分析・レポート',
        'プッシュ通知・学習リマインダー',
        'オフライン問題ダウンロード拡張'
      ],
      productId: 'com.takken.study.premium.monthly'
    }
  ];

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * 利用可能な商品を取得
   */
  async getAvailableProducts(): Promise<Product[]> {
    try {
      const productIds = SubscriptionService.PLANS.map(plan => plan.productId);
      const result = await InAppPurchase.getProducts(productIds);
      return result.products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  /**
   * サブスクリプションを購入
   */
  async purchaseSubscription(planId: string, userId: string): Promise<boolean> {
    try {
      const plan = SubscriptionService.PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const result = await InAppPurchase.purchaseSubscription(plan.productId);
      
      if (result.transaction) {
        // Firestoreにサブスクリプション情報を保存
        await this.saveSubscription(userId, planId, result.transaction);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to purchase subscription:', error);
      return false;
    }
  }

  /**
   * ユーザーのサブスクリプション状態を取得
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const subscription = await firestoreService.getUserSubscription(userId);
      return subscription;
    } catch (error) {
      console.error('Failed to get user subscription:', error);
      return null;
    }
  }

  /**
   * ユーザーがプレミアム機能にアクセス可能かチェック
   */
  async hasPremiumAccess(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return false;
      }

      // アクティブなサブスクリプションかチェック
      if (subscription.status !== 'active') {
        return false;
      }

      // 有効期限をチェック
      if (subscription.endDate && subscription.endDate < new Date()) {
        // 期限切れの場合はステータスを更新
        await this.updateSubscriptionStatus(userId, 'expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check premium access:', error);
      return false;
    }
  }

  /**
   * AI機能の使用回数をチェック
   */
  async checkAIUsageLimit(userId: string): Promise<{ canUse: boolean; remaining: number }> {
    try {
      const hasPremium = await this.hasPremiumAccess(userId);
      
      if (hasPremium) {
        return { canUse: true, remaining: -1 }; // 無制限
      }

      // 無料ユーザーの場合は月3回まで
      const usage = await firestoreService.getAIUsageCount(userId, new Date());
      const limit = 3;
      const remaining = Math.max(0, limit - usage);

      return {
        canUse: remaining > 0,
        remaining
      };
    } catch (error) {
      console.error('Failed to check AI usage limit:', error);
      return { canUse: false, remaining: 0 };
    }
  }

  /**
   * AI機能の使用回数を記録
   */
  async recordAIUsage(userId: string): Promise<void> {
    try {
      await firestoreService.incrementAIUsageCount(userId, new Date());
    } catch (error) {
      console.error('Failed to record AI usage:', error);
    }
  }

  /**
   * 購入履歴を復元
   */
  async restorePurchases(userId: string): Promise<boolean> {
    try {
      const result = await InAppPurchase.restorePurchases();
      
      if (result.transactions.length > 0) {
        // 最新のトランザクションを処理
        const latestTransaction = result.transactions[result.transactions.length - 1];
        const plan = SubscriptionService.PLANS.find(p => p.productId === latestTransaction.productId);
        
        if (plan) {
          await this.saveSubscription(userId, plan.id, latestTransaction);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return false;
    }
  }

  /**
   * サブスクリプション情報をFirestoreに保存
   */
  private async saveSubscription(userId: string, planId: string, transaction: Transaction): Promise<void> {
    const plan = SubscriptionService.PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const subscription: UserSubscription = {
      userId,
      planId,
      status: 'active',
      startDate: new Date(transaction.purchaseDate),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
      autoRenew: true,
      transactionId: transaction.transactionId
    };

    await firestoreService.saveUserSubscription(subscription);
  }

  /**
   * サブスクリプションステータスを更新
   */
  private async updateSubscriptionStatus(userId: string, status: UserSubscription['status']): Promise<void> {
    await firestoreService.updateUserSubscriptionStatus(userId, status);
  }

  /**
   * 購入リスナーを設定
   */
  async setupPurchaseListener(): Promise<void> {
    try {
      await InAppPurchase.addPurchaseListener((transaction) => {
        console.log('Purchase completed:', transaction);
        // 必要に応じてUIを更新
      });
    } catch (error) {
      console.error('Failed to setup purchase listener:', error);
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance();