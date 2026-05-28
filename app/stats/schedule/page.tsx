'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { requireCachedUserForCurrentAuth } from '@/lib/auth-cache';
import { getExamMilestones, takkenExamConfig } from '@/lib/exam-config';

const defaultSchedule = {
  weeklyGoals: [
    { day: '月', hours: 2, focus: '宅建業法', completed: false },
    { day: '火', hours: 1.5, focus: '民法', completed: false },
    { day: '水', hours: 2, focus: '法令上の制限', completed: false },
    { day: '木', hours: 1.5, focus: '税・その他', completed: false },
    { day: '金', hours: 2, focus: '宅建業法', completed: false },
    { day: '土', hours: 3, focus: '総合演習', completed: false },
    { day: '日', hours: 3, focus: '模擬試験', completed: false }
  ],
  milestones: getExamMilestones()
};

export default function Schedule() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(defaultSchedule);

  useEffect(() => {
    let cancelled = false;

    requireCachedUserForCurrentAuth<any>(() => router.push('/auth/login'))
      .then((userData) => {
        if (!userData || cancelled) {
          return;
        }

      setUser(userData);

      // ローカルストレージからスケジュールを読み込む
      const savedSchedule = localStorage.getItem('takken_schedule');
      if (savedSchedule) {
          const parsedSchedule = JSON.parse(savedSchedule);
          const savedYear = Number(String(parsedSchedule.milestones?.[0]?.date || '').slice(0, 4));
          if (savedYear === takkenExamConfig.targetYear) {
            setSchedule(parsedSchedule);
          } else {
            localStorage.removeItem('takken_schedule');
          }
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

  const saveSchedule = (newSchedule: typeof defaultSchedule) => {
    setSchedule(newSchedule);
    localStorage.setItem('takken_schedule', JSON.stringify(newSchedule));
  };

  const toggleDayCompletion = (index: number) => {
    const newSchedule = { ...schedule };
    newSchedule.weeklyGoals[index].completed = !newSchedule.weeklyGoals[index].completed;
    saveSchedule(newSchedule);
  };

  const toggleMilestoneCompletion = (index: number) => {
    const newSchedule = { ...schedule };
    newSchedule.milestones[index].completed = !newSchedule.milestones[index].completed;
    saveSchedule(newSchedule);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('ja-JP', { weekday: 'short' }).replace('曜日', '');
  const todaySchedule = schedule.weeklyGoals.find(day => day.day === today);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 w-full z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center">
          <Link href="/stats" className="text-indigo-600 mr-4">
            <i className="ri-arrow-left-line text-2xl"></i>
          </Link>
          <h1 className="text-xl font-extrabold text-indigo-800 tracking-tight">学習スケジュール</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-gray-100">
          <div className="text-sm font-bold text-indigo-800 mb-1">
            {takkenExamConfig.eraYearLabel} {takkenExamConfig.examName}
          </div>
          <div className="text-sm text-gray-700">
            試験日: {takkenExamConfig.examDateLabel}（{takkenExamConfig.statusLabel}）
          </div>
          <div className="text-xs text-gray-500 mt-2">
            申込: {takkenExamConfig.internetApplicationLabel}
          </div>
        </div>

        {/* 今日の学習予定 */}
        {todaySchedule && (
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-lg font-bold mb-4">📝 今日の学習予定</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>目標時間</span>
                <span className="font-bold">{todaySchedule.hours}時間</span>
              </div>
              <div className="flex items-center justify-between">
                <span>重点分野</span>
                <span className="font-bold">{todaySchedule.focus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ステータス</span>
                <span className="font-bold">
                  {todaySchedule.completed ? '✅ 完了' : '🎯 未完了'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 週間スケジュール */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-extrabold text-lg text-indigo-800 tracking-tight mb-4">📅 週間スケジュール</h3>
          <div className="space-y-4">
            {schedule.weeklyGoals.map((day, index) => (
              <div
                key={day.day}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  day.completed
                    ? 'bg-green-50 text-green-900'
                    : day.day === today
                    ? 'bg-blue-50 text-blue-900'
                    : 'bg-gray-50 text-gray-900'
                }`}
                onClick={() => toggleDayCompletion(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    {day.completed ? '✅' : day.day}
                  </div>
                  <div>
                    <div className="font-medium">{day.focus}</div>
                    <div className="text-sm opacity-75">{day.hours}時間</div>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {day.completed ? '完了' : '未完了'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* マイルストーン */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-extrabold text-lg text-indigo-800 tracking-tight mb-4">🎯 マイルストーン</h3>
          <div className="space-y-4">
            {schedule.milestones.map((milestone, index) => {
              const date = new Date(milestone.date);
              const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  key={milestone.title}
                  className={`p-4 rounded-xl transition-colors ${
                    milestone.completed
                      ? 'bg-green-50 text-green-900'
                      : daysUntil <= 7
                      ? 'bg-orange-50 text-orange-900'
                      : 'bg-gray-50 text-gray-900'
                  }`}
                  onClick={() => toggleMilestoneCompletion(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{milestone.title}</div>
                    <div className="text-sm">
                      {milestone.completed ? '✅ 達成' : `あと${daysUntil}日`}
                    </div>
                  </div>
                  <p className="text-sm opacity-75">{milestone.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* アドバイス */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="font-bold text-lg mb-3">💡 スケジュールのポイント</h3>
          <div className="space-y-2 text-sm">
            <p>• 毎日コンスタントに学習時間を確保しましょう</p>
            <p>• 土日は復習と弱点補強の時間に充てましょう</p>
            <p>• 模擬試験は実際の試験と同じ時間帯に受験すると効果的です</p>
          </div>
        </div>
      </div>
    </div>
  );
}
