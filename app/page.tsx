"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Firebase認証状態を監視（クライアントサイドのみ）
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        // タイムアウトを設定して無限ローディングを防ぐ
        const timeoutId = setTimeout(() => {
          console.warn("Firebase auth initialization timeout");
          setLoading(false);
          setAuthError(
            "認証の初期化に時間がかかっています。ページを再読み込みしてください。"
          );
        }, 10000); // 10秒でタイムアウト

        const { onAuthStateChanged } = await import("firebase/auth");
        const { initializeFirebase } = await import("../lib/firebase-client");
        const { firestoreService } = await import("../lib/firestore-service");
        const { auth } = initializeFirebase();

        clearTimeout(timeoutId);

        unsubscribe = onAuthStateChanged(
          auth,
          async (firebaseUser) => {
            try {
              if (firebaseUser) {
                // Firestoreからユーザープロファイルを取得
                const userProfile = await firestoreService.getUserProfile(
                  firebaseUser.uid
                );
                setUser(userProfile);
              } else {
                setUser(null);
              }
            } catch (error) {
              console.error("Error loading user profile:", error);
              // プロファイル取得エラーでもログイン状態は維持
              setUser({
                id: firebaseUser?.uid,
                name: firebaseUser?.displayName || "ユーザー",
              });
            }
            setLoading(false);
            setAuthError(null);
          },
          (error) => {
            console.error("Auth state change error:", error);
            setLoading(false);
            setAuthError(
              "認証エラーが発生しました。ログインページから再試行してください。"
            );
          }
        );
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
        setAuthError(
          "Firebaseの初期化に失敗しました。インターネット接続を確認してください。"
        );
      }
    };

    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      initAuth();
    } else {
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <div className="text-muted-foreground">
            宅建合格ロードを読み込み中...
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            初回アクセス時は時間がかかる場合があります
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-muted-foreground mb-4">{authError}</div>
          <div className="space-y-2">
            <Link href="/auth/login">
              <button className="w-full button-minimal py-3 text-sm">
                ログインページへ
              </button>
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="w-full button-ghost py-3 text-sm"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - TSDO inspired minimal navigation */}
      <header className="nav-minimal">
        <div className="container-minimal">
          <div className="flex items-center justify-center h-16 px-4">
            <h1 className="text-xl font-medium">宅建合格ロード</h1>
          </div>
        </div>
      </header>

      <main className="container-minimal px-4">
        {!user ? (
          // 未ログイン状態 - TSDO inspired minimal design
          <div className="section-minimal">
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

            {/* Action Buttons */}
            <section
              className="space-y-4 mb-16 fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <Link href="/auth/register">
                <button className="w-full button-minimal py-4 text-base">
                  新規登録して始める
                </button>
              </Link>

              <Link href="/auth/login">
                <button className="w-full button-ghost py-4 text-base">
                  ログイン
                </button>
              </Link>
            </section>
          </div>
        ) : (
          // ログイン済み状態 - TSDO inspired minimal design
          <div className="section-minimal">
            <div className="text-center">
              <div className="text-6xl mb-6 fade-in">👋</div>
              <h2
                className="text-xl font-medium mb-8 fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                おかえりなさい、{user.name}さん
              </h2>
              <Link href="/dashboard">
                <button
                  className="button-minimal py-4 px-8 text-base fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  学習を続ける
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="section-minimal border-t border-border mt-16">
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <Link
              href="/legal"
              className="text-muted-foreground hover:text-foreground transition-colors"
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
          <p className="text-xs text-muted-foreground">
            © 宅建合格ロード. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
