'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { learningAnalytics } from '@/lib/analytics';
import { logger } from '@/lib/logger';

const menuItems = [
  { id: 'progress', title: '学習進捗', description: '分野別の進捗を確認', icon: 'ri-line-chart-line', link: '/stats/progress' },
  { id: 'schedule', title: '学習スケジュール', description: '計画と残り時間', icon: 'ri-calendar-2-line', link: '/stats/schedule' },
  { id: 'analysis', title: '弱点分析', description: '間違いやすい分野を特定', icon: 'ri-flask-line', link: '/stats/analysis' },
  { id: 'achievements', title: '実績', description: '獲得したバッジ一覧', icon: 'ri-award-line', link: '/stats/achievements' },
];

export default function Stats() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studyStats, setStudyStats] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('takken_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // 学習統計を取得
      try {
        const analytics = learningAnalytics.getAnalyticsSummary(userData.id);
        setStudyStats(analytics);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to load analytics', err, { userId: userData.id });
        // フォールバック: ユーザーデータから直接統計を計算
        const totalStats = userData.totalStats || { totalQuestions: 0, totalCorrect: 0, totalStudyTime: 0 };
        const categoryStats = userData.categoryStats || {};
        
        // 分野別統計を集計
        let totalCategoryQuestions = 0;
        let totalCategoryCorrect = 0;
        Object.keys(categoryStats).forEach(category => {
          const stats = categoryStats[category];
          if (stats) {
            totalCategoryQuestions += stats.totalQuestions || 0;
            totalCategoryCorrect += stats.correctAnswers || 0;
          }
        });
        
        // より正確な統計を使用（分野別データがある場合はそれを優先）
        const finalTotalQuestions = totalCategoryQuestions > 0 ? totalCategoryQuestions : totalStats.totalQuestions;
        const finalTotalCorrect = totalCategoryCorrect > 0 ? totalCategoryCorrect : totalStats.totalCorrect;
        const accuracy = finalTotalQuestions > 0 ? Math.round((finalTotalCorrect / finalTotalQuestions) * 100) : 0;
        
        setStudyStats({
          totalQuestions: finalTotalQuestions,
          accuracy: accuracy,
          studyTime: Math.round(totalStats.totalStudyTime / 60), // 時間に変換
          streak: userData.streak?.currentStreak || 0,
          categoryBreakdown: categoryStats
        });
      }
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
              <h1 className="text-lg font-medium">分析</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-minimal px-4 pb-24">
        {/* Introduction Section */}
        <section className="section-minimal">
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium mb-2">学習分析</h2>
            <p className="text-minimal">あなたの学習状況を詳しく分析します</p>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="section-minimal">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="card-minimal text-center">
              <div className="text-2xl font-medium mb-1">{studyStats?.streak || user.streak?.currentStreak || 0}</div>
              <div className="text-xs text-muted-foreground">連続学習日数</div>
            </div>
            <div className="card-minimal text-center">
              <div className="text-2xl font-medium mb-1">{studyStats?.totalQuestions || 0}</div>
              <div className="text-xs text-muted-foreground">総問題数</div>
            </div>
            <div className="card-minimal text-center">
              <div className="text-2xl font-medium mb-1">{studyStats?.accuracy || 0}%</div>
              <div className="text-xs text-muted-foreground">正答率</div>
            </div>
            <div className="card-minimal text-center">
              <div className="text-2xl font-medium mb-1">{studyStats?.studyTime || 0}h</div>
              <div className="text-xs text-muted-foreground">学習時間</div>
            </div>
          </div>
        </section>

        {/* Stats Menu - Grid layout inspired by TSDO portfolio */}
        <section className="section-minimal">
          <div className="mb-6">
            <h3 className="text-lg font-medium">詳細分析</h3>
          </div>
          
          <div className="grid-portfolio">
            {menuItems.map((item, index) => (
              <Link key={item.id} href={item.link}>
                <div 
                  className="card-minimal scale-hover fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        <i className={`${item.icon} text-lg text-foreground`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <p className="text-minimal">{item.description}</p>
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

        {/* Recent Activity */}
        <section className="section-minimal">
          <div className="mb-6">
            <h3 className="text-lg font-medium">最近の活動</h3>
          </div>
          
          <div className="card-minimal">
            {user.studyHistory && user.studyHistory.length > 0 ? (
              <div className="space-y-3">
                {user.studyHistory.slice(-5).reverse().map((record: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i className="ri-book-open-line text-purple-600"></i>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{new Date(record.date).toLocaleDateString('ja-JP')}</div>
                        <div className="text-xs text-muted-foreground">
                          {record.questionsAnswered}問解答 • {record.sessions}セッション
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {Math.round((record.correctAnswers / record.questionsAnswered) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {record.studyTimeMinutes}分
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-history-line text-4xl text-muted-foreground mb-4"></i>
                <p className="text-minimal">まだ学習データがありません</p>
                <p className="text-xs text-muted-foreground mt-2">問題を解いて学習を始めましょう</p>
              </div>
            )}
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
            <Link href="/practice" className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-foreground transition-colors">
              <i className="ri-book-open-line text-xl"></i>
              <span className="text-xs font-medium">学習</span>
            </Link>
            <Link href="/stats" className="flex flex-col items-center space-y-1 text-foreground">
              <i className="ri-bar-chart-fill text-xl"></i>
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
