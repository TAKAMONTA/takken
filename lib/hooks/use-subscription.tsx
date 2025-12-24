"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { SubscriptionPlan, SubscriptionStatus, PLAN_CONFIGS } from "@/lib/types/subscription";
import { firestoreService } from "@/lib/firestore-service";
import { logger } from "@/lib/logger";
import { getAuth } from "firebase/auth";
import { fetchWithRetry, parseAPIError, getUserFriendlyErrorMessage } from "@/lib/api-error-handler";

/**
 * サブスクリプション情報の型定義
 */
export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
  cancelAtPeriodEnd: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * サブスクリプションコンテキストの型定義
 */
interface SubscriptionContextType {
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  createCheckoutSession: (plan: SubscriptionPlan, yearly?: boolean) => Promise<string | null>;
  hasFeatureAccess: (feature: keyof typeof PLAN_CONFIGS[SubscriptionPlan.FREE]['features']) => boolean;
  getFeatureLimit: (feature: keyof typeof PLAN_CONFIGS[SubscriptionPlan.FREE]['features']) => number;
  canUseFeature: (feature: keyof typeof PLAN_CONFIGS[SubscriptionPlan.FREE]['features'], currentUsage?: number) => boolean;
}

/**
 * サブスクリプションコンテキスト
 */
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

/**
 * サブスクリプションProvider Props
 */
interface SubscriptionProviderProps {
  children: ReactNode;
}

/**
 * サブスクリプションProvider
 * アプリ全体でサブスクリプション状態を管理します
 */
export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 現在のユーザーIDを取得
   */
  const getCurrentUserId = (): string | null => {
    try {
      // まずローカルストレージから取得（より堅牢）
      const userData = localStorage.getItem("takken_user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }

      // ローカルストレージにない場合、Firebase認証から取得
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          return user.uid;
        }
      } catch (firebaseError) {
        // Firebase App が初期化されていない場合はスキップ
        console.warn("[getCurrentUserId] Firebase未初期化:", firebaseError);
      }

      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("ユーザーID取得エラー", error);
      return null;
    }
  };

  /**
   * サブスクリプション情報を取得
   */
  const loadSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        // ユーザーがログインしていない場合は無料プランとして扱う
        setSubscription({
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.INACTIVE,
          cancelAtPeriodEnd: false,
          isLoading: false,
          error: null,
        });
        setIsLoading(false);
        return;
      }

      // Firestoreからサブスクリプション情報を取得
      const userSubscription = await firestoreService.getUserSubscription(userId);

      if (!userSubscription) {
        // サブスクリプション情報がない場合は無料プラン
        setSubscription({
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.INACTIVE,
          cancelAtPeriodEnd: false,
          isLoading: false,
          error: null,
        });
        setIsLoading(false);
        return;
      }

      // サブスクリプション情報を変換
      const plan = (userSubscription.planId as SubscriptionPlan) || SubscriptionPlan.FREE;
      const status = userSubscription.status === "active"
        ? SubscriptionStatus.ACTIVE
        : SubscriptionStatus.INACTIVE;

      // 有効期限をチェック
      const now = new Date();
      const endDate = userSubscription.endDate;
      const isExpired = endDate && endDate < now;

      setSubscription({
        plan: isExpired ? SubscriptionPlan.FREE : plan,
        status: isExpired ? SubscriptionStatus.INACTIVE : status,
        startDate: userSubscription.startDate,
        endDate: endDate,
        cancelAtPeriodEnd: !userSubscription.autoRenew,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("サブスクリプション情報の取得エラー", error);
      setError(error.message);
      setSubscription({
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.INACTIVE,
        cancelAtPeriodEnd: false,
        isLoading: false,
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * サブスクリプション情報をリフレッシュ
   */
  const refreshSubscription = async () => {
    await loadSubscription();
  };

  /**
   * Checkoutセッションを作成
   */
  const createCheckoutSession = async (
    plan: SubscriptionPlan,
    yearly = false
  ): Promise<string | null> => {
    try {
      console.log("[Checkout] セッション作成開始", { plan, yearly });
      
      const userId = getCurrentUserId();
      console.log("[Checkout] ユーザーID取得", { userId: userId ? `${userId.substring(0, 8)}...` : "なし" });
      
      if (!userId) {
        console.error("[Checkout] エラー: ユーザーIDが取得できませんでした");
        throw new Error("ログインが必要です");
      }

      // ヘッダーを準備
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Firebase認証トークンを取得（未初期化の場合はスキップ）
      let user = null;
      try {
        const auth = getAuth();
        user = auth.currentUser;
        console.log("[Checkout] Firebase認証ユーザー", { hasUser: !!user });
        
        // Firebase認証ユーザーがいない場合、認証状態を再確認
        if (!user) {
          // 少し待ってから再確認（認証状態の同期を待つ）
          console.log("[Checkout] 認証状態の再確認を待機中...");
          await new Promise(resolve => setTimeout(resolve, 500));
          user = auth.currentUser;
          console.log("[Checkout] 再確認後のFirebase認証ユーザー", { hasUser: !!user });
        }
        
        if (user) {
          // Firebase認証ユーザーがいる場合はトークンを使用
          console.log("[Checkout] Firebase IDトークンを取得中...");
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
          console.log("[Checkout] Firebase IDトークン取得完了", { tokenLength: token.length });
        }
      } catch (firebaseError) {
        // Firebase App が初期化されていない場合はスキップ
        console.warn("[Checkout] Firebase未初期化、ローカルストレージ認証を使用", firebaseError);
      }
      
      if (!user) {
        // ローカルストレージ認証の場合は、userIdをヘッダーに含める
        headers["X-User-Id"] = userId;
        console.log("[Checkout] ローカルストレージ認証を使用", { userId });
        logger.debug("ローカルストレージ認証を使用してCheckoutセッションを作成", { userId });
      }

      const requestBody = {
        plan,
        yearly,
      };
      console.log("[Checkout] APIリクエスト送信", { 
        url: "/api/subscription/create-checkout-session",
        method: "POST",
        headers: { ...headers, Authorization: headers.Authorization ? "Bearer ***" : undefined },
        body: requestBody
      });

      // APIを呼び出してCheckoutセッションを作成（リトライ付き）
      const response = await fetchWithRetry(
        "/api/subscription/create-checkout-session",
        {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        },
        {
          maxRetries: 2,
          retryDelay: 1000,
        }
      );

      console.log("[Checkout] APIレスポンス受信", { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      });

      if (!response.ok) {
        // エラーデータを取得
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: response.statusText };
        }

        // APIエラーを解析
        const apiError = parseAPIError(response, errorData);
        logger.error("APIエラーレスポンス", { 
          status: response.status, 
          statusText: response.statusText,
          error: errorData,
          errorType: apiError.type,
        });

        throw apiError;
      }

      const data = await response.json();
      console.log("[Checkout] レスポンスデータ", { hasUrl: !!data.url, hasError: !!data.error });

      if (!data.url) {
        console.error("[Checkout] エラー: Checkout URLが取得できませんでした", data);
        throw new Error("Checkout URLが取得できませんでした");
      }

      console.log("[Checkout] 成功: Checkout URL取得", { url: data.url.substring(0, 50) + "..." });
      return data.url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      
      console.error("[Checkout] エラー発生", { 
        message: error.message,
        friendlyMessage,
        stack: error.stack,
        name: error.name 
      });
      logger.error("Checkoutセッション作成エラー", error);
      setError(friendlyMessage);
      return null;
    }
  };

  /**
   * 機能へのアクセス権があるかチェック
   */
  const hasFeatureAccess = (
    feature: keyof typeof PLAN_CONFIGS[SubscriptionPlan.FREE]['features']
  ): boolean => {
    if (!subscription) return false;

    const planConfig = PLAN_CONFIGS[subscription.plan];
    const featureValue = planConfig.features[feature];

    // boolean型の機能の場合
    if (typeof featureValue === "boolean") {
      return featureValue;
    }

    // number型の機能の場合（-1は無制限）
    if (typeof featureValue === "number") {
      return featureValue === -1 || featureValue > 0;
    }

    return false;
  };

  /**
   * 機能の制限値を取得
   */
  const getFeatureLimit = (
    feature: keyof typeof PLAN_CONFIGS[SubscriptionPlan.FREE]['features']
  ): number => {
    if (!subscription) {
      const freeConfig = PLAN_CONFIGS[SubscriptionPlan.FREE];
      const limit = freeConfig.features[feature];
      return typeof limit === "number" ? limit : 0;
    }

    const planConfig = PLAN_CONFIGS[subscription.plan];
    const limit = planConfig.features[feature];
    return typeof limit === "number" ? limit : 0;
  };

  /**
   * 機能が使用可能かチェック
   */
  const canUseFeature = (
    feature: keyof typeof PLAN_CONFIGS[SubscriptionPlan.FREE]['features'],
    currentUsage?: number
  ): boolean => {
    const limit = getFeatureLimit(feature);

    // 無制限の場合
    if (limit === -1) return true;

    // 使用量が指定されていない場合は制限のみチェック
    if (currentUsage === undefined) return limit > 0;

    // 使用量が制限内かチェック
    return currentUsage < limit;
  };

  // 初期化時にサブスクリプション情報を読み込む
  useEffect(() => {
    loadSubscription();
  }, []);

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    error,
    refreshSubscription,
    createCheckoutSession,
    hasFeatureAccess,
    getFeatureLimit,
    canUseFeature,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * サブスクリプションHook
 * コンポーネント内でサブスクリプション情報にアクセスします
 */
export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }

  return context;
}














