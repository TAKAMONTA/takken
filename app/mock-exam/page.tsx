'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { firestoreService } from '@/lib/firestore-service';

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

export default function MockExam() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<string>('full_exam');
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [stats, setStats] = useState({
    examCount: 0,
    averageScore: 0,
    bestRank: 'N/A',
    passProbability: 0,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('takken_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      fetchMockExamData(userData.uid);
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  const fetchMockExamData = async (userId: string) => {
    const sessions = await firestoreService.getStudySessions(userId);
    const mockExams = sessions.filter(session => session.type === 'mock_exam');
    setRecentExams(mockExams.slice(0, 5)); // 直近5件を表示

    if (mockExams.length > 0) {
      const examCount = mockExams.length;
      const totalScore = mockExams.reduce((sum, exam) => sum + (exam.score || 0), 0);
      const averageScore = totalScore / examCount;
      
      const bestRank = mockExams.reduce((best: string | undefined, exam) => {
        if (!best) return exam.rank;
        return (exam.rank && exam.rank < best) ? exam.rank : best;
      }, undefined);

      // 合格可能性を計算 (仮のロジック)
      const passProbability = Math.min(50 + averageScore * 0.5, 95);

      setStats({
        examCount,
        averageScore,
        bestRank: bestRank || 'N/A',
        passProbability,
      });
    }
  };

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
      <div className="study-shell flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="study-shell flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Link href="/">
            <button className="study-btn max-w-xs">
              ホームに戻る
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedExam = examModes.find(mode => mode.id === selectedMode);

  return (
    <div className="study-shell pb-safe-nav">
      <div className="fixed top-0 z-10 w-full border-b border-study-border bg-white/90 backdrop-blur-sm" style={{ paddingTop: 'var(--safe-top)' }}>
        <div className="mx-auto flex max-w-md items-center px-4 py-4">
          <Link href="/dashboard" className="tap-target mr-3 flex items-center justify-center text-study-accent">
            <i className="ri-arrow-left-line text-xl"></i>
          </Link>
          <h1 className="text-xl font-bold text-study-ink">令和7年度予想模試</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-6 px-4 pb-6 pt-20">
        <div className="study-cta rounded-xl p-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h2 className="font-bold text-lg mb-2">令和7年度予想模試</h2>
            <p className="text-sm opacity-90 mb-4">
              最新の法改正を反映した2025年度予想問題
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-bold">最新法改正対応</div>
                <div className="opacity-80 text-xs">令和6年〜7年施行</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="font-bold">本格的な問題</div>
                <div className="opacity-80 text-xs">詳細解説付き</div>
              </div>
            </div>
          </div>
        </div>

        {/* 模試統計 */}
        <div className="study-card p-6">
          <h2 className="mb-4 text-lg font-bold text-study-ink">🏆 模試成績</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-study-accent">{stats.examCount}</div>
              <div className="text-xs text-gray-500">受験回数</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>{stats.averageScore.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">平均得点</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-study-accent">{stats.bestRank}</div>
              <div className="text-xs text-gray-500">最高ランク</div>
            </div>
          </div>
        </div>

        {/* 模試モード選択 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-study-ink">📋 模試モードを選択</h3>
          <div className="space-y-3">
            {examModes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`study-card cursor-pointer border-2 p-4 transition-all ${
                  selectedMode === mode.id
                    ? 'border-study-accent bg-study-accent-soft shadow-md'
                    : 'hover:border-study-border'
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
          <div className="study-premium rounded-xl p-6">
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

        {/* 令和7年度予想問題の特徴 */}
        <div className="study-card border border-study-border p-4">
          <h3 className="mb-2 text-sm font-bold text-study-ink">✨ 令和7年度予想問題の特徴</h3>
          <ul className="space-y-1 text-xs text-study-muted">
            <li>• 令和6年7月・令和7年4月施行の最新法改正を反映</li>
            <li>• 宅建業法の免許申請手続きの変更に対応</li>
            <li>• 建築基準法の確認要件統一に対応</li>
            <li>• 従業者名簿・標識のデジタル化対応</li>
          </ul>
        </div>

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
        <div className="study-card p-6">
          <h3 className="mb-4 text-lg font-bold text-study-ink">📊 最近の模試結果</h3>
          <div className="space-y-3">
            {recentExams.length > 0 ? (
              recentExams.map((exam, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(exam.rank || 'N/A')}`}>
                      {exam.rank || 'N/A'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{exam.mode}</div>
                      <div className="text-xs text-gray-500">{new Date(exam.startTime).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getScoreColor(exam.score || 0)}`}>
                      {exam.correctAnswers}/{exam.totalQuestions}
                    </div>
                    <div className={`text-xs ${getScoreColor(exam.score || 0)}`}>
                      {exam.score?.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm">まだ模試の受験履歴がありません。</p>
            )}
          </div>
        </div>

        {/* 合格予測 */}
        <div className="study-card p-6">
          <h3 className="mb-4 text-lg font-bold text-study-ink">🎯 合格予測</h3>
          <div className="text-center mb-4">
            <div className={`text-3xl font-bold ${getScoreColor(stats.passProbability)} mb-2`}>{stats.passProbability.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">現在の合格可能性</div>
          </div>
          <div className="bg-gray-200 rounded-full h-3 mb-4">
            <div className={`h-3 rounded-full ${stats.passProbability > 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${stats.passProbability}%` }}></div>
          </div>
          <div className="text-xs text-gray-600 text-center">
            {stats.passProbability < 85 
              ? `あと${(85 - stats.passProbability).toFixed(0)}%アップで合格圏内！`
              : '素晴らしいです！合格圏内に到達しています。'}
          </div>
        </div>

        {/* 模試開始ボタン */}
        <div className="sticky bottom-24">
          <button
            onClick={handleStartExam}
            className="study-btn text-lg"
          >
            🚀 模試を開始する
          </button>
        </div>
      </div>

      <nav className="study-bottom-nav" aria-label="メインメニュー">
        <div className="study-bottom-nav-inner">
          <Link href="/dashboard" className="study-nav-item">
            <i className="ri-home-line text-xl"></i>
            <span>ホーム</span>
          </Link>
          <Link href="/practice" className="study-nav-item">
            <i className="ri-book-open-line text-xl"></i>
            <span>学習</span>
          </Link>
          <Link href="/mock-exam" className="study-nav-item study-nav-item-active">
            <i className="ri-file-list-3-line text-xl"></i>
            <span>模試</span>
          </Link>
          <Link href="/weak-points" className="study-nav-item">
            <i className="ri-target-line text-xl"></i>
            <span>弱点</span>
          </Link>
          <Link href="/profile" className="study-nav-item">
            <i className="ri-user-line text-xl"></i>
            <span>設定</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
