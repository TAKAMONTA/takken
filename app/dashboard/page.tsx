'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ペットの絵文字や名前を定義
const petStages = {
  dragon: {
    1: { emoji: '🥚', name: 'ドラゴンの卵' },
    2: { emoji: '🐲', name: 'ベビードラゴン' },
    3: { emoji: '🐉', name: 'ドラゴン' },
  },
  owl: {
    1: { emoji: '🥚', name: 'フクロウの卵' },
    2: { emoji: '🐣', name: 'ヒナフクロウ' },
    3: { emoji: '🦉', name: 'フクロウ' },
  },
  dog: {
    1: { emoji: '🥚', name: '子犬の卵' },
    2: { emoji: '🐶', name: '子犬' },
    3: { emoji: '🐕', name: '犬' },
  },
  cat: {
    1: { emoji: '🥚', name: '子猫の卵' },
    2: { emoji: '🐱', name: '子猫' },
    3: { emoji: '🐈', name: '猫' },
  }
};

// 学習モードの定義
const studyModes = [
  { id: 'practice', title: '過去問演習', icon: 'ri-book-2-line', description: '分野別に過去問を解く', route: '/practice' },
  { id: 'quick-test', title: 'ミニテスト', icon: 'ri-flashlight-line', description: '5分で実力チェック', route: '/quick-test' },
  { id: 'weak-points', title: '弱点克服', icon: 'ri-loop-left-line', description: '苦手な問題を再挑戦', route: '/weak-points' },
  { id: 'mock-exam', title: '模試', icon: 'ri-file-text-line', description: '本番さながらの模擬試験', route: '/mock-exam' },
];

export default function Dashboard() {
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

  // フォールバック付きの堅牢な実装
  const pet = user.pet || { type: 'dragon', stage: 1, level: 1, xp: 0 };
  const petTypeStages = petStages[pet.type as keyof typeof petStages] || petStages.dragon;
  const currentPet = petTypeStages[pet.stage as keyof typeof petTypeStages] || petTypeStages[1];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - TSDO inspired minimal navigation */}
      <header className="nav-minimal sticky top-0 z-50">
        <div className="container-minimal">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-medium">{user.username || 'ようこそ'}</h1>
              <div className="hidden sm:block w-px h-4 bg-border"></div>
              <p className="hidden sm:block text-xs text-muted-foreground">
                連続 {user.streak?.currentStreak || 0} 日学習中
              </p>
            </div>
            <Link href="/profile" className="button-ghost p-2">
              <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-medium">
                {user.username?.charAt(0) || 'P'}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-minimal px-4 pb-24">
        {/* Pet Section - Minimal card design */}
        <section className="section-minimal">
          <Link href="/pet" className="block">
            <div className="card-minimal text-center scale-hover fade-in">
              <div className="text-6xl mb-4">{currentPet.emoji}</div>
              <h2 className="text-xl font-medium mb-2">{currentPet.name}</h2>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <span>Lv.{pet.level}</span>
                <div className="w-px h-3 bg-border"></div>
                <span>XP: {pet.xp}</span>
              </div>
            </div>
          </Link>
        </section>

        {/* Study Menu - Grid layout inspired by TSDO portfolio */}
        <section className="section-minimal">
          <div className="mb-6">
            <h3 className="text-lg font-medium">学習を始める</h3>
          </div>
          
          <div className="grid-portfolio">
            {studyModes.map((mode, index) => (
              <Link key={mode.id} href={mode.route}>
                <div 
                  className="card-minimal scale-hover fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        <i className={`${mode.icon} text-lg text-foreground`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">{mode.title}</h4>
                      <p className="text-minimal">{mode.description}</p>
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

        {/* Quick Stats - Minimal info cards */}
        <section className="section-minimal">
          <div className="mb-6">
            <h3 className="text-lg font-medium">学習状況</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="card-minimal text-center">
              <div className="text-2xl font-medium mb-1">{user.streak?.currentStreak || 0}</div>
              <div className="text-xs text-muted-foreground">連続学習日数</div>
            </div>
            <div className="card-minimal text-center">
              <div className="text-2xl font-medium mb-1">{pet.level}</div>
              <div className="text-xs text-muted-foreground">ペットレベル</div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation - Minimal design */}
      <nav className="fixed bottom-0 left-0 right-0 nav-minimal">
        <div className="container-minimal px-4">
          <div className="flex justify-around items-center h-16">
            <Link href="/dashboard" className="flex flex-col items-center space-y-1 text-foreground">
              <i className="ri-home-fill text-xl"></i>
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
