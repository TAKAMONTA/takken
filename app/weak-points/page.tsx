'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const weaknessData: any[] = [];

const studyMethods = [
  {
    id: 'intensive',
    title: '集中特訓',
    icon: '💪',
    description: 'この分野だけを徹底的に学習',
    duration: '30分',
    questions: 10,
    mode: 'focused'
  },
  {
    id: 'mixed',
    title: 'ミックス学習',
    icon: '🎯',
    description: '弱点分野を他分野と混ぜて出題',
    duration: '20分',
    questions: 8,
    mode: 'mixed'
  },
  {
    id: 'explanation',
    title: '解説重視',
    icon: '📚',
    description: '詳細解説で理解を深める',
    duration: '40分',
    questions: 6,
    mode: 'detailed'
  }
];

export default function WeakPoints() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeakness, setSelectedWeakness] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');

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

  const handleStartWeakPointStudy = () => {
    if (!selectedWeakness || !selectedMethod) {
      alert('弱点分野と学習方法を選択してください');
      return;
    }
    
    router.push(`/weak-points/quiz?topic=${selectedWeakness.id}&method=${selectedMethod}`);
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
          <h1 className="text-xl font-bold text-gray-800">弱点克服</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-6 space-y-6">
        {/* 弱点分析サマリー */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">💪</div>
            <h2 className="text-xl font-bold mb-2">弱点克服システム</h2>
            <p className="text-white/90 text-sm">苦手分野を特別対策で克服しよう</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-lg">4</div>
              <div className="opacity-90">弱点分野</div>
            </div>
            <div>
              <div className="font-bold text-lg">54%</div>
              <div className="opacity-90">平均正答率</div>
            </div>
            <div>
              <div className="font-bold text-lg">32</div>
              <div className="opacity-90">要復習問題</div>
            </div>
          </div>
        </div>

        {/* 弱点分野一覧 */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800">🎯 弱点分野を選択</h3>
          <div className="space-y-3">
            {weaknessData.map((weakness) => (
              <div
                key={weakness.id}
                onClick={() => setSelectedWeakness(weakness)}
                className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                  selectedWeakness?.id === weakness.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-red-200 bg-white hover:border-red-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{weakness.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{weakness.topic}</h4>
                      <p className="text-xs text-gray-600 mb-2">{weakness.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{weakness.category}</span>
                        <span>{weakness.difficulty}</span>
                        <span className="text-red-600 font-medium">{weakness.importance}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">{weakness.rate}%</div>
                    <div className="text-xs text-gray-500">{weakness.wrongQuestions}/{weakness.totalQuestions}問不正解</div>
                  </div>
                </div>
                
                {selectedWeakness?.id === weakness.id && (
                  <div className="border-t border-red-200 pt-3 mt-3">
                    <div className="mb-3">
                      <h5 className="text-sm font-bold text-gray-800 mb-2">❌ 主な弱点</h5>
                      <div className="space-y-1">
                        {weakness.weakPoints?.map((point: string, index: number) => (
                          <div key={index} className="text-xs text-gray-700 flex items-start gap-2">
                            <div className="text-red-500 mt-0.5">•</div>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-gray-800 mb-2">💡 学習のコツ</h5>
                      <div className="space-y-1">
                        {weakness.studyTips?.map((tip: string, index: number) => (
                          <div key={index} className="text-xs text-gray-700 flex items-start gap-2">
                            <div className="text-green-500 mt-0.5">•</div>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 学習方法選択 */}
        {selectedWeakness && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800">📖 学習方法を選択</h3>
            <div className="space-y-3">
              {studyMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                    selectedMethod === method.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">{method.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">{method.title}</h4>
                        <p className="text-xs text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-600">{method.questions}問</div>
                      <div className="text-xs text-gray-500">{method.duration}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 設定プレビュー */}
        {selectedWeakness && selectedMethod && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
            <div className="text-center">
              <div className="text-2xl mb-2">🔥</div>
              <h3 className="font-bold text-lg mb-2">弱点克服設定</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-bold">{selectedWeakness.topic}</div>
                  <div className="opacity-80">対象分野</div>
                </div>
                <div>
                  <div className="font-bold">{studyMethods.find(m => m.id === selectedMethod)?.title || '選択中'}</div>
                  <div className="opacity-80">学習方法</div>
                </div>
                <div>
                  <div className="font-bold">+{(studyMethods.find(m => m.id === selectedMethod)?.questions || 0) * 12} XP</div>
                  <div className="opacity-80">獲得予定</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 最近の弱点克服履歴 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-800">📝 最近の克服履歴</h3>
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-sm">まだ克服履歴がありません</p>
              <p className="text-xs mt-1">学習を始めて弱点を克服しましょう！</p>
            </div>
          </div>
        </div>

        {/* 学習開始ボタン */}
        <div className="sticky bottom-20">
          <button
            onClick={handleStartWeakPointStudy}
            disabled={!selectedWeakness || !selectedMethod}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
          >
            {selectedWeakness && selectedMethod 
              ? '💪 弱点克服を開始する' 
              : '分野と方法を選択してください'
            }
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