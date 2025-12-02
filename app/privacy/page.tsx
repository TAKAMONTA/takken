import Link from "next/link";

export default function PrivacyPage() {
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
              プライバシーポリシー
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6 text-sm text-gray-700">
            <section>
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                1. 個人情報の収集について
              </h2>
              <p>
                当アプリ「宅建合格ロード」では、ユーザーの学習進捗を記録し、より良い学習体験を提供するために以下の情報を収集・保存します：
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>学習進捗データ（正答率、学習時間、苦手分野など）</li>
                <li>ユーザー設定（通知設定、学習目標など）</li>
                <li>デバイス情報（ブラウザ情報、画面サイズなど）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                2. 広告配信について
              </h2>
              <p>
                当アプリでは、Google
                AdSenseを使用して広告を配信しています。Google
                AdSenseは、ユーザーの興味に基づいた広告を表示するために、以下の情報を使用する場合があります：
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Cookie情報</li>
                <li>IPアドレス</li>
                <li>デバイス情報</li>
                <li>閲覧履歴</li>
              </ul>
              <p className="mt-2">
                広告の配信停止やCookieの管理については、
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google広告ポリシー
                </a>
                をご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                3. データの保存と管理
              </h2>
              <p>収集したデータは以下の方法で安全に管理されます：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  Firebase（Google Cloud Platform）を使用した安全なデータ保存
                </li>
                <li>暗号化による通信の保護</li>
                <li>アクセス制限による不正アクセスの防止</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                4. データの利用目的
              </h2>
              <p>収集したデータは以下の目的でのみ使用されます：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>学習進捗の記録と分析</li>
                <li>個人に最適化された学習プランの提供</li>
                <li>アプリの機能改善と新機能の開発</li>
                <li>ユーザーサポートの提供</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                5. データの共有
              </h2>
              <p>
                当アプリは、以下の場合を除き、ユーザーの個人情報を第三者と共有することはありません：
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>ユーザーの明示的な同意がある場合</li>
                <li>法的な要請がある場合</li>
                <li>
                  サービス提供に必要な範囲での信頼できるパートナーとの共有
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                6. ユーザーの権利
              </h2>
              <p>ユーザーは以下の権利を有します：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>個人情報の開示請求</li>
                <li>個人情報の訂正・削除請求</li>
                <li>データ処理の停止請求</li>
                <li>データのポータビリティ（移行）請求</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                7. Cookieの使用
              </h2>
              <p>
                当アプリでは、ユーザー体験の向上と広告配信のためにCookieを使用します。Cookieの設定は、ブラウザの設定から変更できます。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                8. プライバシーポリシーの変更
              </h2>
              <p>
                本プライバシーポリシーは、必要に応じて更新される場合があります。重要な変更がある場合は、アプリ内で通知いたします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-gray-900">
                9. お問い合わせ
              </h2>
              <p>
                プライバシーポリシーに関するご質問やご要望がございましたら、以下の方法でお問い合わせください：
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">宅建合格ロード サポート</p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:admin@takaapps.com"
                    className="text-purple-600 hover:underline"
                  >
                    admin@takaapps.com
                  </a>
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  住所: 〒900-0015 沖縄県那覇市久茂地3丁目26-32 YSCビル202
                  <br />
                  ※バーチャルオフィス契約による連絡先
                </p>
              </div>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                関連ページ
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/legal"
                  className="text-sm text-purple-600 hover:underline"
                >
                  特定商取引法に基づく表記
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-purple-600 hover:underline"
                >
                  利用規約
                </Link>
                <Link
                  href="/support"
                  className="text-sm text-purple-600 hover:underline"
                >
                  サポート
                </Link>
              </div>
            </section>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">最終更新日: 2025年1月15日</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
