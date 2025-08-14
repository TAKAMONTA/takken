'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const examModes = [
  {
    id: 'full_exam',
    title: '本番形式模試',
    icon: '🎯',
    description: '50問・2時間・本試験と同じ形式',
    questionCount: 50,
    timeLimit: 120,
    breakdown: {
      '宅建業法': 20,
      '民法等': 14,
      '法令上の制限': 8,
      '税・その他': 8
    },
    difficulty: '本番レベル',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: 'speed_exam',
    title: 'スピード模試',
    icon: '⚡',
    description: '40問・90分・時間重視の練習',
    questionCount: 40,
    timeLimit: 90,
    breakdown: {
      '宅建業法': 16,
      '民法等': 12,
      '法令上の制限': 6,
      '税・その他': 6
    },
    difficulty: '標準レベル',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    id: 'review_exam',
    title: '復習重視模試',
    icon: '📝',
    description: '30問・無制限・解説重視',
    questionCount: 30,
    timeLimit: 0,
    breakdown: {
      '宅建業法': 12,
      '民法等': 10,
      '法令上の制限': 4,
      '税・その他': 4
    },
    difficulty: '基本〜応用',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
];

const recentExams: any[] = [];

export default function MockExam() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<string>('full_exam');

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

  const handleStartExam = () => {
    router.push(`/mock-exam/quiz?mode=${selectedMode}`);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-orange-500 text-white';
      default: return 'bg-red-500 text-white';
    }
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

  const selectedExam = examModes.find(mode => mode.id === selectedMode);

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
          <h1 className="text-xl font-bold text-gray-800">模試システム</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-6 space-y-6">
        {/* 模試統計 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4 text-gray-800">🏆 模試成績</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-xs text-gray-500">受験回数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">74%</div>
              <div className="text-xs text-gray-500">平均得点</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">B</div>
              <div className="text-xs text-gray-500">最高ランク</div>
            </div>
          </div>
        </div>

        {/* 模試モード選択 */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800">📋 模試モードを選択</h3>
          <div className="space-y-3">
            {examModes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`${mode.bgColor} rounded-xl p-4 border-2 transition-all cursor-pointer ${
                  selectedMode === mode.id
                    ? `${mode.borderColor} border-opacity-100 shadow-md`
                    : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{mode.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{mode.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{mode.description}</p>
                      <div className="text-xs text-gray-500">{mode.difficulty}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">{mode.questionCount}問</div>
                    <div className="text-xs text-gray-500">
                      {mode.timeLimit ? `${mode.timeLimit}分` : '無制限'}
                    </div>
                  </div>
                </div>
                
                {/* 問題構成 */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {Object.entries(mode.breakdown).map(([category, count]) => (
                    <div key={category} className="text-center bg-white/50 rounded p-1">
                      <div className="font-bold">{count}</div>
                      <div className="text-gray-600">{category}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 選択中の模試詳細 */}
        {selectedExam && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
            <div className="text-center">
              <div className="text-3xl mb-2">{selectedExam.icon}</div>
              <h3 className="font-bold text-lg mb-2">{selectedExam.title}</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-bold">{selectedExam.questionCount}問</div>
                  <div className="opacity-80">問題数</div>
                </div>
                <div>
                  <div className="font-bold">
                    {selectedExam.timeLimit ? `${selectedExam.timeLimit}分` : '無制限'}
                  </div>
                  <div className="opacity-80">制限時間</div>
                </div>
                <div>
                  <div className="font-bold">{selectedExam.questionCount * 15} XP</div>
                  <div className="opacity-80">獲得予定</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-bold text-sm text-yellow-800 mb-2">⚠️ 受験前の注意</h3>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• 模試開始後は途中で中断できません</li>
            <li>• 本番同様の緊張感で受験しましょう</li>
            <li>• 見直し時間も考慮して時間配分しましょう</li>
            <li>• 体調が良い時に受験することをお勧めします</li>
          </ul>
        </div>

        {/* 最近の模試履歴 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-800">📊 最近の模試結果</h3>
          <div className="space-y-3">
            {recentExams.map((exam, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(exam.rank)}`}>
                    {exam.rank}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{exam.mode}</div>
                    <div className="text-xs text-gray-500">{exam.date} • {exam.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${getScoreColor(exam.percentage)}`}>
                    {exam.score}/{exam.total}
                  </div>
                  <div className={`text-xs ${getScoreColor(exam.percentage)}`}>
                    {exam.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 合格予測 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-800">🎯 合格予測</h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-green-600 mb-2">82%</div>
            <div className="text-sm text-gray-600">現在の合格可能性</div>
          </div>
          <div className="bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '82%' }}></div>
          </div>
          <div className="text-xs text-gray-600 text-center">
            あと3点アップで合格圏内（85%）に到達！
          </div>
        </div>

        {/* 模試開始ボタン */}
        <div className="sticky bottom-20">
          <button
            onClick={handleStartExam}
            className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all !rounded-button"
          >
            🚀 模試を開始する
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