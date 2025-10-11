// AI機能統合管理システム
import { aiAnalyticsService, AnswerPattern, WeaknessAnalysis, LearningInsight } from './ai-analytics';
import { aiQuestionGenerator, GeneratedQuestion, QuestionGenerationRequest } from './ai-question-generator';
import { aiVoiceAssistant, VoiceInteraction } from './ai-voice-assistant';
import { aiMemoryRetention, MemoryItem, ReviewSession } from './ai-memory-retention';
import { aiExamPredictor, ExamPrediction, PredictionResult } from './ai-exam-predictor';
import { aiClient } from './ai-client';

export interface AISystemStatus {
  analytics: boolean;
  questionGeneration: boolean;
  voiceAssistant: boolean;
  memoryRetention: boolean;
  examPredictor: boolean;
  overallHealth: number;
}

export interface ComprehensiveAnalysis {
  weaknessAnalysis: WeaknessAnalysis[];
  learningInsights: LearningInsight[];
  memoryStats: any;
  examPredictions: PredictionResult[];
  recommendations: string[];
  actionPlan: string[];
}

export interface AILearningSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  type: 'practice' | 'review' | 'voice' | 'adaptive';
  questions: any[];
  generatedQuestions: GeneratedQuestion[];
  voiceInteractions: VoiceInteraction[];
  memoryUpdates: MemoryItem[];
  performance: {
    correctAnswers: number;
    totalQuestions: number;
    averageTime: number;
    improvementAreas: string[];
  };
  aiInsights: string[];
}

export class AIMasterSystemService {
  private activeSessions: Map<string, AILearningSession> = new Map();
  private systemHealth: AISystemStatus = {
    analytics: true,
    questionGeneration: true,
    voiceAssistant: true,
    memoryRetention: true,
    examPredictor: true,
    overallHealth: 1.0
  };

  // 包括的な学習分析
  async performComprehensiveAnalysis(
    userId: string,
    answerPatterns: AnswerPattern[],
    userProgress: any
  ): Promise<ComprehensiveAnalysis> {
    try {
      // 1. 弱点分析
      const weaknessAnalysis = await aiAnalyticsService.analyzeAnswerPatterns(answerPatterns);
      
      // 2. 学習インサイト生成
      const learningInsights = await aiAnalyticsService.generateLearningInsights(
        answerPatterns,
        userProgress
      );

      // 3. 記憶統計
      const memoryStats = aiMemoryRetention.getMemoryStats();

      // 4. 出題予測（次回試験日を仮定）
      const nextExamDate = this.calculateNextExamDate();
      const examPrediction = await aiExamPredictor.generateExamPrediction(nextExamDate);

      // 5. 統合的な推奨事項生成
      const recommendations = await this.generateIntegratedRecommendations(
        weaknessAnalysis,
        learningInsights,
        memoryStats,
        examPrediction.predictions
      );

      // 6. アクションプラン生成
      const actionPlan = await this.generateActionPlan(
        weaknessAnalysis,
        examPrediction.predictions,
        userProgress
      );

      return {
        weaknessAnalysis,
        learningInsights,
        memoryStats,
        examPredictions: examPrediction.predictions,
        recommendations,
        actionPlan
      };

    } catch (error) {
      console.error('包括的分析エラー:', error);
      throw new Error('AI分析システムでエラーが発生しました');
    }
  }

  // 適応型学習セッションの開始
  async startAdaptiveLearningSession(
    userId: string,
    preferences: {
      duration?: number;
      difficulty?: number;
      focusAreas?: string[];
      includeVoice?: boolean;
    }
  ): Promise<AILearningSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // ユーザーの学習履歴を取得
    const answerPatterns = this.getUserAnswerPatterns(userId);
    const weaknesses = await aiAnalyticsService.analyzeAnswerPatterns(answerPatterns);

    // パーソナライズド問題を生成
    const questionRequest: QuestionGenerationRequest = {
      weaknesses,
      userLevel: this.calculateUserLevel(answerPatterns),
      questionCount: Math.floor((preferences.duration || 20) / 2), // 1問2分想定
      focusAreas: preferences.focusAreas
    };

    const generatedQuestions = await aiQuestionGenerator.generatePersonalizedQuestions(questionRequest);

    const session: AILearningSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      type: 'adaptive',
      questions: [],
      generatedQuestions,
      voiceInteractions: [],
      memoryUpdates: [],
      performance: {
        correctAnswers: 0,
        totalQuestions: 0,
        averageTime: 0,
        improvementAreas: []
      },
      aiInsights: []
    };

    this.activeSessions.set(sessionId, session);

    // 音声セッションの場合
    if (preferences.includeVoice) {
      try {
        await aiVoiceAssistant.speak('適応型学習セッションを開始します。頑張りましょう！');
      } catch (error) {
        console.log('音声機能は利用できませんが、セッションを続行します');
      }
    }

    return session;
  }

  // 学習セッションの完了
  async completeSession(
    sessionId: string,
    results: {
      questionId: string;
      userAnswer: string;
      isCorrect: boolean;
      timeSpent: number;
    }[]
  ): Promise<AILearningSession | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    session.endTime = new Date();

    // パフォーマンス計算
    session.performance = {
      correctAnswers: results.filter(r => r.isCorrect).length,
      totalQuestions: results.length,
      averageTime: results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length,
      improvementAreas: []
    };

    // 記憶項目の更新
    results.forEach(result => {
      const quality = result.isCorrect ? 4 : 2; // 簡易評価
      const memoryItem = aiMemoryRetention.addMemoryItem(
        result.questionId,
        '学習概念', // 実際には問題から抽出
        '一般', // 実際にはカテゴリを特定
        quality
      );
      session.memoryUpdates.push(memoryItem);
    });

    // AI洞察の生成
    session.aiInsights = await this.generateSessionInsights(session, results);

    return session;
  }

  // 統合的な推奨事項生成
  private async generateIntegratedRecommendations(
    weaknesses: WeaknessAnalysis[],
    insights: LearningInsight[],
    memoryStats: any,
    predictions: PredictionResult[]
  ): Promise<string[]> {
    const integrationPrompt = `
統合分析データ:

弱点分析:
${JSON.stringify(weaknesses, null, 2)}

学習インサイト:
${JSON.stringify(insights, null, 2)}

記憶統計:
${JSON.stringify(memoryStats, null, 2)}

出題予測:
${JSON.stringify(predictions, null, 2)}

上記の全ての分析結果を統合して、最も効果的な学習推奨事項を7つ提案してください。
優先度の高い順に並べてください。

JSON形式で返してください：
{
  "recommendations": [
    "最優先推奨事項1",
    "推奨事項2",
    "推奨事項3",
    "推奨事項4",
    "推奨事項5",
    "推奨事項6",
    "推奨事項7"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '学習最適化の総合専門家として、複数の分析結果を統合した最適な学習戦略を提案してください。'
        },
        {
          role: 'user',
          content: integrationPrompt
        }
      ], {
        temperature: 0.4,
        maxTokens: 1200
      });

      const result = JSON.parse(response.content);
      return result.recommendations || [];

    } catch (error) {
      console.error('統合推奨事項生成エラー:', error);
      return [
        '弱点分野を重点的に学習してください',
        '定期的な復習を心がけてください',
        '出題予測に基づいて学習計画を調整してください'
      ];
    }
  }

  // アクションプラン生成
  private async generateActionPlan(
    weaknesses: WeaknessAnalysis[],
    predictions: PredictionResult[],
    userProgress: any
  ): Promise<string[]> {
    const planPrompt = `
弱点分析: ${JSON.stringify(weaknesses, null, 2)}
出題予測: ${JSON.stringify(predictions, null, 2)}
ユーザー進捗: ${JSON.stringify(userProgress, null, 2)}

上記を基に、今後2週間の具体的なアクションプランを提案してください。

JSON形式で返してください：
{
  "actionPlan": [
    "今日: 具体的なアクション",
    "明日: 具体的なアクション",
    "今週: 週間目標",
    "来週: 週間目標",
    "継続的: 長期的な取り組み"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '学習計画の専門家として、実行可能で効果的なアクションプランを提案してください。'
        },
        {
          role: 'user',
          content: planPrompt
        }
      ], {
        temperature: 0.5,
        maxTokens: 1000
      });

      const result = JSON.parse(response.content);
      return result.actionPlan || [];

    } catch (error) {
      console.error('アクションプラン生成エラー:', error);
      return [
        '今日: 弱点分野の基礎問題を5問解く',
        '明日: 昨日の復習と新しい分野の学習',
        '今週: 模試を1回受験する',
        '来週: 間違えた問題の徹底復習',
        '継続的: 毎日30分以上の学習を維持'
      ];
    }
  }

  // セッション洞察の生成
  private async generateSessionInsights(
    session: AILearningSession,
    results: any[]
  ): Promise<string[]> {
    const sessionDuration = session.endTime 
      ? (session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60 
      : 0;

    const insightPrompt = `
学習セッション結果:
- セッション時間: ${sessionDuration.toFixed(1)}分
- 正答率: ${(session.performance.correctAnswers / session.performance.totalQuestions * 100).toFixed(1)}%
- 平均解答時間: ${session.performance.averageTime.toFixed(1)}秒
- 生成問題数: ${session.generatedQuestions.length}
- 音声対話数: ${session.voiceInteractions.length}

上記のセッション結果を分析して、学習者への洞察を3つ提供してください。

JSON形式で返してください：
{
  "insights": [
    "洞察1",
    "洞察2", 
    "洞察3"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: 'セッション分析の専門家として、建設的で励ましになる洞察を提供してください。'
        },
        {
          role: 'user',
          content: insightPrompt
        }
      ], {
        temperature: 0.6,
        maxTokens: 600
      });

      const result = JSON.parse(response.content);
      return result.insights || [];

    } catch (error) {
      console.error('セッション洞察生成エラー:', error);
      return ['セッションお疲れ様でした！継続的な学習が重要です。'];
    }
  }

  // システム健全性チェック
  async checkSystemHealth(): Promise<AISystemStatus> {
    const health: AISystemStatus = {
      analytics: true,
      questionGeneration: true,
      voiceAssistant: true,
      memoryRetention: true,
      examPredictor: true,
      overallHealth: 1.0
    };

    try {
      // 各サービスの健全性をチェック
      
      // 分析サービス
      try {
        await aiAnalyticsService.analyzeAnswerPatterns([]);
      } catch (error) {
        health.analytics = false;
      }

      // 音声アシスタント
      const voiceSupport = aiVoiceAssistant.isVoiceSupported();
      health.voiceAssistant = voiceSupport.fullSupport;

      // 全体的な健全性を計算
      const services = [
        health.analytics,
        health.questionGeneration,
        health.voiceAssistant,
        health.memoryRetention,
        health.examPredictor
      ];
      
      health.overallHealth = services.filter(Boolean).length / services.length;

    } catch (error) {
      console.error('システム健全性チェックエラー:', error);
      health.overallHealth = 0.5;
    }

    this.systemHealth = health;
    return health;
  }

  // 学習最適化の提案
  async optimizeLearningPath(
    userId: string,
    currentProgress: any,
    targetExamDate: Date
  ): Promise<{
    optimizedPath: string[];
    timeAllocation: { [area: string]: number };
    milestones: { date: Date; goal: string }[];
    riskMitigation: string[];
  }> {
    const daysUntilExam = Math.floor(
      (targetExamDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const optimizationPrompt = `
ユーザー進捗:
${JSON.stringify(currentProgress, null, 2)}

試験まで残り日数: ${daysUntilExam}日

システム分析結果:
- 記憶統計: ${JSON.stringify(aiMemoryRetention.getMemoryStats(), null, 2)}
- 予測統計: ${JSON.stringify(aiExamPredictor.getPredictionStats(), null, 2)}

上記の情報を基に、最適化された学習パスを提案してください。

JSON形式で返してください：
{
  "optimizedPath": [
    "学習ステップ1",
    "学習ステップ2",
    "学習ステップ3",
    "学習ステップ4",
    "学習ステップ5"
  ],
  "timeAllocation": {
    "分野1": 配分時間(時間),
    "分野2": 配分時間
  },
  "milestones": [
    {"date": "YYYY-MM-DD", "goal": "マイルストーン1"},
    {"date": "YYYY-MM-DD", "goal": "マイルストーン2"}
  ],
  "riskMitigation": [
    "リスク対策1",
    "リスク対策2"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '学習最適化の総合専門家として、データ駆動型の最適化提案を行ってください。'
        },
        {
          role: 'user',
          content: optimizationPrompt
        }
      ], {
        temperature: 0.4,
        maxTokens: 1500
      });

      const result = JSON.parse(response.content);
      
      // 日付文字列をDateオブジェクトに変換
      const milestones = result.milestones?.map((m: any) => ({
        date: new Date(m.date),
        goal: m.goal
      })) || [];

      return {
        optimizedPath: result.optimizedPath || [],
        timeAllocation: result.timeAllocation || {},
        milestones,
        riskMitigation: result.riskMitigation || []
      };

    } catch (error) {
      console.error('学習パス最適化エラー:', error);
      return {
        optimizedPath: ['基礎固め', '応用問題', '模試練習', '弱点克服', '最終確認'],
        timeAllocation: {},
        milestones: [],
        riskMitigation: ['定期的な進捗確認を行う']
      };
    }
  }

  // AI機能の統合ダッシュボードデータ生成
  async generateDashboardData(userId: string): Promise<{
    todayRecommendations: string[];
    urgentActions: string[];
    progressSummary: string;
    nextMilestone: { date: Date; description: string } | null;
    aiInsights: string[];
    systemStatus: AISystemStatus;
  }> {
    const systemStatus = await this.checkSystemHealth();
    const memoryStats = aiMemoryRetention.getMemoryStats();
    const dueItems = aiMemoryRetention.getItemsDueForReview();

    const dashboardPrompt = `
ユーザーID: ${userId}
システム状態: ${JSON.stringify(systemStatus, null, 2)}
記憶統計: ${JSON.stringify(memoryStats, null, 2)}
復習待ち項目数: ${dueItems.length}

上記の情報を基に、今日のダッシュボード情報を生成してください。

JSON形式で返してください：
{
  "todayRecommendations": [
    "今日の推奨アクション1",
    "推奨アクション2",
    "推奨アクション3"
  ],
  "urgentActions": [
    "緊急アクション1",
    "緊急アクション2"
  ],
  "progressSummary": "進捗サマリー（100文字程度）",
  "aiInsights": [
    "AI洞察1",
    "AI洞察2"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: 'ダッシュボード情報生成の専門家として、ユーザーにとって有用で実行可能な情報を提供してください。'
        },
        {
          role: 'user',
          content: dashboardPrompt
        }
      ], {
        temperature: 0.5,
        maxTokens: 1000
      });

      const result = JSON.parse(response.content);

      return {
        todayRecommendations: result.todayRecommendations || [],
        urgentActions: result.urgentActions || [],
        progressSummary: result.progressSummary || '順調に学習が進んでいます',
        nextMilestone: null, // 実装が必要
        aiInsights: result.aiInsights || [],
        systemStatus
      };

    } catch (error) {
      console.error('ダッシュボードデータ生成エラー:', error);
      return {
        todayRecommendations: ['今日の学習を開始しましょう'],
        urgentActions: [],
        progressSummary: '学習を継続してください',
        nextMilestone: null,
        aiInsights: ['継続的な学習が重要です'],
        systemStatus
      };
    }
  }

  // プライベートメソッド群
  private getUserAnswerPatterns(userId: string): AnswerPattern[] {
    // 実際の実装では、データベースから取得
    return [];
  }

  private calculateUserLevel(patterns: AnswerPattern[]): number {
    if (patterns.length === 0) return 1;
    
    const recentPerformance = patterns.slice(-20);
    const correctRate = recentPerformance.filter(p => p.isCorrect).length / recentPerformance.length;
    
    return Math.min(5, Math.max(1, Math.floor(correctRate * 5) + 1));
  }

  private calculateNextExamDate(): Date {
    // 宅建試験は通常10月の第3日曜日
    const currentYear = new Date().getFullYear();
    const examDate = new Date(currentYear, 9, 15); // 10月15日を基準
    
    // 第3日曜日を計算
    const firstSunday = new Date(currentYear, 9, 1);
    while (firstSunday.getDay() !== 0) {
      firstSunday.setDate(firstSunday.getDate() + 1);
    }
    
    const thirdSunday = new Date(firstSunday);
    thirdSunday.setDate(firstSunday.getDate() + 14);
    
    // 既に過ぎている場合は来年
    if (thirdSunday < new Date()) {
      thirdSunday.setFullYear(currentYear + 1);
    }
    
    return thirdSunday;
  }

  // セッション統計
  getSessionStats(): {
    activeSessions: number;
    totalSessions: number;
    averageSessionDuration: number;
    averagePerformance: number;
  } {
    const allSessions = Array.from(this.activeSessions.values());
    const completedSessions = allSessions.filter(s => s.endTime);

    if (completedSessions.length === 0) {
      return {
        activeSessions: allSessions.length,
        totalSessions: 0,
        averageSessionDuration: 0,
        averagePerformance: 0
      };
    }

    const avgDuration = completedSessions.reduce((sum, s) => {
      const duration = s.endTime ? (s.endTime.getTime() - s.startTime.getTime()) / 1000 / 60 : 0;
      return sum + duration;
    }, 0) / completedSessions.length;

    const avgPerformance = completedSessions.reduce((sum, s) => {
      return sum + (s.performance.correctAnswers / s.performance.totalQuestions);
    }, 0) / completedSessions.length;

    return {
      activeSessions: allSessions.filter(s => !s.endTime).length,
      totalSessions: completedSessions.length,
      averageSessionDuration: avgDuration,
      averagePerformance: avgPerformance
    };
  }

  // システム状態の取得
  getSystemStatus(): AISystemStatus {
    return { ...this.systemHealth };
  }

  // アクティブセッションの取得
  getActiveSession(sessionId: string): AILearningSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  // 全セッションの取得
  getAllSessions(): AILearningSession[] {
    return Array.from(this.activeSessions.values());
  }
}

export const aiMasterSystem = new AIMasterSystemService();
