'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { aiMasterSystem, ComprehensiveAnalysis, AISystemStatus } from '@/lib/ai-master-system';
import { aiMemoryRetention } from '@/lib/ai-memory-retention';
import { aiVoiceAssistant } from '@/lib/ai-voice-assistant';
import { aiEnhancementSystem } from '@/lib/ai-enhancement-system';
import AIRealTimeFeedback from '@/components/AIRealTimeFeedback';
import AIEnhancementDashboard from '@/components/AIEnhancementDashboard';

export default function AIDashboardPage() {
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [systemStatus, setSystemStatus] = useState<AISystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'predictions' | 'voice' | 'enhancement'>('overview');
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);

      // システム状態チェック
      const status = await aiMasterSystem.checkSystemHealth();
      setSystemStatus(status);

      // 音声サポート確認（クライアントサイドでのみ実行）
      if (typeof window !== 'undefined') {
        const voiceSupport = aiVoiceAssistant.isVoiceSupported();
        setVoiceSupported(voiceSupport.fullSupport);
      }

      // 包括的分析実行（サンプルデータで）
      const sampleAnalysis = await aiMasterSystem.performComprehensiveAnalysis(
        'user123',
        [], // 実際にはユーザーの解答パターンを渡す
        { streak: 5, recentPerformance: 75 }
      );
      setAnalysis(sampleAnalysis);

    } catch (error) {
      console.error('ダッシュボード初期化エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceSession = async () => {
    try {
      await aiVoiceAssistant.speak('AI音声アシスタントです。何かご質問はありますか？');
      const interaction = await aiVoiceAssistant.startVoiceSession();
      console.log('音声セッション完了:', interaction);
    } catch (error) {
      console.error('音声セッションエラー:', error);
      alert('音声機能でエラーが発生しました。ブラウザの音声機能を確認してください。');
    }
  };

  const startAdaptiveSession = async () => {
    try {
      const session = await aiMasterSystem.startAdaptiveLearningSession('user123', {
        duration: 20,
        includeVoice: voiceSupported
      });
      
      // 実際の実装では、生成された問題でクイズページに遷移
      console.log('適応型セッション開始:', session);
      alert(`${session.generatedQuestions.length}問のパーソナライズド問題を生成しました！`);
    } catch (error) {
      console.error('適応型セッションエラー:', error);
      alert('セッション開始でエラーが発生しました。');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🤖 AI学習ダッシュボード</h1>
          <p className="text-gray-600">AIがあなたの学習を最大限にサポートします</p>
        </div>

        {/* システム状態表示 */}
        {systemStatus && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              AIシステム状態
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(systemStatus).map(([key, value]) => {
                if (key === 'overallHealth') return null;
                return (
                  <div key={key} className="text-center">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                      value ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div className="text-xs text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">
                システム健全性: {Math.round(systemStatus.overallHealth * 100)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemStatus.overallHealth * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={startAdaptiveSession}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">適応型学習開始</h3>
            <p className="text-sm opacity-90">AIがあなたに最適化された問題を生成</p>
          </button>

          <button
            onClick={startVoiceSession}
            disabled={!voiceSupported}
            className={`p-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
              voiceSupported 
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-xl' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="text-2xl mb-2">🎤</div>
            <h3 className="font-semibold mb-2">音声学習</h3>
            <p className="text-sm opacity-90">
              {voiceSupported ? 'AIと音声で対話学習' : '音声機能未対応'}
            </p>
          </button>

          <Link href="/practice">
            <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-semibold mb-2">通常学習</h3>
              <p className="text-sm opacity-90">従来の問題練習モード</p>
            </button>
          </Link>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            {[
              { key: 'overview', label: '概要', icon: '📊' },
              { key: 'analytics', label: '分析', icon: '🔍' },
              { key: 'predictions', label: '予測', icon: '🔮' },
              { key: 'voice', label: '音声', icon: '🎤' },
              { key: 'enhancement', label: 'AI最大化', icon: '🚀' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 p-4 text-center transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="text-lg mb-1">{tab.icon}</div>
                <div className="text-sm font-medium">{tab.label}</div>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && analysis && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">学習概要</h3>
                
                {/* 推奨事項 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="mr-2">💡</span>
                    AI推奨事項
                  </h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.slice(0, 5).map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* アクションプラン */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="mr-2">📋</span>
                    今後のアクションプラン
                  </h4>
                  <ul className="space-y-2">
                    {analysis.actionPlan.slice(0, 5).map((action, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && analysis && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">詳細分析</h3>
                
                {/* 弱点分析 */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">弱点分析</h4>
                  {analysis.weaknessAnalysis.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.weaknessAnalysis.map((weakness, index) => (
                        <div key={index} className="border-l-4 border-yellow-400 pl-4">
                          <div className="font-medium">{weakness.category} - {weakness.subcategory}</div>
                          <div className="text-sm text-gray-600">
                            誤答率: {(weakness.errorRate * 100).toFixed(1)}% 
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              weakness.priority === 'high' ? 'bg-red-100 text-red-800' :
                              weakness.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {weakness.priority}
                            </span>
                          </div>
                          <div className="text-sm mt-1">
                            改善策: {weakness.suggestedActions.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">十分な学習データがありません。学習を続けて分析データを蓄積しましょう。</p>
                  )}
                </div>

                {/* 学習インサイト */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">学習インサイト</h4>
                  {analysis.learningInsights.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.learningInsights.map((insight, index) => (
                        <div key={index} className="border-l-4 border-purple-400 pl-4">
                          <div className="font-medium">{insight.title}</div>
                          <div className="text-sm text-gray-600">{insight.description}</div>
                          <div className="text-xs text-purple-600 mt-1">
                            信頼度: {Math.round(insight.confidence * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">学習データを蓄積中です。</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'predictions' && analysis && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">出題予測</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.examPredictions.map((prediction, index) => (
                    <div key={index} className="bg-indigo-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{prediction.category}</h4>
                        <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                          {Math.round(prediction.probability * 100)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {prediction.subcategory}
                      </div>
                      <div className="text-sm mb-3">{prediction.reasoning}</div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>推奨学習時間: {prediction.recommendedStudyTime}h</span>
                        <span>難易度: {prediction.difficulty}/5</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-gray-600 mb-1">重要トピック:</div>
                        <div className="flex flex-wrap gap-1">
                          {prediction.keyTopics.map((topic, i) => (
                            <span key={i} className="text-xs bg-white px-2 py-1 rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">音声AI機能</h3>
                
                {voiceSupported ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <span className="mr-2">✅</span>
                        音声機能利用可能
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        ブラウザの音声認識と音声合成機能が利用できます。
                      </p>
                      
                      <div className="space-y-3">
                        <button
                          onClick={startVoiceSession}
                          className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          🎤 音声対話を開始
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button
                            onClick={() => aiVoiceAssistant.speak('これは音声テストです。')}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                          >
                            🔊 音声テスト
                          </button>
                          
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              const voices = aiVoiceAssistant.getAvailableVoices();
                              alert(`利用可能な音声: ${voices.length}個`);
                            }
                          }}
                          className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition-colors"
                        >
                          🎵 音声設定
                        </button>
                        </div>
                      </div>
                    </div>

                    {/* 音声統計 */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">音声学習統計</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">総対話数</div>
                          <div className="font-semibold">
                            {typeof window !== 'undefined' ? aiVoiceAssistant.getVoiceStats().totalInteractions : 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">平均時間</div>
                          <div className="font-semibold">
                            {typeof window !== 'undefined' ? aiVoiceAssistant.getVoiceStats().averageDuration.toFixed(1) : '0.0'}秒
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <span className="mr-2">❌</span>
                      音声機能未対応
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      お使いのブラウザまたはデバイスでは音声機能がサポートされていません。
                    </p>
                    <div className="text-xs text-gray-500">
                      <p>• Chrome、Edge、Safari（最新版）をお試しください</p>
                      <p>• マイクの使用許可が必要です</p>
                      <p>• HTTPS接続が必要です</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'enhancement' && (
              <AIEnhancementDashboard userId="user123" />
            )}
          </div>
        </div>

        {/* 記憶定着状況 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🧠</span>
            記憶定着状況
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(() => {
              const stats = aiMemoryRetention.getMemoryStats();
              return [
                { label: '学習項目数', value: stats.totalItems, color: 'blue' },
                { label: '復習待ち', value: stats.dueForReview, color: 'orange' },
                { label: '記憶強度', value: `${Math.round(stats.averageStrength * 100)}%`, color: 'green' },
                { label: '最強分野', value: stats.strongestCategory || 'データなし', color: 'purple' }
              ];
            })().map((stat, index) => (
              <div key={index} className={`bg-${stat.color}-50 rounded-lg p-4 text-center`}>
                <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <Link href="/stats">
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                詳細統計を見る
              </button>
            </Link>
          </div>
        </div>

        {/* AI機能説明 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            AI機能の特徴
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: '誤答パターン分析',
                description: 'あなたの間違いの傾向をAIが深層分析し、効果的な改善策を提案',
                icon: '🔍',
                color: 'blue'
              },
              {
                title: 'パーソナライズド問題生成',
                description: '弱点に特化した問題をAIが自動生成。あなただけの学習コンテンツ',
                icon: '🎯',
                color: 'purple'
              },
              {
                title: 'リアルタイムフィードバック',
                description: '解答中にAIがリアルタイムでヒントと励ましを提供',
                icon: '⚡',
                color: 'yellow'
              },
              {
                title: '音声対話学習',
                description: 'AIと音声で対話しながら学習。ハンズフリーで効率的',
                icon: '🎤',
                color: 'green'
              },
              {
                title: '記憶定着最適化',
                description: '忘却曲線に基づく最適な復習タイミングをAIが計算',
                icon: '🧠',
                color: 'indigo'
              },
              {
                title: '出題予測システム',
                description: '過去の傾向から次回試験の重点分野をAIが予測',
                icon: '🔮',
                color: 'pink'
              }
            ].map((feature, index) => (
              <div key={index} className={`bg-${feature.color}-50 rounded-lg p-4`}>
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="text-center text-gray-500 text-sm">
          <p>AI機能は継続的に改善されています。フィードバックをお聞かせください。</p>
        </div>
      </div>
    </div>
  );
}
