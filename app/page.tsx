"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 認証状態をチェック
    const checkAuthStatus = () => {
      try {
        const userData = localStorage.getItem("takken_user");
        if (userData) {
          // ログイン済みの場合はダッシュボードにリダイレクト
          router.push("/dashboard");
        }
      } catch (error) {
        // localStorage が利用できない場合は無視
        const err = error instanceof Error ? error : new Error(String(error));
        logger.debug("LocalStorage not available", { 
          error: err.message 
        });
      }
    };

    checkAuthStatus();
  }, [router]);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="nav-minimal">
        <div className="container-minimal">
          <div className="flex items-center justify-center h-16 px-4">
            <h1 className="text-xl font-medium">宅建合格ロード</h1>
          </div>
        </div>
      </header>

      <main className="container-minimal px-4 py-12">
        <div className="section-minimal max-w-2xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <div className="text-6xl mb-8 fade-in">🏠</div>
            <h2
              className="text-2xl font-medium mb-4 fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              宅建合格への道のりを始めよう
            </h2>
            <p
              className="text-minimal max-w-md mx-auto fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              AI先生と一緒に楽しく宅建試験に合格しよう
            </p>
          </section>

          {/* 重要：審査用 - 法的ページへの明確なアクセス */}
          <section className="mb-16 fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="bg-purple-50 rounded-lg p-6 mb-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <i className="ri-information-line text-purple-600"></i>
                サービスに関する重要な情報
              </h3>
              <p className="text-sm text-gray-600">
                ご利用前に必ずご確認ください
              </p>
            </div>

            <div className="grid gap-3">
              <Link
                href="/legal"
                className="bg-white rounded-lg p-4 border-2 border-purple-300 hover:border-purple-400 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-article-line text-xl text-purple-600"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        特定商取引法に基づく表記
                      </p>
                      <p className="text-xs text-gray-600">
                        販売事業者情報・料金・返品規定等
                      </p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                </div>
              </Link>

              <Link
                href="/terms"
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-file-text-line text-xl text-gray-600"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">利用規約</p>
                      <p className="text-xs text-gray-600">
                        サービス利用に関する規約
                      </p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                </div>
              </Link>

              <Link
                href="/privacy"
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-shield-check-line text-xl text-gray-600"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        プライバシーポリシー
                      </p>
                      <p className="text-xs text-gray-600">
                        個人情報の取り扱いについて
                      </p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                </div>
              </Link>

              <Link
                href="/support"
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-customer-service-line text-xl text-gray-600"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">サポート</p>
                      <p className="text-xs text-gray-600">
                        よくある質問・お問い合わせ
                      </p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                </div>
              </Link>
            </div>
          </section>

          {/* サービス概要 */}
          <section className="mb-16 fade-in" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              サービス概要
            </h3>
            <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="ri-booklet-line text-purple-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    過去問演習アプリ
                  </p>
                  <p className="text-sm text-gray-600">
                    宅地建物取引士試験の過去問題を効率的に学習できる学習支援アプリケーションです
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="ri-robot-line text-purple-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    AI学習サポート
                  </p>
                  <p className="text-sm text-gray-600">
                    AIによる解説・ヒント機能で、わからない問題もしっかり理解できます
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="ri-vip-crown-line text-purple-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    プレミアムプラン（モバイルアプリ版のみ）
                  </p>
                  <p className="text-sm text-gray-600">
                    iOS/Androidアプリで月額980円（税込）でAI機能無制限、広告非表示などの特典をご利用いただけます
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ※Web版は無料でご利用いただけます
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* アプリへのアクセス */}
          <section
            className="text-center fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                学習を始めるには、アプリにログインしてください
              </p>
              <div className="space-y-3">
                <Link href="/auth/register">
                  <button className="w-full button-minimal py-3 text-base">
                    新規登録
                  </button>
                </Link>
                <Link href="/auth/login">
                  <button className="w-full button-ghost py-3 text-base">
                    ログイン
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="section-minimal border-t border-border mt-16">
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/legal"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              特定商取引法に基づく表記
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/support"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              サポート
            </Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              お問い合わせ:{" "}
              <a
                href="mailto:admin@takaapps.com"
                className="text-purple-600 hover:underline"
              >
                admin@takaapps.com
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 宅建合格ロード. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
