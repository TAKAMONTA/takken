import { registerPlugin } from '@capacitor/core';

export interface InAppPurchasePlugin {
  /**
   * 利用可能な商品を取得
   */
  getProducts(productIds: string[]): Promise<{ products: Product[] }>;

  /**
   * サブスクリプションを購入
   */
  purchaseSubscription(productId: string): Promise<{ transaction: Transaction }>;

  /**
   * 購入履歴を取得
   */
  getPurchaseHistory(): Promise<{ transactions: Transaction[] }>;

  /**
   * アクティブなサブスクリプションを取得
   */
  getActiveSubscriptions(): Promise<{ subscriptions: Subscription[] }>;

  /**
   * 購入の復元
   */
  restorePurchases(): Promise<{ transactions: Transaction[] }>;

  /**
   * 購入状態のリスナーを設定
   */
  addPurchaseListener(callback: (transaction: Transaction) => void): Promise<void>;
}

export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceLocale: string;
  type: 'consumable' | 'non_consumable' | 'subscription';
}

export interface Transaction {
  transactionId: string;
  productId: string;
  purchaseDate: string;
  originalPurchaseDate?: string;
  quantity: number;
  state: 'purchased' | 'restored' | 'failed' | 'deferred';
}

export interface Subscription {
  productId: string;
  isActive: boolean;
  willRenew: boolean;
  expirationDate?: string;
  gracePeriodExpirationDate?: string;
  isInGracePeriod: boolean;
  isInBillingRetryPeriod: boolean;
  originalPurchaseDate: string;
  latestPurchaseDate: string;
}

const InAppPurchase = registerPlugin<InAppPurchasePlugin>('InAppPurchase');

export default InAppPurchase;
