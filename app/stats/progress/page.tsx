'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { requireCachedUserForCurrentAuth } from '@/lib/auth-cache';
import { getDaysUntilExam, takkenExamConfig } from '@/lib/exam-config';
// 分野情報を定義
const categories = [
  { id: 'takkengyouhou', name: '宅建業法', icon: '🏢', target: 18, total: 0 },
  { id: 'minpou', name: '民法等', icon: '⚖️', target: 9, total: 0 },
  { id: 'hourei', name: '法令上の制限', icon: '📋', target: 5, total: 0 },
  { id: 'zeihou', name: '税・その他', icon: '💰', target: 5, total: 0 }
];

export default function Progress() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    requireCachedUserForCurrentAuth<any>(() => router.push('/auth/login'))
      .then((cachedUser) => {
        if (!cancelled && cachedUser) {
          setUser(cachedUser);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const getProgressData = () => {
    if (!user) {
      return {
        overall: {
          totalQuestions: 0,
          correctAnswers: 0,
          studyHours: 0,
          studyDays: 0,
          streak: 0,
          targetDate: takkenExamConfig.examDateLabel
        },
        categories: {
          takkengyouhou: { solved: 0, correct: 0, rate: 0, time: 0 },
          minpou: { solved: 0, correct: 0, rate: 0, time: 0 },
          hourei: { solved: 0, correct: 0, rate: 0, time: 0 },
          zeihou: { solved: 0, correct: 0, rate: 0, time: 0 }
        },
        recentProgress: []
      };
    }

    // 実際のユーザーデータから統計を計算
    const totalStats = user.totalStats || { totalQuestions: 0, totalCorrect: 0, totalStudyTime: 0 };
    const studyHistory = user.studyHistory || [];
    const categoryStats = user.categoryStats || {};
    
    // 分野別統計を実際のデータから計算
    const calculatedCategoryStats = {
      takkengyouhou: {
        solved: categoryStats.takkengyouhou?.totalQuestions || 0,
        correct: categoryStats.takkengyouhou?.correctAnswers || 0,
        rate: 0,
        time: categoryStats.takkengyouhou?.studyTime || 0
      },
      minpou: {
        solved: categoryStats.minpou?.totalQuestions || 0,
        correct: categoryStats.minpou?.correctAnswers || 0,
        rate: 0,
        time: categoryStats.minpou?.studyTime || 0
      },
      hourei: {
        solved: categoryStats.hourei?.totalQuestions || 0,
        correct: categoryStats.hourei?.correctAnswers || 0,
        rate: 0,
        time: categoryStats.hourei?.studyTime || 0
      },
      zeihou: {
        solved: categoryStats.zeihou?.totalQuestions || 0,
        correct: categoryStats.zeihou?.correctAnswers || 0,
        rate: 0,
        time: categoryStats.zeihou?.studyTime || 0
      }
    };

    // 正答率を計算
    Object.keys(calculatedCategoryStats).forEach(key => {
      const category = calculatedCategoryStats[key as keyof typeof calculatedCategoryStats];
      category.rate = category.solved > 0 ? Math.round((category.correct / category.solved) * 100) : 0;
    });

    return {
      overall: {
        totalQuestions: totalStats.totalQuestions,
        correctAnswers: totalStats.totalCorrect,
        studyHours: Math.round(totalStats.totalStudyTime / 60),
        studyDays: studyHistory.length,
        streak: user.streak?.currentStreak || 0,
        targetDate: takkenExamConfig.examDateLabel
      },
      categories: calculatedCategoryStats,
      recentProgress: studyHistory.slice(-7).reverse()
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  const progress = getProgressData();
  const daysUntilExam = getDaysUntilExam();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 w-full z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center">
          <Link href="/stats" className="text-indigo-600 mr-4">
            <i className="ri-arrow-left-line text-2xl"></i>
          </Link>
          <h1 className="text-xl font-extrabold text-indigo-800 tracking-tight">学習進捗</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* 試験までの残り日数 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">📅</div>
            <h2 className="text-2xl font-bold mb-2">試験まであと{daysUntilExam}日</h2>
            <p className="text-sm opacity-90">
              {takkenExamConfig.eraYearLabel} 試験日: {progress.overall.targetDate}（{takkenExamConfig.statusLabel}）
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{progress.overall.totalQuestions}</div>
              <div className="text-xs opacity-80">総問題数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progress.overall.totalQuestions > 0 ? Math.round((progress.overall.correctAnswers / progress.overall.totalQuestions) * 100) : 0}%</div>
              <div className="text-xs opacity-80">正答率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progress.overall.studyHours}h</div>
              <div className="text-xs opacity-80">学習時間</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progress.overall.streak}日</div>
              <div className="text-xs opacity-80">連続学習</div>
            </div>
          </div>
        </div>

        {/* 分野別進捗 */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-extrabold text-lg text-indigo-800 tracking-tight mb-4">📊 分野別進捗</h3>
          <div className="space-y-4">
            {categories.map((category) => {
              const stats = progress.categories[category.id as keyof typeof progress.categories];
              const targetProgress = (stats.correct / (category.target * 5)) * 100; // 目標正解数に対する進捗
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium text-gray-800">{category.name}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {stats.correct}/{category.target * 5}問正解
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        targetProgress >= 100
                          ? 'bg-green-500'
                          : targetProgress >= 70
                          ? 'bg-blue-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(targetProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>目標: {category.target}問/回 × 5回</span>
                    <span>現在の正答率: {stats.rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 最近の学習成果 */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-extrabold text-lg text-indigo-800 tracking-tight mb-4">📈 最近の学習成果</h3>
          <div className="space-y-3">
            {progress.recentProgress.length > 0 ? (
              progress.recentProgress.map((record: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <i className="ri-trophy-line text-indigo-600"></i>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{new Date(record.date).toLocaleDateString('ja-JP')}</div>
                      <div className="text-xs text-gray-500">
                        {record.questionsAnswered}問解答 • {record.sessions}セッション
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-600">
                      {Math.round((record.correctAnswers / record.questionsAnswered) * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {record.studyTimeMinutes}分
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-sm">まだ学習成果がありません</p>
                <p className="text-xs mt-1">学習を始めて成果を記録しましょう！</p>
              </div>
            )}
          </div>
        </div>

        {/* アドバイス */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="font-bold text-lg mb-4">🎯 学習を始めましょう！</h3>
          <div className="space-y-3 text-sm">
            <p>• まずは宅建業法から始めることをおすすめします。最も重要な分野です。</p>
            <p>• 1日30分でも継続することで、確実に力がついていきます。</p>
            <p>• 分からない問題は解説をしっかり読んで、理解を深めましょう！</p>
          </div>
        </div>
      </div>
    </div>
  );
}
