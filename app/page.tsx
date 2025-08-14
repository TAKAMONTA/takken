'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase認証状態を監視（クライアントサイドのみ）
    let unsubscribe: (() => void) | undefined;
    
    const initAuth = async () => {
      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        const { initializeFirebase } = await import('../lib/firebase-client');
        const { firestoreService } = await import('../lib/firestore-service');
        const { auth } = initializeFirebase();

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Firestoreからユーザープロファイルを取得
              const userProfile = await firestoreService.getUserProfile(firebaseUser.uid);
              setUser(userProfile);
            } catch (error) {
              console.error('Error loading user profile:', error);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
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
              <h2 className="text-2xl font-medium mb-4 fade-in" style={{ animationDelay: '0.1s' }}>
                宅建合格への道のりを始めよう
              </h2>
              <p className="text-minimal max-w-md mx-auto fade-in" style={{ animationDelay: '0.2s' }}>
                あなただけのペットと一緒に楽しく宅建試験に合格しよう
              </p>
            </section>

            {/* Action Buttons */}
            <section className="space-y-4 mb-16 fade-in" style={{ animationDelay: '0.3s' }}>
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

            {/* Features Section - Grid layout inspired by TSDO portfolio */}
            <section className="fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="mb-8 text-center">
                <h3 className="text-lg font-medium">アプリの特徴</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: '🎯',
                    title: '試験特化',
                    description: '宅建試験に特化した問題演習と模試'
                  },
                  {
                    icon: '🧠',
                    title: '性格診断',
                    description: 'あなたの学習スタイルに合わせた診断'
                  },
                  {
                    icon: '📊',
                    title: '進捗管理',
                    description: '詳細な学習進捗とスケジュール管理'
                  },
                  {
                    icon: '💪',
                    title: '弱点克服',
                    description: '苦手分野を効率的に克服する学習法'
                  }
                ].map((feature, index) => (
                  <div 
                    key={feature.title}
                    className="card-minimal text-center scale-hover"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h4 className="font-medium mb-2">{feature.title}</h4>
                    <p className="text-minimal text-xs">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          // ログイン済み状態 - TSDO inspired minimal design
          <div className="section-minimal">
            <div className="text-center">
              <div className="text-6xl mb-6 fade-in">👋</div>
              <h2 className="text-xl font-medium mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
                おかえりなさい、{user.name}さん
              </h2>
              <Link href="/dashboard">
                <button className="button-minimal py-4 px-8 text-base fade-in" style={{ animationDelay: '0.2s' }}>
                  学習を続ける
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="section-minimal border-t border-border mt-16">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 宅建合格ロード. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
