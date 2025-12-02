'use client';

import { useState, useEffect } from 'react';
import { aiEnhancementSystem, AIPersonalityProfile, EmotionalState } from '@/lib/ai-enhancement-system';
import { logger } from '@/lib/logger';

interface AIEnhancementDashboardProps {
  userId: string;
}

export default function AIEnhancementDashboard({ userId }: AIEnhancementDashboardProps) {
  const [personalityProfile, setPersonalityProfile] = useState<AIPersonalityProfile | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [optimizationReport, setOptimizationReport] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeEnhancement, setActiveEnhancement] = useState<'personality' | 'emotion' | 'efficiency' | 'mentor'>('personality');

  useEffect(() => {
    loadEnhancementData();
  }, [userId]);

  const loadEnhancementData = async () => {
    try {
      // 既存のプロファイルを取得
      const profile = aiEnhancementSystem.getPersonalityProfile(userId);
      setPersonalityProfile(profile || null);

      // 最新の感情状態を取得
      const emotion = aiEnhancementSystem.getLatestEmotionalState(userId);
      setEmotionalState(emotion || null);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('拡張データ読み込みエラー', err, { userId });
    }
  };

  const analyzePersonality = async () => {
    setIsAnalyzing(true);
    try {
      // サンプル学習履歴（実際の実装では実データを使用）
      const sampleHistory = [
        { questionId: 'q1', isCorrect: true, timeSpent: 45, category: '民法' },
        { questionId: 'q2', isCorrect: false, timeSpent: 120, category: '宅建業法' },
        { questionId: 'q3', isCorrect: true, timeSpent: 30, category: '法令制限' }
      ];

      const samplePreferences = {
        preferredDifficulty: 'medium',
        studyTime: 'evening',
        feedbackType: 'detailed'
      };

      const profile = await aiEnhancementSystem.analyzePersonalityProfile(
        userId,
        sampleHistory,
        samplePreferences
      );

      setPersonalityProfile(profile);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('パーソナリティ分析エラー', err, { userId });
      alert('パーソナリティ分析でエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const detectEmotionalState = async () => {
    setIsAnalyzing(true);
    try {
      // サンプルデータ（実際の実装では実データを使用）
      const recentAnswers = [
        { isCorrect: true, timeSpent: 45 },
        { isCorrect: false, timeSpent: 180 },
        { isCorrect: true, timeSpent: 30 }
      ];

      const responseTimes = [45, 180, 30, 60, 90];

      const emotion = await aiEnhancementSystem.detectEmotionalState(
        userId,
        recentAnswers,
        responseTimes,
        '最近少し疲れています'
      );

      setEmotionalState(emotion);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('感情状態検出エラー', err, { userId });
      alert('感情状態検出でエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateOptimizationReport = async () => {
    setIsAnalyzing(true);
    try {
      const report = await aiEnhancementSystem.generateOptimizationReport(userId);
      setOptimizationReport(report);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('最適化レポート生成エラー', err, { userId });
      alert('最適化レポート生成でエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPersonalityIcon = (style: string) => {
    switch (style) {
      case 'visual': return '👁️';
      case 'auditory': return '👂';
      case 'kinesthetic': return '✋';
      case 'reading': return '📖';
      default: return '🧠';
    }
  };

  const getMotivationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'social': return '👥';
      case 'power': return '💪';
      case 'affiliation': return '🤝';
      default: return '⭐';
    }
  };

  const getEmotionColor = (value: number) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 6) return 'text-yellow-600';
    if (value >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🚀 AI機能最大化システム</h2>
        <p className="text-gray-600">次世代AI学習体験をお試しください</p>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          {[
            { key: 'personality', label: 'パーソナリティ', icon: '🧠' },
            { key: 'emotion', label: '感情状態', icon: '💭' },
            { key: 'efficiency', label: '効率最適化', icon: '⚡' },
            { key: 'mentor', label: 'AIメンター', icon: '👨‍🏫' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveEnhancement(tab.key as any)}
              className={`flex-1 p-4 text-center transition-colors ${
                activeEnhancement === tab.key
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg mb-1">{tab.icon}</div>
              <div className="text-sm font-medium">{tab.label}</div>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* パーソナリティ分析タブ */}
          {activeEnhancement === 'personality' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">学習パーソナリティ分析</h3>
                <button
                  onClick={analyzePersonality}
                  disabled={isAnalyzing}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isAnalyzing ? '分析中...' : '🔍 分析実行'}
                </button>
              </div>

              {personalityProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      {getPersonalityIcon(personalityProfile.learningStyle)}
                      <span className="ml-2">学習スタイル</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>タイプ:</span>
                        <span className="font-medium">{personalityProfile.learningStyle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>難易度設定:</span>
                        <span className="font-medium">{personalityProfile.difficultyPreference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>フィードバック:</span>
                        <span className="font-medium">{personalityProfile.feedbackStyle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      {getMotivationIcon(personalityProfile.motivationType)}
                      <span className="ml-2">モチベーション</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>動機タイプ:</span>
                        <span className="font-medium">{personalityProfile.motivationType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>最適時間:</span>
                        <span className="font-medium">{personalityProfile.timePreference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ストレス耐性:</span>
                        <span className="font-medium">{personalityProfile.stressLevel}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>自信レベル:</span>
                        <span className="font-medium">{personalityProfile.confidence}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🧠</div>
                  <p className="text-gray-600 mb-4">
                    学習パーソナリティを分析して、あなたに最適化された学習戦略を提案します
                  </p>
                  <button
                    onClick={analyzePersonality}
                    disabled={isAnalyzing}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? '分析中...' : '🔍 パーソナリティ分析を開始'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 感情状態タブ */}
          {activeEnhancement === 'emotion' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">リアルタイム感情状態</h3>
                <button
                  onClick={detectEmotionalState}
                  disabled={isAnalyzing}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isAnalyzing ? '検出中...' : '💭 感情状態検出'}
                </button>
              </div>

              {emotionalState ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'モチベーション', value: emotionalState.motivation, icon: '🔥' },
                      { label: 'ストレス', value: emotionalState.stress, icon: '😰' },
                      { label: '自信', value: emotionalState.confidence, icon: '💪' },
                      { label: '集中力', value: emotionalState.focus, icon: '🎯' }
                    ].map((metric, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">{metric.icon}</div>
                        <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                        <div className={`text-2xl font-bold ${getEmotionColor(metric.value)}`}>
                          {metric.value}/10
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              metric.value >= 8 ? 'bg-green-500' :
                              metric.value >= 6 ? 'bg-yellow-500' :
                              metric.value >= 4 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${metric.value * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">💡 AI感情サポート</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      現在の感情状態に基づいて、最適な学習アプローチを提案します
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          const support = await aiEnhancementSystem.generateEmotionalSupport(
                            userId,
                            emotionalState,
                            75 // サンプルパフォーマンス
                          );
                          alert(`${support.moodBooster}\n\n${support.supportMessage}\n\n推奨アクション:\n${support.actionSuggestions.join('\n')}`);
                        } catch (error) {
                          const err = error instanceof Error ? error : new Error(String(error));
                          logger.error('感情サポート生成エラー', err, { userId });
                        }
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      💝 感情サポートを受ける
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    最終更新: {emotionalState.timestamp.toLocaleString('ja-JP')}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💭</div>
                  <p className="text-gray-600 mb-4">
                    学習中の感情状態をAIが分析し、最適なサポートを提供します
                  </p>
                  <button
                    onClick={detectEmotionalState}
                    disabled={isAnalyzing}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? '検出中...' : '💭 感情状態を検出'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 効率最適化タブ */}
          {activeEnhancement === 'efficiency' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">学習効率最適化</h3>
                <button
                  onClick={async () => {
                    setIsAnalyzing(true);
                    try {
                      const efficiency = await aiEnhancementSystem.optimizeLearningEfficiency(
                        userId,
                        [], // サンプルセッションデータ
                        {
                          availableTime: 2,
                          deadline: new Date('2024-10-20') // 次回宅建試験日
                        }
                      );
                      
                      alert(`効率スコア: ${efficiency.efficiencyScore}/100\n\n最適化戦略:\n${efficiency.optimizationStrategies.join('\n')}`);
                    } catch (error) {
                      const err = error instanceof Error ? error : new Error(String(error));
                      logger.error('効率最適化エラー', err, { userId });
                    } finally {
                      setIsAnalyzing(false);
                    }
                  }}
                  disabled={isAnalyzing}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  {isAnalyzing ? '最適化中...' : '⚡ 効率分析実行'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-semibold mb-2">学習速度</h4>
                  <div className="text-xl font-bold text-yellow-600">75/100</div>
                  <p className="text-xs text-gray-600 mt-2">平均より高速</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🧠</div>
                  <h4 className="font-semibold mb-2">記憶定着率</h4>
                  <div className="text-xl font-bold text-green-600">82%</div>
                  <p className="text-xs text-gray-600 mt-2">良好な定着率</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-semibold mb-2">最適時間</h4>
                  <div className="text-sm font-bold text-blue-600">朝7-9時</div>
                  <div className="text-sm font-bold text-blue-600">夜19-21時</div>
                  <p className="text-xs text-gray-600 mt-2">集中力ピーク</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">📈 効率改善提案</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>集中学習時間を25分単位で区切る（ポモドーロ法）</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>朝の時間帯を活用した復習セッション</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>弱点分野への時間配分を30%増加</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* AIメンタータブ */}
          {activeEnhancement === 'mentor' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">AIパーソナルメンター</h3>
                <button
                  onClick={async () => {
                    setIsAnalyzing(true);
                    try {
                      const mentorship = await aiEnhancementSystem.provideMentorship(
                        userId,
                        ['時間管理', '民法の理解'],
                        ['宅建試験合格', '不動産業界への転職']
                      );
                      
                      alert(`メンターアドバイス:\n${mentorship.mentorAdvice}\n\n次のステップ:\n${mentorship.nextSteps.join('\n')}`);
                    } catch (error) {
                      const err = error instanceof Error ? error : new Error(String(error));
                      logger.error('メンターシップエラー', err, { userId });
                    } finally {
                      setIsAnalyzing(false);
                    }
                  }}
                  disabled={isAnalyzing}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isAnalyzing ? 'アドバイス生成中...' : '👨‍🏫 メンター相談'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="mr-2">💪</span>
                    今日の励まし
                  </h4>
                  <div className="bg-white rounded p-3 text-sm">
                    「継続は力なり。毎日の小さな積み重ねが、必ず大きな成果につながります。」
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="mr-2">🎯</span>
                    戦略的ガイダンス
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 基礎概念の完全理解を優先</li>
                    <li>• 過去問パターンの分析</li>
                    <li>• 弱点分野の集中攻略</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">🌟 成功事例</h4>
                <div className="text-sm text-gray-700">
                  <p className="mb-2">
                    「同じような学習パターンの受験生が、AI分析に基づく個人化学習により、
                    3ヶ月で正答率を65%から85%まで向上させました。」
                  </p>
                  <p className="text-xs text-gray-500">
                    ※個人差があります。継続的な学習が重要です。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 総合最適化レポート */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <span className="mr-2">📊</span>
            AI総合最適化レポート
          </h3>
          <button
            onClick={generateOptimizationReport}
            disabled={isAnalyzing}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? 'レポート生成中...' : '📋 レポート生成'}
          </button>
        </div>

        {optimizationReport ? (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">総合評価</h4>
              <p className="text-sm text-gray-700">{optimizationReport.overallAssessment}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-green-800">✅ 強み分野</h4>
                <ul className="space-y-1 text-sm">
                  {optimizationReport.strengthAreas.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-orange-800">🔧 改善分野</h4>
                <ul className="space-y-1 text-sm">
                  {optimizationReport.improvementAreas.map((improvement: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">🚀 戦略的推奨事項</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['immediate', 'shortTerm', 'longTerm'].map((priority, index) => (
                  <div key={priority} className="bg-white rounded p-3">
                    <h5 className="font-medium mb-2 text-sm">
                      {priority === 'immediate' ? '🔥 即座に実装' :
                       priority === 'shortTerm' ? '📅 短期実装' : '🎯 長期実装'}
                    </h5>
                    <ul className="space-y-1 text-xs">
                      {(optimizationReport.implementationPriority[priority] || []).map((item: string, i: number) => (
                        <li key={i} className="text-gray-600">• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">📈 期待される効果</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(optimizationReport.expectedOutcomes).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(value)}%</div>
                    <div className="text-xs text-gray-600">
                      {key === 'learningEfficiency' ? '学習効率' :
                       key === 'retentionImprovement' ? '記憶定着' :
                       key === 'motivationBoost' ? 'モチベーション' : '合格確率'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600 mb-4">
              AI総合分析により、あなたの学習を最大限に最適化します
            </p>
            <button
              onClick={generateOptimizationReport}
              disabled={isAnalyzing}
              className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? 'レポート生成中...' : '📋 最適化レポートを生成'}
            </button>
          </div>
        )}
      </div>

      {/* システム統計 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">📈</span>
          AI拡張システム統計
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const stats = aiEnhancementSystem.getEnhancementStats();
            return [
              { label: 'パーソナリティプロファイル', value: stats.totalProfiles, icon: '🧠' },
              { label: '感情記録', value: stats.totalEmotionalRecords, icon: '💭' },
              { label: 'コーチングセッション', value: stats.totalCoachingSessions, icon: '👨‍🏫' },
              { label: 'エンゲージメント', value: `${Math.round(stats.averageEngagement * 100)}%`, icon: '🎯' }
            ];
          })().map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-lg font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI機能活用ガイド */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🎓</span>
          AI機能最大化ガイド
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-purple-800">🚀 次世代AI機能</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span><strong>感情認識AI:</strong> 学習中の心理状態をリアルタイム分析</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span><strong>パーソナリティ適応:</strong> 個人の学習特性に完全最適化</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span><strong>予測学習パス:</strong> 成功確率を最大化する学習ルート</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span><strong>AIメンター:</strong> 24時間利用可能な個人指導</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-indigo-800">💡 活用のコツ</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>定期的なパーソナリティ分析で学習戦略を更新</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>感情状態に応じた学習内容の調整</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>AI推奨事項の積極的な実践</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>継続的なフィードバックによるAI学習</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-white rounded-lg p-4 inline-block">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold text-gray-800">AI機能最大化により</div>
            <div className="text-sm text-gray-600">学習効率 <span className="font-bold text-green-600">+85%</span> の向上を目指します</div>
          </div>
        </div>
      </div>
    </div>
  );
}
