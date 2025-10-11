'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center mb-8">
          <Link
            href="/settings"
            className="mr-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">プライバシーポリシー</h1>
        </div>

        {/* プライバシーポリシー内容 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <p className="text-sm text-gray-500 mb-6">最終更新日: 2024年12月1日</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. 基本方針</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                宅建学習アプリ運営者（以下「当社」といいます。）は、本ウェブサイト上で提供するサービス（以下「本サービス」といいます。）における、
                ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. 収集する情報</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当社は、本サービスの提供にあたり、以下の情報を収集いたします。
              </p>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 ユーザーが提供する情報</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>メールアドレス</li>
                <li>ユーザー名</li>
                <li>プロフィール情報（任意で提供されるもの）</li>
                <li>お問い合わせ内容</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 自動的に収集される情報</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>学習履歴（問題の解答状況、学習時間、進捗状況等）</li>
                <li>アプリの利用状況（アクセス日時、利用機能等）</li>
                <li>デバイス情報（OS、ブラウザ、画面解像度等）</li>
                <li>IPアドレス</li>
                <li>Cookie情報</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">2.3 AI機能に関する情報</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>AI教師機能への質問内容</li>
                <li>AI機能の利用履歴</li>
                <li>学習パターンの分析データ</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. 利用目的</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当社は、収集した個人情報を以下の目的で利用いたします。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>本サービスの提供・運営のため</li>
                <li>ユーザーの本人確認のため</li>
                <li>学習進捗の管理・分析のため</li>
                <li>個別の学習計画の提案のため</li>
                <li>AI機能による個別指導の提供のため</li>
                <li>サービスの改善・新機能開発のため</li>
                <li>ユーザーサポートのため</li>
                <li>重要なお知らせの配信のため</li>
                <li>利用規約違反の対応のため</li>
                <li>サービス利用状況の分析のため</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. 安全管理措置</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当社は、個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>SSL/TLS暗号化通信の使用</li>
                <li>Firebase Authentication による安全な認証</li>
                <li>Firestore による安全なデータベース管理</li>
                <li>定期的なセキュリティ監査の実施</li>
                <li>アクセス権限の適切な管理</li>
                <li>従業員への個人情報保護教育の実施</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. 第三者への提供</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当社は、以下の場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. 外部サービスの利用</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本サービスでは、以下の外部サービスを利用しており、これらのサービスにおいても個人情報が処理される場合があります。
              </p>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">6.1 Google Firebase</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                ユーザー認証、データベース、分析機能のためにGoogle Firebaseを利用しています。
                詳細は<a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Googleプライバシーポリシー</a>をご確認ください。
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">6.2 AI サービス</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                AI教師機能の提供のため、外部のAIサービスを利用しています。
                ユーザーの質問内容は、回答生成のためにAIサービスに送信されますが、個人を特定できる情報は含まれません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. 個人情報の開示</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。
                ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、
                開示しない決定をした場合には、その旨を遅滞なく通知します。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
                <li>当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                <li>その他法令に違反することとなる場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. 個人情報の訂正および削除</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には、
                当社が定める手続きにより、当社に対して個人情報の訂正、追加または削除（以下「訂正等」といいます。）を請求することができます。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                当社は、ユーザーから前項の請求を受けてその請求に理由があると判断した場合には、
                遅滞なく、当該個人情報の訂正等を行うものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. 個人情報の利用停止等</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当社は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、
                または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下「利用停止等」といいます。）を求められた場合には、
                遅滞なく必要な調査を行います。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                前項の調査結果に基づき、その請求に理由があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Cookie（クッキー）について</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本サービスは、ユーザーの利便性向上のためCookieを使用することがあります。
                Cookieを使用することにより収集した情報については、個人情報に関わらない統計情報として利用します。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                ユーザーは、ブラウザの設定によりCookieの受け取りを拒否することができますが、
                その場合本サービスの一部機能をご利用いただけない場合があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. アクセス解析ツール</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本サービスでは、サービス向上のためにアクセス解析ツールを使用しています。
                これらのツールはCookieを使用してユーザーの行動を分析しますが、個人を特定する情報は収集しません。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                収集されたデータは、サービスの利用状況の把握、機能改善、ユーザー体験の向上のために使用されます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. 学習データの取扱い</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ユーザーの学習履歴、問題の解答状況、学習時間等の学習データは、以下の目的で利用されます。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>個別の学習計画の作成・提案</li>
                <li>弱点分析と克服支援</li>
                <li>学習進捗の可視化</li>
                <li>AI教師機能による個別指導</li>
                <li>サービス全体の品質向上（統計的な分析のみ）</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                学習データは暗号化されて安全に保存され、ユーザー個人を特定できない形で統計分析に利用される場合があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. データの保存期間</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                当社は、収集した個人情報を以下の期間保存します。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>アカウント情報：アカウント削除まで</li>
                <li>学習履歴：アカウント削除から1年間（統計分析用の匿名化データは除く）</li>
                <li>お問い合わせ履歴：対応完了から3年間</li>
                <li>アクセスログ：収集から1年間</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">14. 未成年者の個人情報</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                未成年者が本サービスを利用する場合は、保護者の同意を得た上でご利用ください。
                未成年者の個人情報については、特に慎重に取り扱い、必要最小限の情報のみを収集します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">15. プライバシーポリシーの変更</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                当社が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">16. お問い合わせ窓口</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>宅建学習アプリ サポート窓口</strong><br />
                  メール: <a href="mailto:privacy@takken-app.com" className="text-blue-600 hover:underline">privacy@takken-app.com</a><br />
                  受付時間: 平日 9:00-18:00（土日祝日を除く）
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">17. データポータビリティ</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ユーザーは、当社が保有する自己の学習データについて、機械可読な形式での提供を求めることができます。
                データの提供については、上記お問い合わせ窓口までご連絡ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">18. アカウント削除</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ユーザーは、いつでもアカウントを削除することができます。
                アカウント削除により、個人情報および学習データは削除されますが、
                法令により保存が義務付けられている情報については、法定期間中保存されます。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                アカウント削除をご希望の場合は、アプリ内の設定画面またはお問い合わせ窓口までご連絡ください。
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-500">
                プライバシーポリシーについてご質問がございましたら、
                <a href="mailto:privacy@takken-app.com" className="text-blue-600 hover:underline">
                  privacy@takken-app.com
                </a>
                までお問い合わせください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
