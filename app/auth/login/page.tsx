'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setErrors({
        general: 'メールアドレスとパスワードを入力してください'
      });
      return;
    }

    setLoading(true);

    try {
      // Dynamic import for client-side only
      const { initializeFirebase } = await import('../../../lib/firebase-client');
      const { firestoreService } = await import('../../../lib/firestore-service');
      const { auth } = initializeFirebase();

      // Firebase認証でログイン
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Firestoreからユーザープロファイルを取得
      const userProfile = await firestoreService.getUserProfile(user.uid);
      
      if (userProfile) {
        // ユーザーデータをローカルストレージに保存
        const userData = {
          id: user.uid,
          username: userProfile.name || user.displayName || 'ユーザー',
          email: user.email,
          pet: userProfile.pet || {
            type: 'dragon',
            stage: 1,
            level: 1,
            happiness: 100,
            hunger: 50,
            xp: 0
          }
        };
        localStorage.setItem('takken_rpg_user', JSON.stringify(userData));
        
        // ユーザープロファイルが存在する場合はダッシュボードへ
        router.push('/dashboard');
      } else {
        // 初回ログインの場合は性格診断へ
        router.push('/personality-test');
      }
    } catch (firebaseError: any) {
      console.error('Firebase login error:', firebaseError);
      
      // Firebaseが利用できない場合は、ローカルストレージのみで動作
      if (firebaseError.code === 'auth/configuration-not-found' || firebaseError.code === 'auth/network-request-failed') {
        // ローカルストレージからユーザーを検索
        const existingUsers = JSON.parse(localStorage.getItem('takken_users') || '[]');
        const foundUser = existingUsers.find((u: any) => u.email === formData.email && u.password === formData.password);
        
        if (foundUser) {
          // ユーザーデータをローカルストレージに保存
          const userData = {
            id: foundUser.id,
            username: foundUser.username,
            email: foundUser.email,
            pet: foundUser.pet || {
              type: 'dragon',
              stage: 1,
              level: 1,
              happiness: 100,
              hunger: 50,
              xp: 0
            }
          };
          localStorage.setItem('takken_rpg_user', JSON.stringify(userData));
          router.push('/dashboard');
          return;
        }
      }
      
      // 元のエラーハンドリング
      let errorMessage = 'ログインに失敗しました';
      
      if (firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'このメールアドレスのアカウントが見つかりません';
      } else if (firebaseError.code === 'auth/wrong-password') {
        errorMessage = 'パスワードが間違っています';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = '無効なメールアドレスです';
      } else if (firebaseError.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebaseの設定に問題があります。開発者にお問い合わせください。';
      } else if (firebaseError.code === 'auth/network-request-failed') {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else if (firebaseError.message) {
        errorMessage = `エラー: ${firebaseError.message}`;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      // Dynamic import for client-side only
      const { initializeFirebase } = await import('../../../lib/firebase-client');
      const { firestoreService } = await import('../../../lib/firestore-service');
      const { auth } = initializeFirebase();

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Firestoreからユーザープロファイルを取得
      const userProfile = await firestoreService.getUserProfile(user.uid);
      
      if (userProfile) {
        // ユーザーデータをローカルストレージに保存
        const userData = {
          id: user.uid,
          username: userProfile.name || user.displayName || 'ユーザー',
          email: user.email,
          pet: userProfile.pet || {
            type: 'dragon',
            stage: 1,
            level: 1,
            happiness: 100,
            hunger: 50,
            xp: 0
          }
        };
        localStorage.setItem('takken_rpg_user', JSON.stringify(userData));
        
        // 既存ユーザーはダッシュボードへ
        router.push('/dashboard');
      } else {
        // 新規ユーザーは性格診断へ
        router.push('/personality-test');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      let errorMessage = 'Googleログインに失敗しました';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'ログインがキャンセルされました';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'ポップアップがブロックされました。ポップアップを許可してください。';
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebaseの設定に問題があります。開発者にお問い合わせください。';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else if (error.message) {
        errorMessage = `エラー: ${error.message}`;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
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
                <p className="text-minimal">学習を再開して、冒険を続けましょう</p>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                  {loading ? 'ログイン中...' : 'ログイン'}
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
                  アカウントをお持ちでない方は{' '}
                  <Link href="/auth/register" className="text-foreground font-medium hover:underline">
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
