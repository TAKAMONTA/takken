"use client";

import Link from "next/link";
import { useIsIOSApp } from "@/lib/use-is-ios-app";
import { getAppPublicBaseUrl } from "@/lib/app-public-base-url";
import { PLAN_CONFIGS, SubscriptionPlan } from "@/lib/types/subscription";

export default function SubscriptionPage() {
  const isIOSApp = useIsIOSApp();
  const freeConfig = PLAN_CONFIGS[SubscriptionPlan.FREE];
  const premiumConfig = PLAN_CONFIGS[SubscriptionPlan.PREMIUM];
  const monthlyPrice = premiumConfig.price.toLocaleString();
  const yearlyPrice = premiumConfig.yearlyPrice?.toLocaleString();
  const publicBase = getAppPublicBaseUrl();
  const termsUrl = `${publicBase}/settings/terms`;
  const privacyUrl = `${publicBase}/settings/privacy`;
  const appleEulaUrl =
    "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">
              プレミアムプラン
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Important Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-start">
            <i className="ri-information-line text-blue-500 text-xl mr-3 mt-0.5"></i>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                プレミアムプランについて
              </h3>
              <p className="text-sm text-blue-800">
                プレミアムプランは
                <strong>Web版・iOSアプリ</strong>
                でご利用いただけます。
                <br />
                {isIOSApp
                  ? "iOSアプリではApp Storeのアプリ内課金で安全に決済できます。"
                  : "Web版ではStripe経由で安全に決済できます。"}
              </p>
            </div>
          </div>
        </div>

        {/* Current Status - Web Version */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            現在のプラン
          </h2>

          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-global-line text-2xl text-gray-600"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Web版（無料）
            </h3>
            <p className="text-gray-600 mb-4">基本機能をご利用いただけます</p>
            <div className="text-sm text-gray-500">
              AI機能: 月{freeConfig.features.aiExplanationLimit}回まで / AI予想問題: {freeConfig.features.questionLimit}問まで / 広告表示あり
            </div>
          </div>
        </div>

        {/* Premium Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-vip-crown-line text-purple-600"></i>
            プレミアムプランの機能
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-purple-100">
                <i className="ri-check-line text-sm text-purple-600"></i>
              </div>
              <span className="text-sm text-gray-900">AI機能 無制限</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-purple-100">
                <i className="ri-check-line text-sm text-purple-600"></i>
              </div>
              <span className="text-sm text-gray-900">広告非表示</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-purple-100">
                <i className="ri-check-line text-sm text-purple-600"></i>
              </div>
              <span className="text-sm text-gray-900">無制限のAI予想問題</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-purple-100">
                <i className="ri-check-line text-sm text-purple-600"></i>
              </div>
              <span className="text-sm text-gray-900">高度な分析機能</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-purple-100">
                <i className="ri-check-line text-sm text-purple-600"></i>
              </div>
              <span className="text-sm text-gray-900">模擬試験機能</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-purple-100">
                <i className="ri-check-line text-sm text-purple-600"></i>
              </div>
              <span className="text-sm text-gray-900">カスタム学習プラン</span>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-purple-900 font-medium mb-1">
              月額 {monthlyPrice}円（税込）
            </p>
            <p className="text-xs text-purple-700 mb-2">
              {yearlyPrice
                ? `年額 ${yearlyPrice}円（税込）も選択できます`
                : "Web版・iOSアプリでご利用いただけます"}
            </p>
            <Link
              href="/subscription/pricing"
              className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
            >
              料金プラン詳細を見る
            </Link>
          </div>

          {/* Guideline 3.1.2(c): アプリ内でのサブスク情報・法的情報リンク */}
          <div className="mt-4 pt-4 border-t border-purple-200 space-y-2 text-xs text-purple-900">
            <p className="font-semibold text-sm text-purple-950">
              自動更新サブスクリプション
            </p>
            <ul className="list-disc list-inside space-y-1 text-purple-800">
              <li>名称: プレミアム（月額 / 年額 ※アプリ内表示）</li>
              <li>期間: 1か月 / 1年</li>
              <li>
                価格: 月額 {monthlyPrice}円
                {yearlyPrice ? ` / 年額 ${yearlyPrice}円` : ""}
                （税込、最終価格は登録時の決済画面で確認できます）
              </li>
            </ul>
            <p className="flex flex-wrap gap-x-3 gap-y-1">
              <a
                href={termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 underline font-medium"
              >
                利用規約
              </a>
              <a
                href={privacyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 underline font-medium"
              >
                プライバシーポリシー
              </a>
              <a
                href={appleEulaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 underline font-medium"
              >
                Apple 標準利用規約（EULA）
              </a>
            </p>
          </div>
        </div>

        {/* How to Subscribe */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            プレミアムプランのご利用方法
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  モバイルアプリをダウンロード
                </p>
                <p className="text-xs text-gray-600">
                  App Store（iOS）から「宅建合格ロード」をダウンロード
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  同じアカウントでログイン
                </p>
                <p className="text-xs text-gray-600">
                  現在のアカウント情報でログインすると、学習データが自動的に同期されます
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  プレミアムプランに登録
                </p>
                <p className="text-xs text-gray-600">
                  アプリ内のサブスクリプション画面から登録できます
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* App Links */}
        <div className="space-y-3">
          <a
            href="https://apps.apple.com/app/takken-road"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-black text-white py-4 px-6 rounded-lg font-medium text-center hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <i className="ri-apple-fill text-2xl"></i>
              <span>App Storeからダウンロード</span>
            </div>
          </a>
        </div>

        {/* FAQ */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 mb-2">
            よくあるご質問やお問い合わせは
          </p>
          <Link
            href="/support"
            className="text-sm text-purple-600 hover:underline"
          >
            サポートページ
          </Link>
          <span className="text-xs text-gray-500"> をご覧ください</span>
        </div>
      </main>
    </div>
  );
}
