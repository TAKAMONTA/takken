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
        {/* 重要なお知らせ */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-start">
            <i className="ri-information-line text-blue-500 text-xl mr-3 mt-0.5"></i>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                サービス形態について
              </h3>
              <p className="text-sm text-blue-800">
                本Webサイトは<strong>無料の学習支援サービス</strong>
                として提供されています。
                <br />
                有料のプレミアム機能は
                <strong>モバイルアプリ版（iOS/Android）のみ</strong>
                で提供しており、 決済はApp Store（Apple）およびGoogle
                Play（Google）を通じて行われます。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6 text-sm text-gray-700">
            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                販売事業者名
              </h2>
              <p>個人事業主 仲井間隆行</p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                所在地
              </h2>
              <div className="space-y-1">
                <p>〒900-0015</p>
                <p>沖縄県那覇市久茂地3丁目26-32 YSCビル 202</p>
                <p className="text-xs text-gray-600 mt-2">
                  ※バーチャルオフィス契約による連絡先
                </p>
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <p className="font-medium text-yellow-800 mb-1">
                    郵送物について
                  </p>
                  <p className="text-yellow-700">
                    ※日本郵便の着払い利用時は、必ず【宛名部分】に「DMM.com内」とご記載ください。
                  </p>
                  <p className="text-yellow-700">
                    ※住所の記載箇所に「DMM.com内」と記載された場合、お受け取りできかねます。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                電話番号
              </h2>
              <p>050-1726-1564</p>
              <p className="text-xs text-gray-600 mt-1">
                ※お問い合わせはメールアドレス（admin@takaapps.com）を優先しております。
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                メールアドレス
              </h2>
              <p>
                <a
                  href="mailto:admin@takaapps.com"
                  className="text-purple-600 hover:underline"
                >
                  admin@takaapps.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                ホームページ
              </h2>
              <p>
                <a
                  href="https://takken-study.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  https://takken-study.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                サービス内容
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">■ Web版（本サイト）</p>
                  <p className="ml-4 text-gray-600">
                    宅地建物取引士試験の学習支援サービス（無料）
                  </p>
                  <ul className="list-disc list-inside ml-8 mt-1 text-xs text-gray-600">
                    <li>過去問演習（機能制限あり）</li>
                    <li>AI解説機能（月5回まで）</li>
                    <li>基本的な進捗管理</li>
                    <li>広告表示あり</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">
                    ■ モバイルアプリ版（iOS/Android）
                  </p>
                  <p className="ml-4 text-gray-600">
                    プレミアム機能を含む完全版（有料サブスクリプション）
                  </p>
                  <ul className="list-disc list-inside ml-8 mt-1 text-xs text-gray-600">
                    <li>無制限の過去問演習</li>
                    <li>無制限のAI解説機能</li>
                    <li>高度な分析・進捗管理</li>
                    <li>広告非表示</li>
                    <li>模擬試験機能</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                販売価格（モバイルアプリ版のみ）
              </h2>
              <div className="space-y-2">
                <p>■ Web版：無料</p>
                <p>
                  ■ モバイルアプリ版 プレミアムプラン：月額980円（税込）
                </p>
                <p className="text-xs text-gray-600 ml-4">
                  ■ モバイルアプリ版 プレミアムプラン（年額）：9,800円（税込、2ヶ月分お得）
                </p>
                <p className="text-xs text-gray-600 ml-4">
                  ※詳細な価格はApp StoreまたはGoogle Playでご確認ください
                </p>
                <p className="text-xs text-gray-600 ml-4">
                  ※価格は予告なく変更される場合があります
                </p>
                <p className="text-xs text-gray-600 ml-4">
                  ※無料トライアル期間が提供される場合があります
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
                支払方法（モバイルアプリ版のみ）
              </h2>
              <div className="space-y-1">
                <p>
                  モバイルアプリ版のサブスクリプション決済は以下を通じて行われます：
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>iOS版：App Store（Apple）の決済システム</li>
                  <li>Android版：Google Playの決済システム</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  ※各プラットフォームで利用可能な支払い方法（クレジットカード、デビットカード、キャリア決済等）をご利用いただけます
                </p>
                <p className="text-xs text-gray-600">
                  ※Web版では決済機能は提供しておりません
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                支払時期（モバイルアプリ版のみ）
              </h2>
              <p>
                サブスクリプション登録時に初回決済が行われ、以降は自動更新されます。
                詳細はApp StoreまたはGoogle Playの規約に従います。
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                サービス提供時期
              </h2>
              <p>
                Web版：アカウント登録後、即座に無料機能をご利用いただけます。
              </p>
              <p className="mt-1">
                モバイルアプリ版：決済完了後、即座にプレミアム機能をご利用いただけます。
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2 text-gray-900">
                返品・キャンセルについて（モバイルアプリ版のみ）
              </h2>
              <div className="space-y-2">
                <p className="ml-4">
                  モバイルアプリ版のサブスクリプションの解約・返金については、
                  App StoreまたはGoogle Playの返金ポリシーに従います。
                </p>

                <p className="font-medium mt-3">■ 解約方法</p>
                <ul className="list-disc list-inside ml-8 space-y-1 text-xs">
                  <li>iOS：設定 → Apple ID → サブスクリプション</li>
                  <li>Android：Google Play → メニュー → 定期購入</li>
                </ul>

                <p className="font-medium mt-3">■ 返金について</p>
                <p className="ml-4 text-xs">
                  返金を希望される場合は、AppleまたはGoogleのサポートに直接お問い合わせください。
                  サービス提供者側では返金処理を行うことができません。
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
                <p>■ Web版：Chrome、Safari、Firefox、Edge（最新版推奨）</p>
                <p>■ iOS版アプリ：iOS 14.0以降</p>
                <p>■ Android版アプリ：Android 8.0以降</p>
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
                <p>Email: admin@takaapps.com</p>
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
                最終更新日: 2025年1月27日
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
