"use client";

import Link from "next/link";

export default function SubscriptionPage() {
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
                プレミアム機能について
              </h3>
              <p className="text-sm text-blue-800">
                プレミアム機能は
                <strong>モバイルアプリ版（iOS/Android）のみ</strong>
                で提供しています。
                <br />
                Web版は無料でご利用いただけます。
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
              AI機能: 月5回まで / 広告表示あり
            </div>
          </div>
        </div>

        {/* Premium Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-vip-crown-line text-purple-600"></i>
            プレミアム機能（モバイルアプリ版）
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
              <span className="text-sm text-gray-900">無制限の過去問演習</span>
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
              <span className="text-sm text-gray-900">優先サポート</span>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-900 font-medium mb-1">
              月額 500円程度（税込）
            </p>
            <p className="text-xs text-purple-700">
              ※詳細な価格はApp Store/Google Playでご確認ください
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
                  App Store（iOS）またはGoogle
                  Play（Android）から「宅建合格ロード」をダウンロード
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

          <a
            href="https://play.google.com/store/apps/details?id=app.takkenroad"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium text-center hover:bg-green-700 transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <i className="ri-google-play-fill text-2xl"></i>
              <span>Google Playからダウンロード</span>
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
