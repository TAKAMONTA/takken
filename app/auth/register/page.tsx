"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { logger } from "@/lib/logger";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.username.trim()) {
      newErrors.username = "ユーザー名は必須です";
    }

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスは必須です";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!formData.password) {
      newErrors.password = "パスワードは必須です";
    } else if (formData.password.length < 6) {
      newErrors.password = "パスワードは6文字以上で入力してください";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "パスワードが一致しません";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

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
        await handleLocalStorageRegistration();
        return;
      }

      const { auth } = firebaseInstance;

      // Firebase Authでユーザー作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // ユーザープロファイルを更新
      await updateProfile(user, {
        displayName: formData.username,
      });

      // Firestoreに初期ユーザーデータを保存
      const initialUserData = {
        id: user.uid,
        name: formData.username,
        email: formData.email,
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

      await firestoreService.createUserProfile(user.uid, initialUserData);

      // ユーザーデータをローカルストレージに保存
      const userData = {
        id: user.uid,
        username: formData.username,
        email: formData.email,
      };
      localStorage.setItem("takken_user", JSON.stringify(userData));

      // ローカルストレージにもユーザーリストを保存（フォールバック用）
      const { hashPassword } = await import("../../../lib/crypto-utils");
      const existingUsers = JSON.parse(
        localStorage.getItem("takken_users") || "[]"
      );
      existingUsers.push({
        id: user.uid,
        username: formData.username,
        email: formData.email,
        passwordHash: hashPassword(formData.password), // 暗号化されたパスワード
      });
      localStorage.setItem("takken_users", JSON.stringify(existingUsers));

      // ダッシュボードに遷移
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const errorObj = err as { code?: string; message?: string };
      logger.error("Registration error", err);

      // Firebaseが利用できない場合は、ローカルストレージのみで動作
      if (
        errorObj.code === "auth/configuration-not-found" ||
        errorObj.code === "auth/network-request-failed" ||
        errorObj.message?.includes("Firebase configuration")
      ) {
        try {
          await handleLocalStorageRegistration();
          return;
        } catch (localStorageError) {
          const localStorageErr = localStorageError instanceof Error ? localStorageError : new Error(String(localStorageError));
          logger.error("LocalStorage registration error", localStorageErr);
        }
      }

      let errorMessage = "登録に失敗しました";

      if (errorObj.code === "auth/email-already-in-use") {
        errorMessage = "このメールアドレスは既に使用されています";
      } else if (errorObj.code === "auth/weak-password") {
        errorMessage = "パスワードが弱すぎます";
      } else if (errorObj.code === "auth/invalid-email") {
        errorMessage = "無効なメールアドレスです";
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // ローカルストレージ登録の処理
  const handleLocalStorageRegistration = async () => {
    try {
      // 既存ユーザーの確認
      const existingUsers = JSON.parse(
        localStorage.getItem("takken_users") || "[]"
      );
      const existingUser = existingUsers.find(
        (u: any) => u.email === formData.email.trim()
      );

      if (existingUser) {
        throw new Error("このメールアドレスは既に使用されています");
      }

      // 新しいユーザーを作成
      const { hashPassword } = await import("../../../lib/crypto-utils");
      const newUser = {
        id: "user-" + Date.now(),
        username: formData.username,
        email: formData.email.trim(),
        passwordHash: hashPassword(formData.password), // 暗号化されたパスワード
      };

      // ユーザーリストに追加
      existingUsers.push(newUser);
      localStorage.setItem("takken_users", JSON.stringify(existingUsers));

      // 現在のユーザーとして設定
      const userData = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      };
      localStorage.setItem("takken_user", JSON.stringify(userData));

      // ダッシュボードに遷移
      router.push("/dashboard");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("LocalStorage registration error", err);
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // リアルタイムバリデーション
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

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
              <h1 className="text-lg font-medium">新規登録</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-minimal px-4 pb-24">
        <section className="section-minimal">
          <div className="max-w-md mx-auto">
            <div className="card-minimal fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="ri-book-open-line text-2xl text-primary"></i>
                </div>
                <h2 className="text-xl font-medium mb-2">アカウント作成</h2>
                <p className="text-muted-foreground">
                  宅建合格ロードへようこそ
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-destructive text-sm">{errors.general}</p>
                  </div>
                )}

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ユーザー名 *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                    placeholder="好きな名前を入力"
                  />
                  {errors.username && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    メールアドレス *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                    placeholder="メールアドレス"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    パスワード *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                    placeholder="6文字以上で入力"
                  />
                  {errors.password && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    パスワード確認 *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                    placeholder="パスワードを再入力"
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full button-minimal py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "登録中..." : "登録してダッシュボードへ"}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  すでにアカウントをお持ちですか？{" "}
                  <Link
                    href="/auth/login"
                    className="text-foreground font-medium hover:underline"
                  >
                    ログイン
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-2">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">takken-study.com</p>
        </div>
      </footer>
    </div>
  );
}
