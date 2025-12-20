"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { SubscriptionPlan, PLAN_CONFIGS } from "@/lib/types/subscription";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { subscription, isLoading, createCheckoutSession } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedYearly, setSelectedYearly] = useState(false);
  const router = useRouter();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    console.log("[Pricing] 登録ボタンクリック", { plan, selectedYearly });
    
    if (plan === SubscriptionPlan.FREE) {
      console.log("[Pricing] 無料プランはスキップ");
      return;
    }

    console.log("[Pricing] 処理開始");
    console.log("[Pricing] createCheckoutSession関数:", typeof createCheckoutSession);
    console.log("[Pricing] subscription:", subscription);
    console.log("[Pricing] error:", error);
    setIsProcessing(true);
    try {
      console.log("[Pricing] createCheckoutSession呼び出し直前");
      const checkoutUrl = await createCheckoutSession(plan, selectedYearly);
      console.log("[Pricing] createCheckoutSession完了", { 
        hasUrl: !!checkoutUrl, 
        urlType: typeof checkoutUrl,
        url: checkoutUrl ? checkoutUrl.substring(0, 50) + "..." : "null"
      });
      
      if (checkoutUrl) {
        console.log("[Pricing] Checkoutページにリダイレクト");
        window.location.href = checkoutUrl;
      } else {
        // より詳細なエラーメッセージを表示
        console.error("[Pricing] Checkoutセッション作成失敗: URLがnull");
        const errorDetails = error || subscription?.error || "不明なエラー";
        alert(`決済セッションの作成に失敗しました。\n\nエラー詳細: ${errorDetails}\n\n考えられる原因:\n- ログインが必要です\n- サーバー側でエラーが発生しました\n\nVercelのログで詳細を確認してください。`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[Pricing] エラー発生:", error);
      alert(`エラーが発生しました: ${error.message}\n\n詳細情報がコンソールに表示されています。`);
    } finally {
      console.log("[Pricing] 処理完了");
      setIsProcessing(false);
    }
  };

  const currentPlan = subscription?.plan || SubscriptionPlan.FREE;
  const premiumConfig = PLAN_CONFIGS[SubscriptionPlan.PREMIUM];
  const freeConfig = PLAN_CONFIGS[SubscriptionPlan.FREE];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 mr-4 transition-colors"
              aria-label="ホームに戻る"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className="text-lg font-medium text-gray-900">プレミアムプラン</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* タイトルセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            プレミアムプランで学習効果を最大化
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            AI機能と高度な分析で、効率的に宅建試験に合格しよう
          </p>
        </div>

        {/* 月額/年額切り替え */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm inline-flex">
            <button
              onClick={() => setSelectedYearly(false)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                !selectedYearly
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              月額
            </button>
            <button
              onClick={() => setSelectedYearly(true)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedYearly
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              年額
              {premiumConfig.yearlyPrice && (
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                  お得
                </span>
              )}
            </button>
          </div>
        </div>

        {/* プランカード */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 無料プラン */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                <i className="ri-global-line text-2xl text-gray-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {freeConfig.name}
              </h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">¥0</div>
              <p className="text-gray-600 mb-8">永久無料</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                過去問演習（{freeConfig.features.questionLimit === -1 ? "無制限" : `${freeConfig.features.questionLimit}問まで`}）
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                AI解説（{freeConfig.features.aiExplanationLimit === -1 ? "無制限" : `月${freeConfig.features.aiExplanationLimit}回まで`}）
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                過去問: 直近{freeConfig.features.pastExamYears}年分
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                基本的な進捗管理
              </li>
              <li className="flex items-center text-gray-400">
                <svg
                  className="w-5 h-5 text-gray-300 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                広告表示あり
              </li>
            </ul>

            <button
              className={`w-full py-3 px-6 rounded-lg font-medium ${
                currentPlan === SubscriptionPlan.FREE
                  ? "bg-gray-500 text-white cursor-not-allowed"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              disabled={currentPlan === SubscriptionPlan.FREE}
            >
              {currentPlan === SubscriptionPlan.FREE ? "現在のプラン" : "ダウングレード"}
            </button>
          </div>

          {/* プレミアムプラン */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-purple-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                おすすめ
              </span>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <i className="ri-vip-crown-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {premiumConfig.name}
              </h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ¥{selectedYearly && premiumConfig.yearlyPrice ? premiumConfig.yearlyPrice.toLocaleString() : premiumConfig.price.toLocaleString()}
              </div>
              <p className="text-gray-600 mb-2">
                {selectedYearly ? "年額" : "月額"}（税込）
              </p>
              {selectedYearly && premiumConfig.yearlyPrice && (
                <p className="text-sm text-green-600 mb-8">
                  月額換算 ¥{Math.floor(premiumConfig.yearlyPrice / 12).toLocaleString()}（{Math.floor((1 - premiumConfig.yearlyPrice / (premiumConfig.price * 12)) * 100)}% お得）
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {Object.entries(premiumConfig.features).map(([key, value]) => {
                if (key === "questionLimit" || key === "aiExplanationLimit" || key === "pastExamYears") {
                  return null; // 数値型の機能は個別に表示
                }
                const hasFeature = value === true || value === -1 || (typeof value === "number" && value > 0);
                if (!hasFeature) return null;

                const featureNames: Record<string, string> = {
                  advancedAnalytics: "高度な分析機能",
                  successPatternAnalysis: "合格者パターン分析",
                  spacedRepetition: "スペーシング復習",
                  adFree: "広告非表示",
                  offlineQuestions: "オフライン問題",
                  customStudyPlans: "カスタム学習プラン",
                };

                return (
                  <li key={key} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {featureNames[key] || key}
                  </li>
                );
              })}
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                無制限の過去問演習
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                無制限のAI解説
              </li>
            </ul>

            <button
              onClick={() => handleSubscribe(SubscriptionPlan.PREMIUM)}
              disabled={isProcessing || isLoading || currentPlan === SubscriptionPlan.PREMIUM}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                currentPlan === SubscriptionPlan.PREMIUM
                  ? "bg-gray-500 text-white cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {isProcessing
                ? "処理中..."
                : currentPlan === SubscriptionPlan.PREMIUM
                ? "現在のプラン"
                : `${selectedYearly ? "年額" : "月額"}プランに登録`}
            </button>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            よくある質問
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Web版でも課金できますか？
              </h3>
              <p className="text-gray-600">
                はい、Web版でもStripe経由で安全に決済いただけます。クレジットカードまたはデビットカードでお支払いいただけます。
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                いつでもキャンセルできますか？
              </h3>
              <p className="text-gray-600">
                はい、いつでもキャンセル可能です。キャンセル後も現在の支払い期間終了までプレミアム機能をご利用いただけます。
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                返金はできますか？
              </h3>
              <p className="text-gray-600">
                初回購入後7日以内であれば、返金に応じます。お問い合わせページからご連絡ください。
              </p>
            </div>
          </div>
        </div>

        {/* サポートリンク */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">その他のご質問がありますか？</p>
          <Link
            href="/support"
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <i className="ri-customer-service-line"></i>
            <span>サポートページへ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
