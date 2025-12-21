"use client";

import React from "react";
import Link from "next/link";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { SubscriptionPlan } from "@/lib/types/subscription";

/**
 * サブスクリプションバッジコンポーネント
 * 現在のプラン状態を表示します
 */
export default function SubscriptionBadge({ className = "" }: { className?: string }) {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-600">読み込み中...</span>
      </div>
    );
  }

  const isPremium = subscription?.plan === SubscriptionPlan.PREMIUM;

  return (
    <Link
      href="/subscription/pricing"
      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
        isPremium
          ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } ${className}`}
    >
      {isPremium ? (
        <>
          <i className="ri-vip-crown-fill text-yellow-300"></i>
          <span className="text-xs font-medium">プレミアム</span>
        </>
      ) : (
        <>
          <i className="ri-user-line"></i>
          <span className="text-xs font-medium">無料プラン</span>
        </>
      )}
    </Link>
  );
}

/**
 * AI使用制限表示コンポーネント
 */
export function AIUsageDisplay({ className = "" }: { className?: string }) {
  const { subscription, getFeatureLimit, isLoading } = useSubscription();

  if (isLoading) {
    return null;
  }

  const aiLimit = getFeatureLimit("aiExplanationLimit");
  const isUnlimited = aiLimit === -1;

  if (isUnlimited) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 ${className}`}>
        <i className="ri-infinite-line text-green-600"></i>
        <span className="text-xs text-green-700 font-medium">AI無制限</span>
      </div>
    );
  }

  // TODO: 実際の使用回数をFirestoreから取得
  const currentUsage = 0; // 仮の値

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
      currentUsage >= aiLimit * 0.8
        ? "bg-orange-50 border border-orange-200"
        : "bg-blue-50 border border-blue-200"
    } ${className}`}>
      <i className={`ri-ai-generate ${
        currentUsage >= aiLimit * 0.8 ? "text-orange-600" : "text-blue-600"
      }`}></i>
      <span className={`text-xs font-medium ${
        currentUsage >= aiLimit * 0.8 ? "text-orange-700" : "text-blue-700"
      }`}>
        AI解説: {currentUsage}/{aiLimit}回
      </span>
    </div>
  );
}

/**
 * プレミアム機能ロックメッセージ
 */
interface PremiumLockMessageProps {
  featureName: string;
  description: string;
  className?: string;
}

export function PremiumLockMessage({ 
  featureName, 
  description,
  className = "" 
}: PremiumLockMessageProps) {
  return (
    <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-8 text-center ${className}`}>
      <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        <i className="ri-lock-line text-3xl text-purple-600"></i>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {featureName}はプレミアム機能です
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      <div className="space-y-3">
        <Link
          href="/subscription/pricing"
          className="inline-block w-full max-w-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          <i className="ri-vip-crown-line mr-2"></i>
          プレミアムプランを見る
        </Link>
      </div>
    </div>
  );
}
