// AI駆動の学習分析システム
import { aiClient } from './ai-client';
import { logger } from './logger';

export interface AnswerPattern {
  questionId: string;
  category: string;
  subcategory: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
  difficulty: number;
  concepts: string[];
}

export interface WeaknessAnalysis {
  category: string;
  subcategory: string;
  errorRate: number;
  commonMistakes: string[];
  suggestedActions: string[];
  priority: 'high' | 'medium' | 'low';
  conceptGaps: string[];
}

export interface LearningInsight {
  type: 'pattern' | 'trend' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  actionable: boolean;
  confidence: number;
  data: any;
}

export class AIAnalyticsService {
  // 誤答パターンを分析
  async analyzeAnswerPatterns(patterns: AnswerPattern[]): Promise<WeaknessAnalysis[]> {
    if (patterns.length === 0) return [];

    // カテゴリ別の誤答率を計算
    const categoryStats = this.calculateCategoryStats(patterns);
    
    // AI分析のためのプロンプトを構築
    const analysisPrompt = this.buildAnalysisPrompt(patterns, categoryStats);
    
    try {
      const aiResponse = await aiClient.chat([
        {
          role: 'system',
          content: `あなたは宅建試験の学習分析専門家です。ユーザーの解答パターンを分析し、弱点と改善策を特定してください。
          
分析観点：
1. 誤答の傾向とパターン
2. 概念理解の欠落
3. 時間配分の問題
4. 難易度別の正答率
5. 学習優先度の提案

回答はJSON形式で、以下の構造で返してください：
{
  "weaknesses": [
    {
      "category": "カテゴリ名",
      "subcategory": "サブカテゴリ名", 
      "errorRate": 数値,
      "commonMistakes": ["よくある間違い1", "よくある間違い2"],
      "suggestedActions": ["改善策1", "改善策2"],
      "priority": "high|medium|low",
      "conceptGaps": ["不足している概念1", "不足している概念2"]
    }
  ]
}`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ], {
        temperature: 0.3,
        maxTokens: 1500
      });

      const analysis = JSON.parse(aiResponse.content);
      return analysis.weaknesses || [];
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('AI分析エラー', err, { patternCount: patterns.length });
      // フォールバック：基本的な統計分析
      return this.generateBasicAnalysis(categoryStats);
    }
  }

  // 学習インサイトを生成
  async generateLearningInsights(
    patterns: AnswerPattern[],
    userProgress: any
  ): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // 1. 学習パターンの分析
    const studyPatternInsight = await this.analyzeStudyPatterns(patterns);
    if (studyPatternInsight) insights.push(studyPatternInsight);

    // 2. 進捗予測
    const progressPrediction = await this.predictProgress(patterns, userProgress);
    if (progressPrediction) insights.push(progressPrediction);

    // 3. 最適化提案
    const optimizationSuggestion = await this.generateOptimizationSuggestion(patterns);
    if (optimizationSuggestion) insights.push(optimizationSuggestion);

    return insights;
  }

  // パーソナライズド問題を生成
  async generatePersonalizedQuestions(
    weaknesses: WeaknessAnalysis[],
    userLevel: number
  ): Promise<any[]> {
    const highPriorityWeaknesses = weaknesses.filter(w => w.priority === 'high');
    
    if (highPriorityWeaknesses.length === 0) return [];

    const questionPrompt = `
弱点分析結果：
${JSON.stringify(highPriorityWeaknesses, null, 2)}

ユーザーレベル：${userLevel}

上記の弱点を克服するための宅建試験問題を3問生成してください。
問題は以下の形式で返してください：

{
  "questions": [
    {
      "id": "generated_q1",
      "category": "カテゴリ",
      "subcategory": "サブカテゴリ",
      "question": "問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctAnswer": 正解番号,
      "explanation": "詳細な解説",
      "difficulty": 難易度(1-5),
      "concepts": ["関連概念1", "関連概念2"],
      "targetWeakness": "対象となる弱点"
    }
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: 'あなたは宅建試験問題の作成専門家です。ユーザーの弱点に特化した効果的な学習問題を生成してください。'
        },
        {
          role: 'user',
          content: questionPrompt
        }
      ], {
        temperature: 0.7,
        maxTokens: 2000
      });

      const generatedQuestions = JSON.parse(response.content);
      return generatedQuestions.questions || [];
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('問題生成エラー', err, { weaknesses: weaknesses.length });
      return [];
    }
  }

  // リアルタイム学習フィードバック
  async generateRealTimeFeedback(
    currentQuestion: any,
    userAnswer: string,
    timeSpent: number,
    previousAnswers: AnswerPattern[]
  ): Promise<{
    encouragement: string;
    hint?: string;
    strategy?: string;
    confidence: number;
  }> {
    const recentPerformance = this.calculateRecentPerformance(previousAnswers);
    
    const feedbackPrompt = `
現在の問題：${currentQuestion.question}
ユーザーの回答：${userAnswer}
正解：${currentQuestion.choices[currentQuestion.correctAnswer - 1]}
解答時間：${timeSpent}秒
最近の正答率：${recentPerformance}%

この状況に基づいて、学習者への適切なフィードバックを生成してください。
以下のJSON形式で返してください：

{
  "encouragement": "励ましの言葉",
  "hint": "ヒント（必要な場合）",
  "strategy": "学習戦略のアドバイス",
  "confidence": 信頼度(0-1)
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: 'あなたは学習者を支援するAIコーチです。建設的で励ましになるフィードバックを提供してください。'
        },
        {
          role: 'user',
          content: feedbackPrompt
        }
      ], {
        temperature: 0.8,
        maxTokens: 500
      });

      return JSON.parse(response.content);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('フィードバック生成エラー', err, {
        questionId: currentQuestion?.id,
        userAnswer,
        timeSpent,
      });
      return {
        encouragement: '頑張っていますね！継続することが一番大切です。',
        confidence: 0.5
      };
    }
  }

  // プライベートメソッド群
  private calculateCategoryStats(patterns: AnswerPattern[]) {
    const stats: { [key: string]: { total: number; correct: number; avgTime: number } } = {};
    
    patterns.forEach(pattern => {
      const key = `${pattern.category}-${pattern.subcategory}`;
      if (!stats[key]) {
        stats[key] = { total: 0, correct: 0, avgTime: 0 };
      }
      stats[key].total++;
      if (pattern.isCorrect) stats[key].correct++;
      stats[key].avgTime += pattern.timeSpent;
    });

    // 平均時間を計算
    Object.keys(stats).forEach(key => {
      stats[key].avgTime = stats[key].avgTime / stats[key].total;
    });

    return stats;
  }

  private buildAnalysisPrompt(patterns: AnswerPattern[], stats: any): string {
    const recentErrors = patterns
      .filter(p => !p.isCorrect)
      .slice(-10)
      .map(p => `問題ID: ${p.questionId}, カテゴリ: ${p.category}, 誤答: ${p.userAnswer}, 正解: ${p.correctAnswer}`)
      .join('\n');

    return `
解答データ分析：
総問題数：${patterns.length}
カテゴリ別統計：
${JSON.stringify(stats, null, 2)}

最近の誤答例：
${recentErrors}

上記のデータを分析して、学習者の弱点と改善策を特定してください。
    `;
  }

  private generateBasicAnalysis(stats: any): WeaknessAnalysis[] {
    const analyses: WeaknessAnalysis[] = [];
    
    Object.entries(stats).forEach(([key, data]: [string, any]) => {
      if (!key || typeof key !== 'string' || !key.includes('-')) {
        return; // Skip invalid keys
      }
      const [category, subcategory] = key.split('-');
      const errorRate = 1 - (data.correct / data.total);
      
      if (errorRate > 0.3) { // 30%以上の誤答率
        analyses.push({
          category,
          subcategory,
          errorRate,
          commonMistakes: ['詳細分析が必要'],
          suggestedActions: ['この分野の基礎を復習してください'],
          priority: errorRate > 0.5 ? 'high' : 'medium',
          conceptGaps: ['AI分析により特定']
        });
      }
    });

    return analyses;
  }

  private async analyzeStudyPatterns(patterns: AnswerPattern[]): Promise<LearningInsight | null> {
    if (patterns.length < 10) return null;

    const timePatterns = this.analyzeTimePatterns(patterns);
    const difficultyProgression = this.analyzeDifficultyProgression(patterns);

    return {
      type: 'pattern',
      title: '学習パターン分析',
      description: `解答時間の傾向: ${timePatterns}、難易度進捗: ${difficultyProgression}`,
      actionable: true,
      confidence: 0.8,
      data: { timePatterns, difficultyProgression }
    };
  }

  private async predictProgress(patterns: AnswerPattern[], userProgress: any): Promise<LearningInsight | null> {
    const recentPerformance = this.calculateRecentPerformance(patterns);
    const trend = this.calculateTrend(patterns);

    return {
      type: 'prediction',
      title: '進捗予測',
      description: `現在の正答率${recentPerformance}%、傾向: ${trend > 0 ? '向上' : '低下'}`,
      actionable: true,
      confidence: 0.7,
      data: { recentPerformance, trend }
    };
  }

  private async generateOptimizationSuggestion(patterns: AnswerPattern[]): Promise<LearningInsight | null> {
    const avgTime = patterns.reduce((sum, p) => sum + p.timeSpent, 0) / patterns.length;
    
    return {
      type: 'recommendation',
      title: '学習最適化提案',
      description: `平均解答時間: ${avgTime.toFixed(1)}秒。時間配分の改善が可能です。`,
      actionable: true,
      confidence: 0.6,
      data: { avgTime }
    };
  }

  private calculateRecentPerformance(patterns: AnswerPattern[]): number {
    const recent = patterns.slice(-20); // 最新20問
    if (recent.length === 0) return 0;
    
    const correct = recent.filter(p => p.isCorrect).length;
    return Math.round((correct / recent.length) * 100);
  }

  private analyzeTimePatterns(patterns: AnswerPattern[]): string {
    const avgTime = patterns.reduce((sum, p) => sum + p.timeSpent, 0) / patterns.length;
    return avgTime > 60 ? '慎重型' : avgTime > 30 ? '標準型' : '速答型';
  }

  private analyzeDifficultyProgression(patterns: AnswerPattern[]): string {
    const recent = patterns.slice(-10);
    const avgDifficulty = recent.reduce((sum, p) => sum + p.difficulty, 0) / recent.length;
    return avgDifficulty > 3 ? '高難易度挑戦中' : avgDifficulty > 2 ? '中級レベル' : '基礎固め中';
  }

  private calculateTrend(patterns: AnswerPattern[]): number {
    if (patterns.length < 10) return 0;
    
    const firstHalf = patterns.slice(0, Math.floor(patterns.length / 2));
    const secondHalf = patterns.slice(Math.floor(patterns.length / 2));
    
    const firstHalfCorrect = firstHalf.filter(p => p.isCorrect).length / firstHalf.length;
    const secondHalfCorrect = secondHalf.filter(p => p.isCorrect).length / secondHalf.length;
    
    return secondHalfCorrect - firstHalfCorrect;
  }
}

export const aiAnalyticsService = new AIAnalyticsService();
