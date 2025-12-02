// AI駆動の出題予測システム
import { aiClient } from './ai-client';
import { logger } from './logger';

export interface ExamTrend {
  year: number;
  category: string;
  subcategory: string;
  questionCount: number;
  difficulty: number;
  topics: string[];
  importance: number;
}

export interface PredictionResult {
  category: string;
  subcategory: string;
  probability: number;
  confidence: number;
  reasoning: string;
  recommendedStudyTime: number;
  keyTopics: string[];
  difficulty: number;
}

export interface ExamPrediction {
  examDate: Date;
  predictions: PredictionResult[];
  overallConfidence: number;
  trendAnalysis: string;
  studyStrategy: string[];
  lastUpdated: Date;
}

export class AIExamPredictorService {
  private examTrends: ExamTrend[] = [];
  private predictions: Map<string, ExamPrediction> = new Map();

  // 過去の出題傾向データの追加
  addExamTrend(trend: ExamTrend): void {
    this.examTrends.push(trend);
  }

  // 出題予測の生成
  async generateExamPrediction(examDate: Date): Promise<ExamPrediction> {
    const trendAnalysis = this.analyzeTrends();
    const predictions = await this.predictQuestionDistribution(examDate, trendAnalysis);

    const prediction: ExamPrediction = {
      examDate,
      predictions,
      overallConfidence: this.calculateOverallConfidence(predictions),
      trendAnalysis: await this.generateTrendAnalysis(trendAnalysis),
      studyStrategy: await this.generateStudyStrategy(predictions),
      lastUpdated: new Date()
    };

    this.predictions.set(examDate.toISOString(), prediction);
    return prediction;
  }

  // 出題傾向の分析
  private analyzeTrends(): {
    categoryTrends: { [category: string]: number[] };
    difficultyTrends: { [category: string]: number[] };
    topicFrequency: { [topic: string]: number };
    cyclicalPatterns: { [category: string]: number };
  } {
    const categoryTrends: { [category: string]: number[] } = {};
    const difficultyTrends: { [category: string]: number[] } = {};
    const topicFrequency: { [topic: string]: number } = {};
    const cyclicalPatterns: { [category: string]: number } = {};

    // 過去5年のデータを分析
    const recentTrends = this.examTrends.filter(trend => 
      trend.year >= new Date().getFullYear() - 5
    );

    recentTrends.forEach(trend => {
      // カテゴリ別出題数の傾向
      if (!categoryTrends[trend.category]) {
        categoryTrends[trend.category] = [];
      }
      categoryTrends[trend.category].push(trend.questionCount);

      // 難易度の傾向
      if (!difficultyTrends[trend.category]) {
        difficultyTrends[trend.category] = [];
      }
      difficultyTrends[trend.category].push(trend.difficulty);

      // トピック頻度
      trend.topics.forEach(topic => {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      });

      // 周期的パターン
      cyclicalPatterns[trend.category] = (cyclicalPatterns[trend.category] || 0) + trend.importance;
    });

    return {
      categoryTrends,
      difficultyTrends,
      topicFrequency,
      cyclicalPatterns
    };
  }

  // 問題配分の予測
  private async predictQuestionDistribution(
    examDate: Date,
    trendAnalysis: any
  ): Promise<PredictionResult[]> {
    const predictionPrompt = `
出題傾向分析結果:
${JSON.stringify(trendAnalysis, null, 2)}

予測対象試験日: ${examDate.toLocaleDateString('ja-JP')}
現在日: ${new Date().toLocaleDateString('ja-JP')}

上記の傾向分析を基に、次回宅建試験の出題予測を行ってください。
以下の観点で分析してください：

1. 各カテゴリの出題数予測
2. 重点分野の特定
3. 難易度予測
4. 新傾向の可能性
5. 法改正の影響

JSON形式で返してください：
{
  "predictions": [
    {
      "category": "カテゴリ名",
      "subcategory": "サブカテゴリ名",
      "probability": 出題確率(0-1),
      "confidence": 予測信頼度(0-1),
      "reasoning": "予測根拠",
      "recommendedStudyTime": 推奨学習時間(時間),
      "keyTopics": ["重要トピック1", "トピック2"],
      "difficulty": 予測難易度(1-5)
    }
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: `あなたは宅建試験の出題傾向分析の専門家です。過去のデータを基に、科学的で論理的な予測を行ってください。

分析観点：
1. 統計的傾向の継続性
2. 法改正の影響
3. 社会情勢の反映
4. 出題委員の傾向
5. 受験者の理解度向上に応じた難易度調整`
        },
        {
          role: 'user',
          content: predictionPrompt
        }
      ], {
        temperature: 0.4,
        maxTokens: 2000
      });

      const result = JSON.parse(response.content);
      return result.predictions || [];

    } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
      logger.error('出題予測エラー', err);
      return this.generateDefaultPredictions();
    }
  }

  // 法改正影響の分析
  async analyzeLegalChangeImpact(
    legalChanges: string[],
    examDate: Date
  ): Promise<{
    impactedCategories: string[];
    newTopics: string[];
    priorityAdjustments: { [category: string]: number };
    studyRecommendations: string[];
  }> {
    const analysisPrompt = `
法改正情報:
${legalChanges.join('\n')}

試験日: ${examDate.toLocaleDateString('ja-JP')}

上記の法改正が宅建試験に与える影響を分析してください。
以下のJSON形式で返してください：

{
  "impactedCategories": ["影響を受けるカテゴリ1", "カテゴリ2"],
  "newTopics": ["新出題トピック1", "トピック2"],
  "priorityAdjustments": {
    "カテゴリ1": 重要度調整値(-1から1),
    "カテゴリ2": 重要度調整値
  },
  "studyRecommendations": [
    "法改正対応の学習アドバイス1",
    "アドバイス2",
    "アドバイス3"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '宅建法制度と試験制度の専門家として、法改正が試験に与える影響を分析してください。'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ], {
        temperature: 0.3,
        maxTokens: 1200
      });

      return JSON.parse(response.content);

    } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
      logger.error('法改正影響分析エラー', err);
      return {
        impactedCategories: [],
        newTopics: [],
        priorityAdjustments: {},
        studyRecommendations: ['法改正情報を定期的に確認してください']
      };
    }
  }

  // 個人化された出題予測
  async generatePersonalizedPrediction(
    userWeaknesses: string[],
    userStrengths: string[],
    studyTimeRemaining: number
  ): Promise<{
    priorityAreas: string[];
    timeAllocation: { [area: string]: number };
    riskAreas: string[];
    confidenceBoostAreas: string[];
    strategicAdvice: string[];
  }> {
    const personalizedPrompt = `
ユーザープロファイル:
- 弱点分野: ${userWeaknesses.join(', ')}
- 得意分野: ${userStrengths.join(', ')}
- 残り学習時間: ${studyTimeRemaining}時間

一般的な出題予測:
${JSON.stringify(Array.from(this.predictions.values())[0]?.predictions || [], null, 2)}

上記の情報を基に、このユーザーに特化した学習戦略を提案してください。

JSON形式で返してください：
{
  "priorityAreas": ["最優先学習分野1", "分野2", "分野3"],
  "timeAllocation": {
    "分野1": 配分時間(時間),
    "分野2": 配分時間
  },
  "riskAreas": ["リスクの高い分野1", "分野2"],
  "confidenceBoostAreas": ["自信向上可能分野1", "分野2"],
  "strategicAdvice": [
    "戦略的アドバイス1",
    "アドバイス2",
    "アドバイス3"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '個人化学習戦略の専門家として、ユーザーの状況に最適化された学習計画を提案してください。'
        },
        {
          role: 'user',
          content: personalizedPrompt
        }
      ], {
        temperature: 0.5,
        maxTokens: 1500
      });

      return JSON.parse(response.content);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('個人化予測エラー', err, { 
        weaknessCount: userWeaknesses.length,
        strengthCount: userStrengths.length 
      });
      return {
        priorityAreas: userWeaknesses.slice(0, 3),
        timeAllocation: {},
        riskAreas: userWeaknesses,
        confidenceBoostAreas: userStrengths,
        strategicAdvice: ['弱点分野を重点的に学習してください']
      };
    }
  }

  // 直前期対策の生成
  async generateLastMinuteStrategy(
    daysUntilExam: number,
    userReadiness: number
  ): Promise<{
    dailyPlan: { [day: number]: string[] };
    focusAreas: string[];
    avoidAreas: string[];
    mentalPreparation: string[];
    emergencyTopics: string[];
  }> {
    const strategyPrompt = `
試験まで残り日数: ${daysUntilExam}日
ユーザー準備度: ${(userReadiness * 100).toFixed(1)}%

上記の状況を基に、試験直前期の最適な学習戦略を提案してください。

JSON形式で返してください：
{
  "dailyPlan": {
    "1": ["1日目の学習内容1", "内容2"],
    "2": ["2日目の学習内容1", "内容2"]
  },
  "focusAreas": ["集中すべき分野1", "分野2"],
  "avoidAreas": ["避けるべき分野1", "分野2"],
  "mentalPreparation": ["メンタル準備1", "準備2"],
  "emergencyTopics": ["最低限押さえるべきトピック1", "トピック2"]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '試験直前対策の専門家として、限られた時間で最大の効果を得る戦略を提案してください。'
        },
        {
          role: 'user',
          content: strategyPrompt
        }
      ], {
        temperature: 0.4,
        maxTokens: 1500
      });

      return JSON.parse(response.content);

    } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
      logger.error('直前期戦略生成エラー', err, { daysUntilExam });
      return {
        dailyPlan: {},
        focusAreas: ['宅建業法', '権利関係'],
        avoidAreas: ['新しい分野'],
        mentalPreparation: ['十分な睡眠を取る', '自信を持つ'],
        emergencyTopics: ['基本的な条文', '重要判例']
      };
    }
  }

  // プライベートメソッド群
  private calculateOverallConfidence(predictions: PredictionResult[]): number {
    if (predictions.length === 0) return 0;
    return predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
  }

  private async generateTrendAnalysis(trendData: any): Promise<string> {
    const analysisPrompt = `
出題傾向データ:
${JSON.stringify(trendData, null, 2)}

上記のデータを基に、宅建試験の出題傾向について200文字程度で分析結果をまとめてください。
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '試験傾向分析の専門家として、簡潔で分かりやすい分析を提供してください。'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ], {
        temperature: 0.4,
        maxTokens: 300
      });

      return response.content;

    } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
      logger.error('傾向分析生成エラー', err);
      return '過去の傾向を基に、バランスの取れた学習を推奨します。';
    }
  }

  private async generateStudyStrategy(predictions: PredictionResult[]): Promise<string[]> {
    const strategyPrompt = `
出題予測結果:
${JSON.stringify(predictions, null, 2)}

上記の予測を基に、効果的な学習戦略を5つ提案してください。

JSON形式で返してください：
{
  "strategies": [
    "戦略1",
    "戦略2",
    "戦略3",
    "戦略4",
    "戦略5"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '学習戦略の専門家として、予測結果に基づく効果的な学習方法を提案してください。'
        },
        {
          role: 'user',
          content: strategyPrompt
        }
      ], {
        temperature: 0.5,
        maxTokens: 800
      });

      const result = JSON.parse(response.content);
      return result.strategies || [];

    } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
      logger.error('学習戦略生成エラー', err, { predictions });
      return [
        '高確率分野を重点的に学習する',
        'バランスの取れた学習を心がける',
        '過去問を活用して傾向を把握する'
      ];
    }
  }

  private generateDefaultPredictions(): PredictionResult[] {
    const categories = [
      { name: '権利関係', probability: 0.8, topics: ['民法', '借地借家法', '区分所有法'] },
      { name: '宅建業法', probability: 0.9, topics: ['免許制度', '媒介契約', '重要事項説明'] },
      { name: '法令上の制限', probability: 0.7, topics: ['都市計画法', '建築基準法', '土地区画整理法'] },
      { name: '税・その他', probability: 0.6, topics: ['不動産取得税', '固定資産税', '地価公示法'] }
    ];

    return categories.map(cat => ({
      category: cat.name,
      subcategory: '一般',
      probability: cat.probability,
      confidence: 0.7,
      reasoning: '過去の傾向に基づく予測',
      recommendedStudyTime: Math.round(cat.probability * 20),
      keyTopics: cat.topics,
      difficulty: 3
    }));
  }

  // 予測精度の評価
  async evaluatePredictionAccuracy(
    actualExamResults: { category: string; questionCount: number; topics: string[] }[]
  ): Promise<{
    accuracy: number;
    categoryAccuracy: { [category: string]: number };
    improvements: string[];
  }> {
    const evaluationPrompt = `
予測結果:
${JSON.stringify(Array.from(this.predictions.values())[0]?.predictions || [], null, 2)}

実際の試験結果:
${JSON.stringify(actualExamResults, null, 2)}

予測精度を評価し、改善点を特定してください。

JSON形式で返してください：
{
  "accuracy": 全体精度(0-1),
  "categoryAccuracy": {
    "カテゴリ1": 精度(0-1),
    "カテゴリ2": 精度(0-1)
  },
  "improvements": [
    "改善点1",
    "改善点2",
    "改善点3"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '予測精度評価の専門家として、客観的な分析と改善提案を行ってください。'
        },
        {
          role: 'user',
          content: evaluationPrompt
        }
      ], {
        temperature: 0.3,
        maxTokens: 1000
      });

      return JSON.parse(response.content);

    } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
      logger.error('予測精度評価エラー', err);
      return {
        accuracy: 0.5,
        categoryAccuracy: {},
        improvements: ['より多くのデータが必要です']
      };
    }
  }

  // 緊急対策問題の生成
  async generateEmergencyQuestions(
    daysUntilExam: number,
    weakAreas: string[]
  ): Promise<any[]> {
    const emergencyPrompt = `
試験まで残り: ${daysUntilExam}日
弱点分野: ${weakAreas.join(', ')}

試験直前期に最低限押さえるべき重要問題を5問生成してください。
基本的で確実に得点できる問題を中心に作成してください。

JSON形式で返してください：
{
  "questions": [
    {
      "category": "カテゴリ",
      "question": "基本的な問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctAnswer": 正解番号,
      "explanation": "簡潔な解説",
      "importance": "重要度(high/medium/low)",
      "timeToSolve": 推奨解答時間(秒)
    }
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '試験直前対策の専門家として、確実に得点できる重要問題を生成してください。'
        },
        {
          role: 'user',
          content: emergencyPrompt
        }
      ], {
        temperature: 0.3,
        maxTokens: 2000
      });

      const result = JSON.parse(response.content);
      return result.questions || [];

    } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
      logger.error('緊急対策問題生成エラー', err, { weakAreas });
      return [];
    }
  }

  // 統計情報の取得
  getPredictionStats(): {
    totalPredictions: number;
    averageConfidence: number;
    mostPredictedCategory: string;
    lastPredictionDate?: Date;
  } {
    const predictions = Array.from(this.predictions.values());
    
    if (predictions.length === 0) {
      return {
        totalPredictions: 0,
        averageConfidence: 0,
        mostPredictedCategory: ''
      };
    }

    const avgConfidence = predictions.reduce((sum, p) => sum + p.overallConfidence, 0) / predictions.length;
    
    // 最も予測されたカテゴリを計算
    const categoryCount: { [category: string]: number } = {};
    predictions.forEach(prediction => {
      prediction.predictions.forEach(p => {
        categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
      });
    });

    const mostPredicted = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    return {
      totalPredictions: predictions.length,
      averageConfidence: avgConfidence,
      mostPredictedCategory: mostPredicted,
      lastPredictionDate: predictions[predictions.length - 1]?.lastUpdated
    };
  }

  // 予測データの取得
  getPrediction(examDate: Date): ExamPrediction | undefined {
    return this.predictions.get(examDate.toISOString());
  }

  // 全予測データの取得
  getAllPredictions(): ExamPrediction[] {
    return Array.from(this.predictions.values());
  }
}

export const aiExamPredictor = new AIExamPredictorService();
