"use client";

import React from "react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            プレミアムプランで学習効果を最大化
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI機能と高度な分析で、効率的に宅建試験に合格しよう
          </p>

          {/* 重要なお知らせ */}
          <div className="max-w-3xl mx-auto bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <div className="flex items-start">
              <i className="ri-information-line text-blue-500 text-xl mr-3 mt-0.5"></i>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  プレミアム機能について
                </h3>
                <p className="text-sm text-blue-800">
                  プレミアム機能は
                  <strong>モバイルアプリ版（iOS/Android）のみ</strong>
                  で提供しています。
                  <br />
                  決済はApp Store（Apple）およびGoogle
                  Play（Google）を通じて行われます。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* プランカード */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 無料プラン - Web版 */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                <i className="ri-global-line text-2xl text-gray-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Web版（無料）
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
                過去問演習（機能制限あり）
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
                AI解説（月5回まで）
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
              className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium cursor-not-allowed"
              disabled
            >
              現在のプラン
            </button>
          </div>

          {/* プレミアムプラン - モバイルアプリ版 */}
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
                プレミアムプラン
              </h3>
              <div className="text-sm text-purple-600 font-semibold mb-2">
                モバイルアプリ版のみ
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ¥500<span className="text-lg">程度</span>
              </div>
              <p className="text-gray-600 mb-8">月額（税込）</p>
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
                高度な分析機能
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
                優先サポート
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
                模擬試験機能
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
                広告非表示
              </li>
            </ul>

            <div className="space-y-3">
              <a
                href="https://apps.apple.com/app/takken-road"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-black text-white py-3 px-6 rounded-lg font-medium text-center hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <i className="ri-apple-fill text-xl"></i>
                  <span>App Store</span>
                </div>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=app.takkenroad"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-center hover:bg-green-700 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <i className="ri-google-play-fill text-xl"></i>
                  <span>Google Play</span>
                </div>
              </a>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              ※詳細な価格はストアでご確認ください
            </p>
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
                Web版では課金できないのですか？
              </h3>
              <p className="text-gray-600">
                現在、プレミアム機能の課金はモバイルアプリ版（iOS/Android）のみで提供しています。
                App StoreまたはGoogle Playから安全に決済いただけます。
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Web版とアプリ版でデータは共有されますか？
              </h3>
              <p className="text-gray-600">
                はい、同じアカウントでログインすれば、Web版とアプリ版で学習データが自動的に同期されます。
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                いつでもキャンセルできますか？
              </h3>
              <p className="text-gray-600">
                はい、いつでもキャンセル可能です。iOS版は「設定」→「Apple
                ID」→「サブスクリプション」から、 Android版は「Google
                Play」→「メニュー」→「定期購入」から解約できます。
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                返金はできますか？
              </h3>
              <p className="text-gray-600">
                返金については、AppleまたはGoogleの返金ポリシーに従います。
                返金をご希望の場合は、App StoreまたはGoogle
                Playのサポートに直接お問い合わせください。
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
