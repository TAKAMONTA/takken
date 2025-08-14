'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const practiceCategories = [
  { id: 'takkengyouhou', name: '宅建業法', icon: 'ri-building-line', description: '宅地建物取引業法に関する問題' },
  { id: 'minpou', name: '民法等', icon: 'ri-scales-line', description: '民法・借地借家法等の問題' },
  { id: 'hourei', name: '法令上の制限', icon: 'ri-draft-line', description: '都市計画法・建築基準法等' },
  { id: 'zeihou', name: '税・その他', icon: 'ri-price-tag-3-line', description: '税法・不動産鑑定評価等' },
];

export default function Practice() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('takken_rpg_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

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
              <h1 className="text-lg font-medium">学習</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-minimal px-4 pb-24">
        {/* Introduction Section */}
        <section className="section-minimal">
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium mb-2">分野別学習</h2>
            <p className="text-minimal">宅建試験の各分野から問題を選んで学習しましょう</p>
          </div>
        </section>

        {/* Category Selection - Grid layout inspired by TSDO portfolio */}
        <section className="section-minimal">
          <div className="grid-portfolio">
            {practiceCategories.map((category, index) => (
              <Link key={category.id} href={`/practice/detail?category=${category.id}`}>
                <div 
                  className="card-minimal scale-hover fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        <i className={`${category.icon} text-lg text-foreground`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">{category.name}</h4>
                      <p className="text-minimal">{category.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <i className="ri-arrow-right-line text-muted-foreground"></i>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="section-minimal">
          <div className="mb-6">
            <h3 className="text-lg font-medium">その他の学習方法</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/quick-test">
              <div className="card-minimal scale-hover">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <i className="ri-flashlight-line text-foreground"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">ミニテスト</h4>
                    <p className="text-xs text-muted-foreground">5分で実力チェック</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/weak-points">
              <div className="card-minimal scale-hover">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <i className="ri-loop-left-line text-foreground"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">弱点克服</h4>
                    <p className="text-xs text-muted-foreground">苦手な問題を再挑戦</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
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
            <Link href="/practice" className="flex flex-col items-center space-y-1 text-foreground">
              <i className="ri-book-open-fill text-xl"></i>
              <span className="text-xs font-medium">学習</span>
            </Link>
            <Link href="/stats" className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-foreground transition-colors">
              <i className="ri-bar-chart-line text-xl"></i>
              <span className="text-xs font-medium">分析</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-foreground transition-colors">
              <i className="ri-user-line text-xl"></i>
              <span className="text-xs font-medium">設定</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
