"use client";

import React from "react";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { SubscriptionPlan, PLAN_CONFIGS } from "@/lib/types/subscription";

interface FeatureLimitGuardProps {
  feature: keyof typeof PLAN_CONFIGS[SubscriptionPlan.FREE]['features'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showWarning?: boolean;
}

export function FeatureLimitGuard({
  feature,
  children,
  fallback,
  showWarning = true,
}: FeatureLimitGuardProps) {
  const { hasFeatureAccess, subscription, isLoading } = useSubscription();

  // ローディング中は制限しない
  if (isLoading) {
    return <>{children}</>;
  }

  // 機能へのアクセス権をチェック
  const hasAccess = hasFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // フォールバックが指定されている場合はそれを使用
  if (fallback) {
    return <>{fallback}</>;
  }

  // 警告メッセージを表示
  if (showWarning) {
    return (
      <FeatureLimitMessage
        feature={feature}
        planConfig={subscription ? PLAN_CONFIGS[subscription.plan] : PLAN_CONFIGS[SubscriptionPlan.FREE]}
        showWarning={showWarning}
      />
    );
  }

  return null;
}

interface UsageLimitGuardProps {
  feature: "questionLimit" | "aiExplanationLimit";
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showWarning?: boolean;
  currentUsage?: number;
}

export function UsageLimitGuard({
  feature,
  children,
  fallback,
  showWarning = true,
  currentUsage,
}: UsageLimitGuardProps) {
  const { canUseFeature, subscription, isLoading } = useSubscription();

  // ローディング中は制限しない
  if (isLoading) {
    return <>{children}</>;
  }

  // 機能が使用可能かチェック
  const canUse = canUseFeature(feature, currentUsage);

  if (canUse) {
    return <>{children}</>;
  }

  // フォールバックが指定されている場合はそれを使用
  if (fallback) {
    return <>{fallback}</>;
  }

  // 警告メッセージを表示
  if (showWarning) {
    return <UsageLimitMessage feature={feature} />;
  }

  return null;
}

interface FeatureLimitMessageProps {
  feature: string;
  planConfig: any;
  showWarning: boolean;
}

function FeatureLimitMessage({
  feature,
  planConfig,
  showWarning,
}: FeatureLimitMessageProps) {
  const getFeatureDisplayName = (feature: string): string => {
    const featureNames: Record<string, string> = {
      questionLimit: "問題演習",
      aiExplanationLimit: "AI解説",
      advancedAnalytics: "高度な分析",
      successPatternAnalysis: "合格者パターン分析",
      spacedRepetition: "スペーシング復習",
      adFree: "広告非表示",
      offlineQuestions: "オフライン問題",
      prioritySupport: "優先サポート",
      customStudyPlans: "カスタム学習プラン",
      pastExamYears: "過去問年数",
    };
    return featureNames[feature] || feature;
  };

  const featureName = getFeatureDisplayName(feature);
  const currentPlan = planConfig?.name || "無料プラン";

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center">
      <div className="mb-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-9a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {featureName}はプレミアム機能です
        </h3>
        <p className="text-gray-600 mb-4">
          現在のプラン「{currentPlan}」では{featureName}をご利用いただけません。
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => (window.location.href = "/subscription/pricing")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          プレミアムプランにアップグレード
        </button>
        <button
          onClick={() => (window.location.href = "/subscription/pricing")}
          className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
        >
          プラン比較を見る
        </button>
      </div>
    </div>
  );
}

interface UsageLimitMessageProps {
  feature: "questionLimit" | "aiExplanationLimit";
}

function UsageLimitMessage({ feature }: UsageLimitMessageProps) {
  const featureName = feature === "questionLimit" ? "問題演習" : "AI解説";
  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1, 1);
  resetDate.setHours(0, 0, 0, 0);

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 text-center">
      <div className="mb-4">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {featureName}の月間制限に達しました
        </h3>
        <p className="text-gray-600 mb-2">
          今月の{featureName}使用回数: 10/10回
        </p>
        <p className="text-sm text-gray-500 mb-4">
          制限は{resetDate.toLocaleDateString("ja-JP")}にリセットされます
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => (window.location.href = "/subscription/pricing")}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          プレミアムプランで無制限利用
        </button>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="w-full text-orange-600 hover:text-orange-700 font-medium py-2 px-4 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors"
        >
          ダッシュボードに戻る
        </button>
      </div>
    </div>
  );
}

interface UsageWarningMessageProps {
  feature: "questionLimit" | "aiExplanationLimit";
}

function UsageWarningMessage({ feature }: UsageWarningMessageProps) {
  const featureName = feature === "questionLimit" ? "問題演習" : "AI解説";

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-yellow-600 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-yellow-800">
            {featureName}の制限が近づいています
          </h4>
          <p className="text-sm text-yellow-700 mt-1">
            残り2回のご利用が可能です（月間10回まで）
          </p>
          <div className="mt-2">
            <button
              onClick={() => (window.location.href = "/subscription/pricing")}
              className="text-sm text-yellow-800 hover:text-yellow-900 font-medium underline"
            >
              プレミアムプランで無制限利用 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 使用量表示コンポーネント
interface UsageDisplayProps {
  feature: "questionLimit" | "aiExplanationLimit";
  className?: string;
}

export function UsageDisplay({ feature, className = "" }: UsageDisplayProps) {
  const { getFeatureLimit, subscription, isLoading } = useSubscription();
  const featureName = feature === "questionLimit" ? "問題演習" : "AI解説";

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">{featureName}</span>
          <span className="text-gray-400">読み込み中...</span>
        </div>
      </div>
    );
  }

  const limit = getFeatureLimit(feature);
  const isUnlimited = limit === -1;
  const planName = subscription
    ? PLAN_CONFIGS[subscription.plan].name
    : PLAN_CONFIGS[SubscriptionPlan.FREE].name;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">{featureName}</span>
        <span className="font-medium">
          {isUnlimited ? (
            <span className="text-green-600">無制限</span>
          ) : (
            <span className="text-gray-600">{limit}回/月</span>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="text-xs text-gray-500">
          プラン: {planName}
        </div>
      )}
    </div>
  );
}
