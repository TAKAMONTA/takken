'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.username.trim()) {
      newErrors.username = 'ユーザー名は必須です';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
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
      const { initializeFirebase } = await import('../../../lib/firebase-client');
      const { firestoreService } = await import('../../../lib/firestore-service');
      const { auth } = initializeFirebase();

      // Firebase Authでユーザー作成
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // ユーザープロファイルを更新
      await updateProfile(user, {
        displayName: formData.username
      });

      // Firestoreに初期ユーザーデータを保存
      const initialUserData = {
        id: user.uid,
        name: formData.username,
        email: formData.email,
        level: 1,
        xp: 0,
        joinedAt: new Date().toISOString(),
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: '',
          studyDates: []
        },
        progress: {
          totalQuestions: 0,
          correctAnswers: 0,
          studyTimeMinutes: 0,
          categoryProgress: {}
        },
        badges: [],
        pet: {
          xp: 0,
          level: 1,
          stage: 1
        }
      };

      await firestoreService.createUserProfile(user.uid, initialUserData);

      // ユーザーデータをローカルストレージに保存
      const userData = {
        id: user.uid,
        username: formData.username,
        email: formData.email,
        pet: {
          type: 'dragon',
          stage: 1,
          level: 1,
          happiness: 100,
          hunger: 50,
          xp: 0
        }
      };
      localStorage.setItem('takken_rpg_user', JSON.stringify(userData));

      // ローカルストレージにもユーザーリストを保存（フォールバック用）
      const existingUsers = JSON.parse(localStorage.getItem('takken_users') || '[]');
      existingUsers.push({
        id: user.uid,
        username: formData.username,
        email: formData.email,
        password: formData.password, // 注意: 本番環境では暗号化すべき
        pet: userData.pet
      });
      localStorage.setItem('takken_users', JSON.stringify(existingUsers));

      // 性格診断画面に遷移
      router.push('/personality-test');
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = '登録に失敗しました';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'パスワードが弱すぎます';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '無効なメールアドレスです';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
                <div className="text-5xl mb-4">🎮</div>
                <h2 className="text-xl font-medium mb-2">アカウント作成</h2>
                <p className="text-minimal">宅建合格RPGへようこそ</p>
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
                    <p className="text-destructive text-xs mt-1">{errors.username}</p>
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
                    <p className="text-destructive text-xs mt-1">{errors.email}</p>
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
                    <p className="text-destructive text-xs mt-1">{errors.password}</p>
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
                    <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full button-minimal py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '登録中...' : '登録して性格診断へ'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  すでにアカウントをお持ちですか？{' '}
                  <Link href="/auth/login" className="text-foreground font-medium hover:underline">
                    ログイン
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
