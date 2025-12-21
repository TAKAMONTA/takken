"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { SubscriptionPlan } from "@/lib/types/subscription";

interface AIUsageIndicatorProps {
  className?: string;
  showUpgradeButton?: boolean;
}

/**
 * AI使用回数インジケーター
 * AI機能の残り使用回数を表示します
 */
export default function AIUsageIndicator({ 
  className = "",
  showUpgradeButton = true 
}: AIUsageIndicatorProps) {
  const { subscription, getFeatureLimit, isLoading } = useSubscription();
  const [currentUsage, setCurrentUsage] = useState(0);

  useEffect(() => {
    // TODO: Firestoreから実際の使用回数を取得
    // 現在は仮の値を使用
    const userId = localStorage.getItem("takken_user");
    if (userId) {
      // firestoreService.getAIUsageCount(userId).then(setCurrentUsage);
    }
  }, []);

  if (isLoading) {
    return null;
  }

  const aiLimit = getFeatureLimit("aiExplanationLimit");
  const isUnlimited = aiLimit === -1;
  const isPremium = subscription?.plan === SubscriptionPlan.PREMIUM;

  // プレミアムユーザーの場合
  if (isUnlimited || isPremium) {
    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 ${className}`}>
        <i className="ri-infinite-line text-purple-600 text-lg"></i>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-purple-700">AI機能無制限</span>
          <span className="text-xs text-purple-600">プレミアムプラン</span>
        </div>
      </div>
    );
  }

  // 無料ユーザーの場合
  const remaining = Math.max(0, aiLimit - currentUsage);
  const usagePercentage = (currentUsage / aiLimit) * 100;
  const isWarning = usagePercentage >= 80;
  const isDanger = remaining === 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className={`p-4 rounded-lg border-2 ${
          isDanger
            ? "bg-red-50 border-red-300"
            : isWarning
            ? "bg-orange-50 border-orange-300"
            : "bg-blue-50 border-blue-300"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <i
              className={`ri-ai-generate text-lg ${
                isDanger
                  ? "text-red-600"
                  : isWarning
                  ? "text-orange-600"
                  : "text-blue-600"
              }`}
            ></i>
            <span
              className={`text-sm font-semibold ${
                isDanger
                  ? "text-red-900"
                  : isWarning
                  ? "text-orange-900"
                  : "text-blue-900"
              }`}
            >
              AI解説機能
            </span>
          </div>
          <span
            className={`text-sm font-bold ${
              isDanger
                ? "text-red-700"
                : isWarning
                ? "text-orange-700"
                : "text-blue-700"
            }`}
          >
            残り {remaining}/{aiLimit}回
          </span>
        </div>

        {/* プログレスバー */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isDanger
                ? "bg-red-500"
                : isWarning
                ? "bg-orange-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>

        {/* メッセージ */}
        <p
          className={`text-xs mt-2 ${
            isDanger
              ? "text-red-700"
              : isWarning
              ? "text-orange-700"
              : "text-blue-700"
          }`}
        >
          {isDanger
            ? "今月のAI解説使用回数に達しました"
            : isWarning
            ? "AI解説の残り回数が少なくなっています"
            : "今月の使用可能回数"}
        </p>
      </div>

      {/* アップグレードボタン */}
      {showUpgradeButton && (isDanger || isWarning) && (
        <Link
          href="/subscription/pricing"
          className={`block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
            isDanger
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-orange-600 hover:bg-orange-700 text-white"
          }`}
        >
          <i className="ri-vip-crown-line mr-2"></i>
          プレミアムで無制限利用
        </Link>
      )}
    </div>
  );
}

/**
 * シンプルなAI使用回数表示（コンパクト版）
 */
export function AIUsageCompact({ className = "" }: { className?: string }) {
  const { subscription, getFeatureLimit } = useSubscription();
  const aiLimit = getFeatureLimit("aiExplanationLimit");
  const isUnlimited = aiLimit === -1;
  const currentUsage = 0; // TODO: 実際の使用回数

  if (isUnlimited) {
    return (
      <span className={`text-xs text-green-600 font-medium ${className}`}>
        <i className="ri-infinite-line mr-1"></i>
        AI無制限
      </span>
    );
  }

  const remaining = Math.max(0, aiLimit - currentUsage);
  const isLow = remaining <= 2;

  return (
    <span
      className={`text-xs font-medium ${
        isLow ? "text-orange-600" : "text-blue-600"
      } ${className}`}
    >
      <i className="ri-ai-generate mr-1"></i>
      AI: {remaining}/{aiLimit}回
    </span>
  );
}
