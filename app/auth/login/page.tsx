"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, GoogleAuthProvider } from "firebase/auth";
import { logger } from "@/lib/logger";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 入力値検証
    if (!formData.email || !formData.password) {
      setErrors({
        general: "メールアドレスとパスワードを入力してください",
      });
      return;
    }

    // メールアドレスの基本的な形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors({
        general: "有効なメールアドレスを入力してください",
      });
      return;
    }

    // パスワードの長さチェック
    if (formData.password.length < 6) {
      setErrors({
        general: "パスワードは6文字以上で入力してください",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Dynamic import for client-side only
      const { initializeFirebaseWithFallback } = await import(
        "../../../lib/firebase-client"
      );
      const { firestoreService } = await import(
        "../../../lib/firestore-service"
      );

      const firebaseInstance = await initializeFirebaseWithFallback();

      // フォールバックモードの場合はローカルストレージ認証を使用
      if (firebaseInstance.fallback) {
        await handleLocalStorageLogin();
        return;
      }

      const { auth } = firebaseInstance;

      // Firebase認証でログイン
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );
      const user = userCredential.user;

      // ユーザーの認証状態を確認
      if (!user.emailVerified) {
        logger.warn("Email not verified for user", { userId: user.uid });
        // メール未認証でも続行（必要に応じて制限可能）
      }

      // Firestoreからユーザープロファイルを取得
      let userProfile;
      try {
        userProfile = await firestoreService.getUserProfile(user.uid);
      } catch (firestoreError) {
        const err = firestoreError instanceof Error ? firestoreError : new Error(String(firestoreError));
        logger.error("Firestore error", err, { userId: user.uid });
        // Firestoreエラーでもログインは続行
      }

      // ユーザーデータをローカルストレージに保存（サニタイズ）
      const userData = {
        id: user.uid,
        username: (
          userProfile?.name ||
          user.displayName ||
          "ユーザー"
        ).substring(0, 50),
        name: userProfile?.name || user.displayName || "ユーザー",
        email: user.email,
        joinedAt: userProfile?.joinedAt || new Date().toISOString(),
        streak: userProfile?.streak || {
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: "",
          studyDates: [],
        },
        progress: userProfile?.progress || {
          totalQuestions: 0,
          correctAnswers: 0,
          studyTimeMinutes: 0,
          categoryProgress: {},
        },
        learningRecords: userProfile?.learningRecords || [],
      };

      try {
        localStorage.setItem("takken_user", JSON.stringify(userData));
        logger.info("Firebase login successful, user data saved", {
          id: userData.id,
          name: userData.name,
          email: userData.email,
        });
      } catch (storageError) {
        const err = storageError instanceof Error ? storageError : new Error(String(storageError));
        logger.error("LocalStorage error", err, { userId: user.uid });
        // ローカルストレージエラーでもログインは続行
      }

      // ダッシュボードへ遷移
      logger.debug("Redirecting to dashboard");
      router.push("/dashboard");
    } catch (firebaseError: unknown) {
      const err = firebaseError instanceof Error ? firebaseError : new Error(String(firebaseError));
      const errorObj = err as { code?: string; message?: string };
      logger.error("Firebase login error", err);

      // Firebaseが利用できない場合は、ローカルストレージのみで動作
      if (
        errorObj.code === "auth/configuration-not-found" ||
        errorObj.code === "auth/network-request-failed" ||
        errorObj.message?.includes("Firebase configuration")
      ) {
        try {
          await handleLocalStorageLogin();
          return;
        } catch (localStorageError) {
          const localStorageErr = localStorageError instanceof Error ? localStorageError : new Error(String(localStorageError));
          logger.error("LocalStorage fallback error", localStorageErr);
        }
      }

      // Firebase固有のエラーハンドリング
      let errorMessage = "ログインに失敗しました";

      switch (errorObj.code) {
        case "auth/user-not-found":
          errorMessage = "このメールアドレスのアカウントが見つかりません";
          break;
        case "auth/wrong-password":
          errorMessage = "パスワードが間違っています";
          break;
        case "auth/invalid-email":
          errorMessage = "無効なメールアドレスです";
          break;
        case "auth/user-disabled":
          errorMessage = "このアカウントは無効化されています";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "ログイン試行回数が多すぎます。しばらく待ってから再試行してください";
          break;
        case "auth/configuration-not-found":
          errorMessage =
            "Firebaseの設定に問題があります。開発者にお問い合わせください";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "ネットワークエラーが発生しました。インターネット接続を確認してください";
          break;
        case "auth/invalid-credential":
          errorMessage = "認証情報が無効です";
          break;
        default:
          if (errorObj.message) {
            errorMessage = `エラー: ${errorObj.message}`;
          }
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // ローカルストレージ認証の処理
  const handleLocalStorageLogin = async () => {
    try {
      // ローカルストレージからユーザーを検索
      const existingUsers = JSON.parse(
        localStorage.getItem("takken_users") || "[]"
      );
      const foundUser = existingUsers.find(
        (u: any) =>
          u.email === formData.email.trim() && u.password === formData.password
      );

      if (foundUser) {
        // ユーザーデータをローカルストレージに保存（サニタイズ）
        const userData = {
          id: foundUser.id,
          username: (foundUser.username || "ユーザー").substring(0, 50),
          name: foundUser.username || "ユーザー",
          email: foundUser.email,
          joinedAt: new Date().toISOString(),
          streak: {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: "",
            studyDates: [],
          },
          progress: {
            totalQuestions: 0,
            correctAnswers: 0,
            studyTimeMinutes: 0,
            categoryProgress: {},
          },
          learningRecords: [],
        };
        localStorage.setItem("takken_user", JSON.stringify(userData));
        logger.info("LocalStorage login successful", {
          id: userData.id,
          name: userData.name,
          email: userData.email,
        });
        logger.debug("Redirecting to dashboard");
        router.push("/dashboard");
      } else {
        // 新規ユーザーを作成
        const newUser = {
          id: "user-" + Date.now(),
          username: "ユーザー",
          email: formData.email.trim(),
        };

        const userData = {
          id: newUser.id,
          username: newUser.username,
          name: newUser.username,
          email: newUser.email,
          joinedAt: new Date().toISOString(),
          streak: {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: "",
            studyDates: [],
          },
          progress: {
            totalQuestions: 0,
            correctAnswers: 0,
            studyTimeMinutes: 0,
            categoryProgress: {},
          },
          learningRecords: [],
        };

        localStorage.setItem("takken_user", JSON.stringify(userData));
        logger.info("New user created and saved", {
          id: userData.id,
          name: userData.name,
          email: userData.email,
        });

        // ユーザーを保存
        existingUsers.push({
          id: newUser.id,
          email: formData.email.trim(),
          password: formData.password,
          username: newUser.username,
        });
        localStorage.setItem("takken_users", JSON.stringify(existingUsers));

        logger.debug("Redirecting to dashboard");
        router.push("/dashboard");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("LocalStorage login error", err);
      throw new Error("ローカルストレージ認証に失敗しました");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      // Dynamic import for client-side only
      const { initializeFirebaseWithFallback } = await import(
        "../../../lib/firebase-client"
      );

      const firebaseInstance = await initializeFirebaseWithFallback();

      // フォールバックモードの場合はローカルストレージ認証を使用
      if (firebaseInstance.fallback) {
        setErrors({
          general:
            "Googleログインは現在利用できません。メールアドレスとパスワードでログインしてください。",
        });
        return;
      }

      const { auth } = firebaseInstance;

      const provider = new GoogleAuthProvider();
      // モバイル（Capacitor/Cordova/Chrome Custom Tabs 等）では redirect のみ安定
      const { signInWithRedirect } = await import("firebase/auth");
      await signInWithRedirect(auth as any, provider);
      // この後は再ロードされるため、続きの処理はリダイレクト結果側で行う
      return;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const errorObj = err as { code?: string; message?: string };
      logger.error("Google login error", err);
      let errorMessage = "Googleログインに失敗しました";

      if (errorObj.code === "auth/popup-closed-by-user") {
        errorMessage = "ログインがキャンセルされました";
      } else if (errorObj.code === "auth/popup-blocked") {
        errorMessage =
          "ポップアップがブロックされました。ポップアップを許可してください。";
      } else if (errorObj.code === "auth/configuration-not-found") {
        errorMessage =
          "Firebaseの設定に問題があります。開発者にお問い合わせください。";
      } else if (errorObj.code === "auth/network-request-failed") {
        errorMessage =
          "ネットワークエラーが発生しました。インターネット接続を確認してください。";
      } else if (errorObj.message) {
        errorMessage = `エラー: ${errorObj.message}`;
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // リダイレクト結果の処理（モバイル向け）
  if (typeof window !== "undefined") {
    (async () => {
      try {
        const { initializeFirebaseWithFallback } = await import(
          "../../../lib/firebase-client"
        );
        const { firestoreService } = await import(
          "../../../lib/firestore-service"
        );
        const { getRedirectResult } = await import("firebase/auth");
        const firebaseInstance = await initializeFirebaseWithFallback();
        if (firebaseInstance.fallback || !firebaseInstance.auth) return;
        const result = await getRedirectResult(firebaseInstance.auth as any);
        if (!result) return;
        const user = result.user;
        const userProfile = await firestoreService.getUserProfile(user.uid);
        const userData = {
          id: user.uid,
          username: (
            userProfile?.name ||
            user.displayName ||
            "ユーザー"
          ).substring(0, 50),
          name: userProfile?.name || user.displayName || "ユーザー",
          email: user.email,
          joinedAt: userProfile?.joinedAt || new Date().toISOString(),
          streak: userProfile?.streak || {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: "",
            studyDates: [],
          },
          progress: userProfile?.progress || {
            totalQuestions: 0,
            correctAnswers: 0,
            studyTimeMinutes: 0,
            categoryProgress: {},
          },
          learningRecords: userProfile?.learningRecords || [],
        };
        localStorage.setItem("takken_user", JSON.stringify(userData));
        router.push("/dashboard");
      } catch (e) {
        // 無視（未リダイレクト時を含む）
      }
    })();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - TSDO inspired minimal navigation */}
      <header className="nav-minimal sticky top-0 z-50">
        <div className="container-minimal">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="button-ghost p-2">
                <i className="ri-arrow-left-line text-lg"></i>
              </Link>
              <h1 className="text-lg font-medium">ログイン</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-minimal px-4 pb-24">
        <section className="section-minimal">
          <div className="max-w-md mx-auto">
            <div className="card-minimal fade-in">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🏠</div>
                <h2 className="text-xl font-medium mb-2">おかえりなさい</h2>
                <p className="text-minimal">
                  学習を再開して、冒険を続けましょう
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-destructive text-sm">{errors.general}</p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                    placeholder="メールアドレス"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    パスワード
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                    placeholder="パスワード"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full button-minimal py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "ログイン中..." : "ログイン"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-border"></div>
                <div className="px-4 text-sm text-muted-foreground">または</div>
                <div className="flex-1 border-t border-border"></div>
              </div>

              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full button-ghost py-4 text-base flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-2xl">🚀</span>
                <span>Googleでログイン</span>
              </button>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  アカウントをお持ちでない方は{" "}
                  <Link
                    href="/auth/register"
                    className="text-foreground font-medium hover:underline"
                  >
                    新規登録
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
