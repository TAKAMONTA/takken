'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const petTypes = {
  dragon: {
    name: 'ドラゴン',
    stages: [
      { name: '卵', icon: '🥚', level: 0 },
      { name: 'ベビードラゴン', icon: '🐲', level: 1 },
      { name: 'ドラゴン', icon: '🐉', level: 3 },
      { name: 'ファイアドラゴン', icon: '🔥', level: 5 },
      { name: 'エンシェントドラゴン', icon: '👑', level: 8 }
    ],
    description: '計画的で継続性を重視する学習者のパートナー'
  },
  owl: {
    name: 'フクロウ',
    stages: [
      { name: '卵', icon: '🥚', level: 0 },
      { name: 'ヒナフクロウ', icon: '🐣', level: 1 },
      { name: 'フクロウ', icon: '🦉', level: 3 },
      { name: '賢者フクロウ', icon: '🧙‍♂️', level: 5 },
      { name: '神秘のフクロウ', icon: '🌟', level: 8 }
    ],
    description: '探究心旺盛で深い理解を求める学習者のパートナー'
  },
  dog: {
    name: '犬',
    stages: [
      { name: '卵', icon: '🥚', level: 0 },
      { name: '子犬', icon: '🐶', level: 1 },
      { name: '犬', icon: '🐕', level: 3 },
      { name: 'アルファウルフ', icon: '🐺', level: 5 },
      { name: 'ムーンウルフ', icon: '🌙', level: 8 }
    ],
    description: '協調的で他者との交流を通して学ぶタイプのパートナー'
  },
  cat: {
    name: '猫',
    stages: [
      { name: '卵', icon: '🥚', level: 0 },
      { name: '子猫', icon: '🐱', level: 1 },
      { name: '猫', icon: '🐈', level: 3 },
      { name: 'ライオン', icon: '🦁', level: 5 },
      { name: 'サンダーライオン', icon: '⚡', level: 8 }
    ],
    description: '効率重視で最大成果を求める戦略的学習者のパートナー'
  }
};

const activities = [
  {
    id: 'feed',
    name: 'エサをあげる',
    icon: '🍽️',
    effect: { happiness: +10, xp: +5 },
    cost: 10,
    description: 'ペットの満足度を上げます'
  },
  {
    id: 'play',
    name: '遊ぶ',
    icon: '🎾',
    effect: { happiness: +20, xp: +10 },
    cost: 0,
    description: 'ペットと遊んで絆を深めます'
  },
  {
    id: 'study',
    name: '一緒に勉強',
    icon: '📚',
    effect: { xp: +20 },
    cost: 0,
    description: 'ペットと一緒に勉強します'
  },
  {
    id: 'adventure',
    name: '冒険に出る',
    icon: '🗺️',
    effect: { xp: +50, happiness: +15 },
    cost: 50,
    description: '特別な冒険で経験値を大量獲得'
  }
];

export default function PetPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [coins, setCoins] = useState(0);
  const [selectedTab, setSelectedTab] = useState('status');
  const [showActivity, setShowActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('takken_rpg_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      let petData = userData.pet;
      if (petData) {
        petData = {
          ...petData,
          happiness: petData.happiness ?? 80,
        };
      }
      setUser(userData);
      setPet(petData);
      setCoins(userData.coins || 100);
    } else {
      router.push('/');
    }
  }, [router]);

  const getCurrentStage = () => {
    if (!pet) return null;
    const petType = petTypes[pet.type as keyof typeof petTypes];
    return petType.stages.find(stage => pet.level >= stage.level) || petType.stages[0];
  };

  const getNextStage = () => {
    if (!pet) return null;
    const petType = petTypes[pet.type as keyof typeof petTypes];
    const currentStageIndex = petType.stages.findIndex(stage => pet.level >= stage.level);
    return petType.stages[currentStageIndex + 1] || null;
  };

  const performActivity = (activity: any) => {
    if (!pet) return;

    if (activity.cost > coins) {
      alert('コインが足りません！');
      return;
    }

    const newPet = { ...pet };
    const newCoins = coins - activity.cost;

    // 効果を適用
    Object.entries(activity.effect).forEach(([key, value]) => {
      if (key === 'xp') {
        newPet.xp += value as number;
      } else if (key === 'happiness') {
        newPet.happiness = Math.max(0, Math.min(100, (newPet.happiness || 80) + (value as number)));
      }
    });

    // レベルアップ判定
    const newLevel = Math.floor(newPet.xp / 100) + 1;
    if (newLevel > newPet.level) {
      newPet.level = newLevel;
      alert(`🎉 レベルアップ！ Lv.${newLevel} になりました！`);
      
      // 進化判定
      const nextStage = getNextStage();
      if (nextStage && newLevel >= nextStage.level) {
        newPet.stage = petTypes[pet.type as keyof typeof petTypes].stages.findIndex(s => s.level === nextStage.level);
        alert(`✨ 進化しました！ ${nextStage.name} になりました！`);
      }
    }

    setPet(newPet);
    setCoins(newCoins);

    // ユーザーデータを更新
    const updatedUser = { ...user, pet: newPet, coins: newCoins };
    setUser(updatedUser);
    localStorage.setItem('takken_rpg_user', JSON.stringify(updatedUser));

    setShowActivity(false);
    setSelectedActivity(null);
  };

  if (!user || !pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  const currentStage = getCurrentStage();
  const nextStage = getNextStage();
  const petType = petTypes[pet.type as keyof typeof petTypes];

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
              <h1 className="text-lg font-medium">ペット</h1>
            </div>
            <div className="flex items-center space-x-2">
              <i className="ri-coin-line text-lg text-muted-foreground"></i>
              <span className="font-medium">{coins}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container-minimal px-4 pb-24">
        {/* Pet Display - Minimal card design */}
        <section className="section-minimal">
          <div className="card-minimal text-center fade-in">
            <div className="text-8xl mb-4">{currentStage?.icon}</div>
            <h2 className="text-xl font-medium mb-2">{currentStage?.name}</h2>
            <p className="text-minimal mb-6">{petType.description}</p>
            
            {/* Level & XP */}
            <div className="bg-accent rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Lv.{pet.level}</span>
                <span className="text-sm text-muted-foreground">{pet.xp % 100}/100 XP</span>
              </div>
              <div className="bg-background rounded-full h-2">
                <div 
                  className="bg-foreground h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(pet.xp % 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Next Evolution */}
            {nextStage && (
              <div className="bg-muted rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-2">次の進化</div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">{nextStage.icon}</span>
                  <span className="font-medium">{nextStage.name}</span>
                  <span className="text-sm text-muted-foreground">(Lv.{nextStage.level})</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="section-minimal">
          <div className="card-minimal p-0 overflow-hidden">
            <div className="flex">
              {[
                { id: 'status', name: 'ステータス', icon: 'ri-bar-chart-line' },
                { id: 'care', name: 'お世話', icon: 'ri-heart-line' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex-1 py-4 px-4 text-center transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <i className={`${tab.icon} text-lg mb-1 block`}></i>
                  <div className="text-xs font-medium">{tab.name}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {selectedTab === 'status' && (
          <section className="section-minimal">
            <div className="card-minimal">
              <h3 className="text-lg font-medium mb-6">基本ステータス</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <i className="ri-emotion-happy-line text-lg"></i>
                      <span className="font-medium">幸福度</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{pet.happiness || 80}/100</span>
                  </div>
                  <div className="bg-accent rounded-full h-2">
                    <div 
                      className="bg-foreground h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pet.happiness || 80}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <i className="ri-star-line text-lg"></i>
                      <span className="font-medium">経験値</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{pet.xp}</span>
                  </div>
                  <div className="bg-accent rounded-full h-2">
                    <div 
                      className="bg-foreground h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (pet.xp % 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {selectedTab === 'care' && (
          <section className="section-minimal">
            <div className="mb-6">
              <h3 className="text-lg font-medium">お世話メニュー</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activities.map((activity, index) => (
                <button
                  key={activity.id}
                  onClick={() => {
                    setSelectedActivity(activity);
                    setShowActivity(true);
                  }}
                  className="card-minimal scale-hover fade-in text-left"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-2xl">
                        {activity.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">{activity.name}</h4>
                      <p className="text-minimal text-xs">{activity.description}</p>
                      {activity.cost > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          <i className="ri-coin-line text-xs text-muted-foreground"></i>
                          <span className="text-xs text-muted-foreground">{activity.cost}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Activity Confirmation Modal */}
      {showActivity && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-minimal max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">{selectedActivity.icon}</div>
              <h3 className="text-lg font-medium mb-2">{selectedActivity.name}</h3>
              <p className="text-minimal">{selectedActivity.description}</p>
            </div>
            
            <div className="bg-accent rounded-lg p-4 mb-6">
              <div className="text-sm font-medium mb-2">効果:</div>
              <div className="space-y-1">
                {Object.entries(selectedActivity.effect).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span>{key === 'xp' ? '経験値' : key === 'happiness' ? '幸福度' : key}</span>
                    <span className={(value as number) > 0 ? 'text-green-600' : 'text-red-600'}>
                      {(value as number) > 0 ? '+' : ''}{value as number}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowActivity(false);
                  setSelectedActivity(null);
                }}
                className="flex-1 button-ghost"
              >
                キャンセル
              </button>
              <button
                onClick={() => performActivity(selectedActivity)}
                disabled={selectedActivity.cost > coins}
                className="flex-1 button-minimal disabled:opacity-50"
              >
                実行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
