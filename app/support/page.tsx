"use client";

import Link from "next/link";
import { useState } from "react";

export default function SupportPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const faqs = [
    {
      id: "subscription",
      question: "サブスクリプションについて",
      items: [
        {
          q: "Web版で課金できますか？",
          a: "はい、Web版でもStripe経由でプレミアムプランにご登録いただけます。クレジットカードまたはデビットカードで安全に決済いただけます。モバイルアプリ版（iOS/Android）では、App StoreまたはGoogle Playから決済できます。",
        },
        {
          q: "プレミアムプランの料金は？",
          a: "月額980円（税込）です。詳細な価格はApp StoreまたはGoogle Playでご確認ください。無料トライアル期間が提供される場合があります。",
        },
        {
          q: "無料版との違いは何ですか？",
          a: "プレミアムプラン（モバイルアプリ版）では、AI機能が無制限、広告非表示、全年度の過去問アクセス、詳細な学習分析などがご利用いただけます。Web版無料プランではAI機能は月5回まで、広告表示あり、機能に制限があります。",
        },
        {
          q: "解約方法を教えてください",
          a: "iOS版：iPhoneの設定 → [あなたの名前] → サブスクリプション から「宅建合格ロード」を選択し解約。Android版：Google Play → メニュー → 定期購入 から「宅建合格ロード」を選択し解約してください。",
        },
        {
          q: "解約後はどうなりますか？",
          a: "現在の契約期間が終了するまでプレミアム機能をご利用いただけます。契約期間終了後は自動的に無料版に切り替わります。Web版では引き続き無料機能をご利用いただけます。",
        },
      ],
    },
    {
      id: "usage",
      question: "使い方について",
      items: [
        {
          q: "過去問はどのくらい収録されていますか？",
          a: "過去7年分（令和3年〜令和8年度）の本試験問題を収録しています。無料版では直近2年分のみご利用いただけます。プレミアムプランでは10年分以上にアクセスできます。",
        },
        {
          q: "オフラインでも使えますか？",
          a: "はい、一度オンラインで問題を読み込めば、オフラインでも学習できます。ただし、AI機能はインターネット接続が必要です。",
        },
        {
          q: "AI先生に質問できる回数は？",
          a: "Web版無料プランは月5回まで、モバイルアプリ版のプレミアムプランでは無制限です。質問回数は毎月1日にリセットされます。",
        },
        {
          q: "学習データは引き継げますか？",
          a: "はい、Firebaseアカウントでログインしていれば、複数のデバイス間でデータを同期できます。",
        },
      ],
    },
    {
      id: "technical",
      question: "技術的な問題",
      items: [
        {
          q: "アプリが起動しません",
          a: "以下をお試しください：1) アプリを完全に終了して再起動、2) iOSを最新版にアップデート、3) アプリを再インストール。それでも解決しない場合はお問い合わせください。",
        },
        {
          q: "AI先生が応答しません",
          a: "インターネット接続を確認してください。また、サーバーメンテナンス中の可能性もあります。しばらく待ってから再度お試しください。",
        },
        {
          q: "購入が反映されません（モバイルアプリ版）",
          a: "モバイルアプリ版の設定画面から「購入の復元」ボタンをタップしてください。それでも解決しない場合は、AppleまたはGoogleのサポート、または当サポートにレシートを添えてお問い合わせください。",
        },
        {
          q: "アカウントを削除したい",
          a: "設定画面から「アカウント削除」を選択できます。削除すると学習データも完全に削除されますのでご注意ください。",
        },
      ],
    },
    {
      id: "exam",
      question: "宅建試験について",
      items: [
        {
          q: "宅建試験の試験日はいつですか？",
          a: "例年10月の第3日曜日に実施されます。最新の試験情報は一般財団法人不動産適正取引推進機構のウェブサイトでご確認ください。",
        },
        {
          q: "合格点は何点ですか？",
          a: "50点満点中、例年31〜37点が合格ラインです。年度によって変動しますが、35点前後を目安に学習することをおすすめします。",
        },
        {
          q: "このアプリだけで合格できますか？",
          a: "過去問演習は非常に重要ですが、基本的な知識の習得にはテキストの併用をおすすめします。当アプリは過去問演習と弱点克服に特化しています。",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">サポート</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Introduction */}
        <section className="bg-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-customer-service-line text-2xl text-purple-600"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                お困りですか？
              </h2>
              <p className="text-sm text-gray-600">
                よくある質問をご確認ください。解決しない場合は、下部のお問い合わせフォームからご連絡ください。
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            クイックリンク
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/privacy"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors"
            >
              <i className="ri-shield-check-line text-xl text-purple-600 mb-2"></i>
              <p className="text-sm font-medium text-gray-900">
                プライバシーポリシー
              </p>
            </Link>
            <Link
              href="/terms"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors"
            >
              <i className="ri-file-text-line text-xl text-purple-600 mb-2"></i>
              <p className="text-sm font-medium text-gray-900">利用規約</p>
            </Link>
            <Link
              href="/legal"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors"
            >
              <i className="ri-article-line text-xl text-purple-600 mb-2"></i>
              <p className="text-sm font-medium text-gray-900">
                特定商取引法に基づく表記
              </p>
            </Link>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            よくある質問
          </h3>
          <div className="space-y-3">
            {faqs.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setActiveSection(
                      activeSection === section.id ? null : section.id
                    )
                  }
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    {section.question}
                  </span>
                  <i
                    className={`ri-arrow-down-s-line text-xl text-gray-600 transition-transform ${
                      activeSection === section.id ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>

                {activeSection === section.id && (
                  <div className="border-t border-gray-200 px-4 py-3 space-y-4">
                    {section.items.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">
                          Q. {item.q}
                        </p>
                        <p className="text-sm text-gray-600 pl-4">
                          A. {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            お問い合わせ
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            上記で解決しない場合は、以下のメールアドレスまでお問い合わせください。
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <i className="ri-mail-line text-xl text-purple-600"></i>
              <a
                href="mailto:admin@takaapps.com"
                className="text-sm text-purple-600 hover:underline"
              >
                admin@takaapps.com
              </a>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>【お問い合わせの際にご記載いただきたい情報】</p>
            <ul className="list-disc list-inside pl-2">
              <li>お使いのデバイス（例: iPhone 15 Pro）</li>
              <li>iOSバージョン（例: iOS 17.1）</li>
              <li>アプリのバージョン（設定画面で確認可能）</li>
              <li>発生している問題の詳細</li>
              <li>エラーメッセージ（表示されている場合）</li>
            </ul>
          </div>
        </section>

        {/* System Status */}
        <section className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            サーバー状態:{" "}
            <span className="text-green-600 font-medium">正常稼働中</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            最終更新: {new Date().toLocaleDateString("ja-JP")}
          </p>
        </section>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
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
