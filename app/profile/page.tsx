'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('takken_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('takken_user');
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - TSDO inspired minimal navigation */}
      <header className="nav-minimal sticky top-0 z-50">
        <div className="container-minimal">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="button-ghost p-2">
                <i className="ri-arrow-left-line text-lg"></i>
              </Link>
              <h1 className="text-lg font-medium">設定</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-minimal px-4 pb-24">
        {/* Profile Info - Minimal card design */}
        <section className="section-minimal">
          <div className="card-minimal fade-in">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-foreground text-background rounded-full flex items-center justify-center text-2xl font-medium">
                {user.username?.charAt(0) || 'P'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-medium mb-1">{user.username || '未設定'}</h2>
                <p className="text-minimal">{user.email || 'メールアドレス未設定'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="section-minimal">
          <div className="mb-6">
            <h3 className="text-lg font-medium">アカウント情報</h3>
          </div>
          
          <div className="card-minimal space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">ユーザー名</span>
              <span className="text-muted-foreground">{user.username}</span>
            </div>
            <div className="w-full h-px bg-border"></div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">メールアドレス</span>
              <span className="text-muted-foreground">{user.email}</span>
            </div>
            <div className="w-full h-px bg-border"></div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">登録日</span>
              <span className="text-muted-foreground">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : '不明'}
              </span>
            </div>
          </div>
        </section>

        {/* App Settings */}
        <section className="section-minimal">
          <div className="mb-6">
            <h3 className="text-lg font-medium">アプリ設定</h3>
          </div>
          
          <div className="space-y-4">
            <div className="card-minimal">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">学習リマインダー</h4>
                  <p className="text-xs text-muted-foreground mt-1">毎日の学習を通知でお知らせ</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" />
                  <div className="w-11 h-6 bg-muted rounded-full cursor-pointer">
                    <div className="w-5 h-5 bg-background rounded-full shadow-sm transform transition-transform translate-x-0.5 translate-y-0.5"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-minimal">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">ダークモード</h4>
                  <p className="text-xs text-muted-foreground mt-1">画面の表示テーマを変更</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" />
                  <div className="w-11 h-6 bg-muted rounded-full cursor-pointer">
                    <div className="w-5 h-5 bg-background rounded-full shadow-sm transform transition-transform translate-x-0.5 translate-y-0.5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* App Info */}
        <section className="section-minimal">
          <div className="mb-6">
            <h3 className="text-lg font-medium">アプリについて</h3>
          </div>
          
          <div className="card-minimal space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">バージョン</span>
              <span className="text-muted-foreground">1.0.0</span>
            </div>
            <div className="w-full h-px bg-border"></div>
            <Link href="/settings/terms" className="flex justify-between items-center py-2">
              <span className="font-medium">利用規約</span>
              <i className="ri-arrow-right-line text-muted-foreground"></i>
            </Link>
            <div className="w-full h-px bg-border"></div>
            <Link href="/settings/privacy" className="flex justify-between items-center py-2">
              <span className="font-medium">プライバシーポリシー</span>
              <i className="ri-arrow-right-line text-muted-foreground"></i>
            </Link>
          </div>
        </section>

        {/* Logout Button */}
        <section className="section-minimal">
          <button
            onClick={handleLogout}
            className="w-full button-minimal bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90"
          >
            ログアウト
          </button>
        </section>
      </main>

      {/* Bottom Navigation - Minimal design */}
      <nav className="fixed bottom-0 left-0 right-0 nav-minimal">
        <div className="container-minimal px-4">
          <div className="flex justify-around items-center h-16">
            <Link href="/dashboard" className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-foreground transition-colors">
              <i className="ri-home-line text-xl"></i>
              <span className="text-xs font-medium">ホーム</span>
            </Link>
            <Link href="/practice" className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-foreground transition-colors">
              <i className="ri-book-open-line text-xl"></i>
              <span className="text-xs font-medium">学習</span>
            </Link>
            <Link href="/stats" className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-foreground transition-colors">
              <i className="ri-bar-chart-line text-xl"></i>
              <span className="text-xs font-medium">分析</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center space-y-1 text-foreground">
              <i className="ri-user-fill text-xl"></i>
              <span className="text-xs font-medium">設定</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
