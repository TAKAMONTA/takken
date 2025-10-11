'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { firestoreService } from '@/lib/firestore-service';
import { StudySession } from '@/lib/types';
import { getR7QuestionStats } from '@/lib/data/mock-exam-questions';

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
    const savedUser = localStorage.getItem('takken_rpg_user');
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
          <h1 className="text-xl font-bold text-gray-800">令和7年度予想模試</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-6 space-y-6">
        {/* 令和7年度予想問題情報 */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white">
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
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4 text-gray-800">🏆 模試成績</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.examCount}</div>
              <div className="text-xs text-gray-500">受験回数</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>{stats.averageScore.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">平均得点</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.bestRank}</div>
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

        {/* 令和7年度予想問題の特徴 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-bold text-sm text-blue-800 mb-2">✨ 令和7年度予想問題の特徴</h3>
          <ul className="text-xs text-blue-700 space-y-1">
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
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-800">📊 最近の模試結果</h3>
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
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-800">🎯 合格予測</h3>
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
