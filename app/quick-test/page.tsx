'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const quickTestCategories = [
  {
    id: 'mixed',
    name: '全分野ミックス',
    icon: '🎲',
    description: '各分野から1-2問ずつ出題',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    questionCount: 5,
    timeLimit: 5
  },
  {
    id: 'takkengyouhou',
    name: '宅建業法',
    icon: '🏢',
    description: '重要ポイントを短時間で',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    questionCount: 5,
    timeLimit: 5
  },
  {
    id: 'minpou',
    name: '民法等',
    icon: '⚖️',
    description: '基本問題を中心に',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    questionCount: 5,
    timeLimit: 5
  },
  {
    id: 'hourei',
    name: '法令上の制限',
    icon: '📋',
    description: '頻出パターンを攻略',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    questionCount: 5,
    timeLimit: 5
  },
  {
    id: 'zeihou',
    name: '税・その他',
    icon: '💰',
    description: '暗記問題をサクッと',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    questionCount: 5,
    timeLimit: 5
  }
];

const quickTestModes = [
  {
    id: 'speed',
    title: 'スピード重視',
    icon: '⚡',
    description: '制限時間短めでテンポよく',
    timeMultiplier: 0.8
  },
  {
    id: 'normal',
    title: '標準モード',
    icon: '🎯',
    description: '1問1分でじっくり考える',
    timeMultiplier: 1.0
  },
  {
    id: 'review',
    title: '復習重視',
    icon: '📝',
    description: '解説をしっかり読む時間を確保',
    timeMultiplier: 1.5
  }
];

export default function QuickTest() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('mixed');
  const [selectedMode, setSelectedMode] = useState<string>('normal');

  useEffect(() => {
    const savedUser = localStorage.getItem('takken_rpg_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  const handleStartQuickTest = () => {
    router.push(`/quick-test/quiz?category=${selectedCategory}&mode=${selectedMode}`);
  };

  const getRecentStats = () => {
    // 新規ユーザーはゼロから開始
    return {
      todayTests: 0,
      todayCorrect: 0,
      todayTotal: 0,
      averageTime: '0:00',
      streak: 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Link href="/">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold !rounded-button">
              ホームに戻る
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = getRecentStats();
  const selectedCat = quickTestCategories.find(cat => cat.id === selectedCategory);
  const selectedModeData = quickTestModes.find(mode => mode.id === selectedMode);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pb-20">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b fixed top-0 w-full z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link href="/dashboard" className="text-purple-600 mr-4">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-arrow-left-line text-xl"></i>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">ミニテスト</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-6 space-y-6">
        {/* 今日の実績 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4 text-gray-800">⚡ 今日の実績</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.todayTests}</div>
              <div className="text-xs text-gray-500">テスト回数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.todayCorrect}/{stats.todayTotal}</div>
              <div className="text-xs text-gray-500">正解数</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{stats.averageTime}</div>
              <div className="text-xs text-gray-500">平均時間</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{stats.streak}日</div>
              <div className="text-xs text-gray-500">連続学習</div>
            </div>
          </div>
        </div>

        {/* カテゴリ選択 */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800">📚 出題分野を選択</h3>
          <div className="space-y-3">
            {quickTestCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${category.bgColor} rounded-xl p-4 border-2 transition-all cursor-pointer ${
                  selectedCategory === category.id
                    ? `${category.borderColor} border-opacity-100 shadow-md`
                    : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{category.name}</h4>
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">{category.questionCount}問</div>
                    <div className="text-xs text-gray-500">{category.timeLimit}分</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* モード選択 */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800">🎯 学習モードを選択</h3>
          <div className="space-y-3">
            {quickTestModes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer ${
                  selectedMode === mode.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{mode.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">{mode.title}</h4>
                    <p className="text-xs text-gray-600">{mode.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-600">
                      {Math.round((selectedCat?.timeLimit || 5) * mode.timeMultiplier)}分
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 設定プレビュー */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
          <div className="text-center">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-bold text-lg mb-2">テスト設定</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-bold">{selectedCat?.name}</div>
                <div className="opacity-80">{selectedCat?.questionCount}問</div>
              </div>
              <div>
                <div className="font-bold">{selectedModeData?.title}</div>
                <div className="opacity-80">
                  {Math.round((selectedCat?.timeLimit || 5) * (selectedModeData?.timeMultiplier || 1))}分
                </div>
              </div>
              <div>
                <div className="font-bold">獲得予定XP</div>
                <div className="opacity-80">{(selectedCat?.questionCount || 5) * 8} XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* 最近の学習履歴 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-800">📝 最近のミニテスト</h3>
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">⚡</div>
              <p className="text-sm">まだミニテスト履歴がありません</p>
              <p className="text-xs mt-1">ミニテストを始めて履歴を残しましょう！</p>
            </div>
          </div>
        </div>

        {/* 学習開始ボタン */}
        <div className="sticky bottom-20">
          <button
            onClick={handleStartQuickTest}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all !rounded-button"
          >
            ⚡ ミニテストを開始する
          </button>
        </div>
      </div>

      {/* ボトムナビゲーション */}
      <div className="bg-white border-t fixed bottom-0 w-full">
        <div className="max-w-md mx-auto px-0 py-2">
          <div className="grid grid-cols-4 gap-0">
            <Link href="/dashboard" className="flex flex-col items-center justify-center py-2 px-1">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-home-line text-gray-400 text-lg"></i>
              </div>
              <span className="text-xs text-gray-400 mt-1">ホーム</span>
            </Link>
            
            <Link href="/practice" className="flex flex-col items-center justify-center py-2 px-1">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-book-line text-gray-400 text-lg"></i>
              </div>
              <span className="text-xs text-gray-400 mt-1">学習</span>
            </Link>
            
            <Link href="/stats" className="flex flex-col items-center justify-center py-2 px-1">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-bar-chart-line text-gray-400 text-lg"></i>
              </div>
              <span className="text-xs text-gray-400 mt-1">統計</span>
            </Link>
            
            <Link href="/profile" className="flex flex-col items-center justify-center py-2 px-1">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-user-line text-gray-400 text-lg"></i>
              </div>
              <span className="text-xs text-gray-400 mt-1">プロフィール</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}