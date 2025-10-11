import Link from "next/link";

export default function LegalPage() {
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
              特定商取引法に基づく表記
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6 text-sm text-gray-700">
            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                販売事業者名
              </h2>
              <p>【要入力：正式な事業者名または個人事業主名】</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                運営統括責任者
              </h2>
              <p>【要入力：責任者名】</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                所在地
              </h2>
              <p>【要入力：郵便番号・住所】</p>
              <p className="text-xs text-gray-500 mt-1">
                ※請求があれば遅滞なく開示いたします
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                電話番号
              </h2>
              <p>【要入力：連絡可能な電話番号】</p>
              <p className="text-xs text-gray-500 mt-1">
                ※お問い合わせはメールでのご連絡をお願いいたします
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                メールアドレス
              </h2>
              <p>
                <a
                  href="mailto:support@takkenroad.app"
                  className="text-purple-600 hover:underline"
                >
                  support@takkenroad.app
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                ホームページ
              </h2>
              <p>
                <a
                  href="https://takkenroad.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  https://takkenroad.app
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                販売価格
              </h2>
              <div className="space-y-2">
                <p>■ プレミアムプラン：月額500円（税込）</p>
                <p className="text-xs text-gray-600 ml-4">
                  ※初回登録時は7日間無料トライアル
                </p>
                <p className="text-xs text-gray-600 ml-4">
                  ※価格は変更される場合があります。最新価格はアプリ内の料金ページでご確認ください
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                商品代金以外の必要料金
              </h2>
              <p>
                インターネット接続料金、通信料金等は、お客様のご負担となります。
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                支払方法
              </h2>
              <div className="space-y-1">
                <p>以下のお支払い方法をご利用いただけます：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    クレジットカード（Visa、Mastercard、American Express等）
                  </li>
                  <li>デビットカード</li>
                  <li>Apple Pay（iOS版アプリ）</li>
                  <li>Google Pay（Android版アプリ）</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  ※決済はStripeを通じて安全に処理されます
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                支払時期
              </h2>
              <p>
                サブスクリプション登録時に初回決済が行われ、以降は毎月の更新日に自動的に決済されます。
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                商品等の引き渡し時期
              </h2>
              <p>
                決済完了後、即座にサービスをご利用いただけます。プレミアム機能は決済確認後すぐにアクティブになります。
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                返品・キャンセルについて
              </h2>
              <div className="space-y-2">
                <p className="font-medium">■ サブスクリプションの解約</p>
                <p className="ml-4">
                  お客様はいつでもサブスクリプションを解約できます。解約後も現在の契約期間が終了するまでプレミアム機能をご利用いただけます。
                </p>

                <p className="font-medium mt-3">■ 返金について</p>
                <p className="ml-4">
                  デジタルコンテンツの性質上、原則として返金には応じかねます。ただし、以下の場合は個別に対応いたします：
                </p>
                <ul className="list-disc list-inside ml-8 space-y-1 text-xs">
                  <li>サービスに重大な不具合がある場合</li>
                  <li>誤って複数回決済してしまった場合</li>
                  <li>その他、当方が認めた正当な理由がある場合</li>
                </ul>

                <p className="font-medium mt-3">
                  ■ 無料トライアル期間中のキャンセル
                </p>
                <p className="ml-4">
                  無料トライアル期間中（初回登録から7日間）にキャンセルされた場合、料金は一切発生しません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                サービス提供エリア
              </h2>
              <p>日本国内</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                動作環境
              </h2>
              <div className="space-y-1">
                <p>■ iOS版：iOS 14.0以降</p>
                <p>■ Android版：Android 8.0以降</p>
                <p>
                  ■ Webブラウザ版：Chrome、Safari、Firefox、Edge（最新版推奨）
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                お問い合わせ
              </h2>
              <p>
                本表記に関するご質問、または商品・サービスに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p>Email: support@takkenroad.app</p>
                <p className="text-xs text-gray-600 mt-1">
                  ※通常2営業日以内にご返信いたします
                </p>
              </div>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                関連ページ
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/terms"
                  className="text-sm text-purple-600 hover:underline"
                >
                  利用規約
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm text-purple-600 hover:underline"
                >
                  プライバシーポリシー
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
              <p className="text-xs text-gray-500">
                最終更新日: 2025年10月11日
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
          >
            <i className="ri-home-line"></i>
            <span>ダッシュボードに戻る</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
