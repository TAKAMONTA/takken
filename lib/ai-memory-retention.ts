// AI駆動の記憶定着アルゴリズム
import { aiClient } from './ai-client';
import { logger } from './logger';

export interface MemoryItem {
  id: string;
  questionId: string;
  concept: string;
  category: string;
  initialLearningDate: Date;
  lastReviewDate: Date;
  nextReviewDate: Date;
  repetitionCount: number;
  easinessFactor: number;
  interval: number;
  quality: number; // 0-5の評価
  strength: number; // 記憶の強度 0-1
}

export interface ReviewSession {
  id: string;
  items: MemoryItem[];
  startTime: Date;
  endTime?: Date;
  performance: number;
  aiRecommendations: string[];
}

export interface RetentionAnalysis {
  overallRetention: number;
  categoryRetention: { [category: string]: number };
  forgettingCurve: { day: number; retention: number }[];
  optimalReviewTiming: number[];
  recommendations: string[];
}

export class AIMemoryRetentionService {
  private memoryItems: Map<string, MemoryItem> = new Map();
  private reviewSessions: ReviewSession[] = [];

  // 新しい学習項目の追加
  addMemoryItem(
    questionId: string,
    concept: string,
    category: string,
    initialQuality: number
  ): MemoryItem {
    const item: MemoryItem = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionId,
      concept,
      category,
      initialLearningDate: new Date(),
      lastReviewDate: new Date(),
      nextReviewDate: this.calculateNextReviewDate(new Date(), 1, 2.5),
      repetitionCount: 0,
      easinessFactor: 2.5,
      interval: 1,
      quality: initialQuality,
      strength: this.calculateInitialStrength(initialQuality)
    };

    this.memoryItems.set(item.id, item);
    return item;
  }

  // 復習結果の更新（SM-2アルゴリズムベース）
  updateMemoryItem(itemId: string, quality: number): MemoryItem | null {
    const item = this.memoryItems.get(itemId);
    if (!item) return null;

    const updatedItem = { ...item };
    updatedItem.lastReviewDate = new Date();
    updatedItem.repetitionCount++;
    updatedItem.quality = quality;

    // SM-2アルゴリズムによる計算
    if (quality >= 3) {
      // 正解の場合
      if (updatedItem.repetitionCount === 1) {
        updatedItem.interval = 1;
      } else if (updatedItem.repetitionCount === 2) {
        updatedItem.interval = 6;
      } else {
        updatedItem.interval = Math.round(updatedItem.interval * updatedItem.easinessFactor);
      }
    } else {
      // 不正解の場合
      updatedItem.repetitionCount = 0;
      updatedItem.interval = 1;
    }

    // 容易度係数の更新
    updatedItem.easinessFactor = Math.max(1.3, 
      updatedItem.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // 記憶強度の更新
    updatedItem.strength = this.calculateMemoryStrength(updatedItem, quality);

    // 次回復習日の計算
    updatedItem.nextReviewDate = this.calculateNextReviewDate(
      updatedItem.lastReviewDate,
      updatedItem.interval,
      updatedItem.easinessFactor
    );

    this.memoryItems.set(itemId, updatedItem);
    return updatedItem;
  }

  // 今日復習すべき項目の取得
  getItemsDueForReview(): MemoryItem[] {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 今日の終わりまで

    return Array.from(this.memoryItems.values())
      .filter(item => item.nextReviewDate <= today)
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime());
  }

  // AI駆動の復習最適化
  async optimizeReviewSchedule(userId: string): Promise<{
    recommendedItems: MemoryItem[];
    optimalTiming: string;
    sessionDuration: number;
    aiInsights: string[];
  }> {
    const dueItems = this.getItemsDueForReview();
    const retentionAnalysis = await this.analyzeRetentionPatterns();

    const optimizationPrompt = `
復習対象項目数: ${dueItems.length}
記憶定着分析:
${JSON.stringify(retentionAnalysis, null, 2)}

現在時刻: ${new Date().toLocaleString('ja-JP')}

上記の情報を基に、最適な復習スケジュールを提案してください。
以下のJSON形式で返してください：

{
  "recommendedItems": "推奨復習項目数",
  "optimalTiming": "最適な復習時間帯",
  "sessionDuration": "推奨セッション時間（分）",
  "aiInsights": ["洞察1", "洞察2", "洞察3"],
  "priorityOrder": ["高優先度カテゴリ1", "カテゴリ2"]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '記憶科学と学習最適化の専門家として、効果的な復習スケジュールを提案してください。'
        },
        {
          role: 'user',
          content: optimizationPrompt
        }
      ], {
        temperature: 0.4,
        maxTokens: 800
      });

      const optimization = JSON.parse(response.content);
      
      return {
        recommendedItems: dueItems.slice(0, optimization.recommendedItems || 10),
        optimalTiming: optimization.optimalTiming || '朝の時間帯',
        sessionDuration: optimization.sessionDuration || 20,
        aiInsights: optimization.aiInsights || []
      };

    } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
      logger.error('復習最適化エラー', err, { userId });
      return {
        recommendedItems: dueItems.slice(0, 10),
        optimalTiming: '朝の時間帯',
        sessionDuration: 20,
        aiInsights: ['基本的な復習スケジュールを適用しています']
      };
    }
  }

  // 記憶定着パターンの分析
  async analyzeRetentionPatterns(): Promise<RetentionAnalysis> {
    const items = Array.from(this.memoryItems.values());
    
    if (items.length === 0) {
      return {
        overallRetention: 0,
        categoryRetention: {},
        forgettingCurve: [],
        optimalReviewTiming: [],
        recommendations: ['学習データが不足しています']
      };
    }

    // 全体的な記憶定着率
    const overallRetention = items.reduce((sum, item) => sum + item.strength, 0) / items.length;

    // カテゴリ別記憶定着率
    const categoryRetention: { [category: string]: number } = {};
    const categoryGroups = this.groupByCategory(items);
    
    Object.entries(categoryGroups).forEach(([category, categoryItems]) => {
      categoryRetention[category] = categoryItems.reduce((sum, item) => sum + item.strength, 0) / categoryItems.length;
    });

    // 忘却曲線の計算
    const forgettingCurve = this.calculateForgettingCurve(items);

    // 最適復習タイミングの計算
    const optimalReviewTiming = this.calculateOptimalReviewTiming(items);

    // AI分析による推奨事項
    const recommendations = await this.generateRetentionRecommendations(
      overallRetention,
      categoryRetention,
      forgettingCurve
    );

    return {
      overallRetention,
      categoryRetention,
      forgettingCurve,
      optimalReviewTiming,
      recommendations
    };
  }

  // 個人化された忘却曲線の予測
  async predictPersonalForgettingCurve(
    concept: string,
    userHistory: MemoryItem[]
  ): Promise<{ day: number; predictedRetention: number }[]> {
    const similarItems = userHistory.filter(item => 
      item.concept.includes(concept) || item.category === concept
    );

    if (similarItems.length < 3) {
      // デフォルトの忘却曲線を返す
      return this.getDefaultForgettingCurve();
    }

    const analysisPrompt = `
概念: ${concept}
類似学習履歴:
${JSON.stringify(similarItems.map(item => ({
  concept: item.concept,
  repetitionCount: item.repetitionCount,
  strength: item.strength,
  interval: item.interval,
  quality: item.quality
})), null, 2)}

上記の学習履歴を基に、この概念の個人化された忘却曲線を予測してください。
以下のJSON形式で返してください：

{
  "forgettingCurve": [
    {"day": 1, "predictedRetention": 0.9},
    {"day": 2, "predictedRetention": 0.8},
    {"day": 7, "predictedRetention": 0.6},
    {"day": 14, "predictedRetention": 0.4},
    {"day": 30, "predictedRetention": 0.2}
  ],
  "confidence": 信頼度(0-1),
  "factors": ["影響要因1", "影響要因2"]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '記憶科学の専門家として、個人の学習パターンに基づく忘却曲線を予測してください。'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ], {
        temperature: 0.3,
        maxTokens: 1000
      });

      const result = JSON.parse(response.content);
      return result.forgettingCurve || this.getDefaultForgettingCurve();

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('忘却曲線予測エラー', err, { concept });
      return this.getDefaultForgettingCurve();
    }
  }

  // 学習効率の最適化提案
  async generateLearningEfficiencyTips(
    userPerformance: any,
    memoryData: MemoryItem[]
  ): Promise<string[]> {
    const analysisPrompt = `
学習パフォーマンス:
${JSON.stringify(userPerformance, null, 2)}

記憶データサマリー:
- 総学習項目数: ${memoryData.length}
- 平均記憶強度: ${(memoryData.reduce((sum, item) => sum + item.strength, 0) / memoryData.length).toFixed(2)}
- 復習待ち項目数: ${this.getItemsDueForReview().length}

上記のデータを基に、記憶定着を向上させるための具体的なアドバイスを5つ提案してください。

JSON形式で返してください：
{
  "tips": [
    "具体的なアドバイス1",
    "具体的なアドバイス2",
    "具体的なアドバイス3",
    "具体的なアドバイス4",
    "具体的なアドバイス5"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '学習効率と記憶定着の専門家として、科学的根拠に基づくアドバイスを提供してください。'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ], {
        temperature: 0.6,
        maxTokens: 1000
      });

      const result = JSON.parse(response.content);
      return result.tips || ['定期的な復習を心がけてください'];

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('学習効率アドバイス生成エラー', err, { 
        memoryItemCount: memoryData.length 
      });
      return [
        '定期的な復習を心がけてください',
        '間隔を空けて復習することで記憶が定着します',
        '理解度の低い項目を優先的に復習してください'
      ];
    }
  }

  // プライベートメソッド群
  private calculateNextReviewDate(
    lastReview: Date,
    interval: number,
    easinessFactor: number
  ): Date {
    const nextDate = new Date(lastReview);
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate;
  }

  private calculateInitialStrength(quality: number): number {
    // 初期記憶強度の計算（0-1）
    return Math.max(0.1, Math.min(1.0, quality / 5));
  }

  private calculateMemoryStrength(item: MemoryItem, quality: number): number {
    const daysSinceLastReview = Math.floor(
      (Date.now() - item.lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 忘却曲線に基づく強度減衰
    const decayRate = 1 / (1 + item.easinessFactor);
    const timeDecay = Math.exp(-decayRate * daysSinceLastReview);
    
    // 復習による強化
    const reinforcement = quality / 5;
    
    return Math.max(0.1, Math.min(1.0, item.strength * timeDecay + reinforcement * 0.3));
  }

  private groupByCategory(items: MemoryItem[]): { [category: string]: MemoryItem[] } {
    return items.reduce((groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
      return groups;
    }, {} as { [category: string]: MemoryItem[] });
  }

  private calculateForgettingCurve(items: MemoryItem[]): { day: number; retention: number }[] {
    const curve: { day: number; retention: number }[] = [];
    const days = [1, 2, 3, 7, 14, 30, 60];

    days.forEach(day => {
      const retentionSum = items.reduce((sum, item) => {
        const daysSinceInitial = Math.floor(
          (Date.now() - item.initialLearningDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceInitial >= day) {
          // 実際のデータがある場合
          return sum + item.strength;
        } else {
          // 予測値
          const predictedStrength = item.strength * Math.exp(-0.1 * day);
          return sum + predictedStrength;
        }
      }, 0);

      curve.push({
        day,
        retention: retentionSum / items.length
      });
    });

    return curve;
  }

  private calculateOptimalReviewTiming(items: MemoryItem[]): number[] {
    // 各項目の最適復習間隔を分析
    const intervals = items.map(item => item.interval);
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    // 最適タイミングの提案（日数）
    return [1, 3, 7, Math.round(avgInterval), Math.round(avgInterval * 2)];
  }

  private async generateRetentionRecommendations(
    overallRetention: number,
    categoryRetention: { [category: string]: number },
    forgettingCurve: { day: number; retention: number }[]
  ): Promise<string[]> {
    const analysisPrompt = `
記憶定着分析結果:
- 全体的な記憶定着率: ${(overallRetention * 100).toFixed(1)}%
- カテゴリ別定着率: ${JSON.stringify(categoryRetention, null, 2)}
- 忘却曲線データ: ${JSON.stringify(forgettingCurve, null, 2)}

上記のデータを基に、記憶定着を改善するための具体的な推奨事項を5つ提案してください。

JSON形式で返してください：
{
  "recommendations": [
    "推奨事項1",
    "推奨事項2", 
    "推奨事項3",
    "推奨事項4",
    "推奨事項5"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '記憶定着の専門家として、科学的根拠に基づく改善提案を行ってください。'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ], {
        temperature: 0.5,
        maxTokens: 800
      });

      const result = JSON.parse(response.content);
      return result.recommendations || [];

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('記憶定着推奨事項生成エラー', err, { 
        overallRetention: overallRetention.toFixed(2) 
      });
      return [
        '定期的な間隔復習を実践してください',
        '理解度の低い分野を重点的に復習してください',
        '短時間でも毎日継続することが重要です'
      ];
    }
  }

  private getDefaultForgettingCurve(): { day: number; predictedRetention: number }[] {
    return [
      { day: 1, predictedRetention: 0.9 },
      { day: 2, predictedRetention: 0.8 },
      { day: 7, predictedRetention: 0.6 },
      { day: 14, predictedRetention: 0.4 },
      { day: 30, predictedRetention: 0.2 }
    ];
  }

  // 復習セッションの開始
  startReviewSession(items: MemoryItem[]): ReviewSession {
    const session: ReviewSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      items,
      startTime: new Date(),
      performance: 0,
      aiRecommendations: []
    };

    this.reviewSessions.push(session);
    return session;
  }

  // 復習セッションの完了
  async completeReviewSession(
    sessionId: string,
    results: { itemId: string; quality: number }[]
  ): Promise<ReviewSession | null> {
    const sessionIndex = this.reviewSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return null;

    const session = this.reviewSessions[sessionIndex];
    session.endTime = new Date();

    // 結果を記憶項目に反映
    results.forEach(result => {
      this.updateMemoryItem(result.itemId, result.quality);
    });

    // セッションパフォーマンスの計算
    session.performance = results.reduce((sum, r) => sum + r.quality, 0) / results.length;

    // AI推奨事項の生成
    session.aiRecommendations = await this.generateSessionRecommendations(session, results);

    return session;
  }

  private async generateSessionRecommendations(
    session: ReviewSession,
    results: { itemId: string; quality: number }[]
  ): Promise<string[]> {
    const sessionDuration = session.endTime 
      ? (session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60 
      : 0;

    const recommendationPrompt = `
復習セッション結果:
- セッション時間: ${sessionDuration.toFixed(1)}分
- 復習項目数: ${results.length}
- 平均評価: ${session.performance.toFixed(1)}
- 低評価項目数: ${results.filter(r => r.quality < 3).length}

上記の結果を基に、次回の学習に向けた具体的なアドバイスを3つ提案してください。

JSON形式で返してください：
{
  "recommendations": [
    "アドバイス1",
    "アドバイス2",
    "アドバイス3"
  ]
}
    `;

    try {
      const response = await aiClient.chat([
        {
          role: 'system',
          content: '学習セッション分析の専門家として、建設的なアドバイスを提供してください。'
        },
        {
          role: 'user',
          content: recommendationPrompt
        }
      ], {
        temperature: 0.6,
        maxTokens: 600
      });

      const result = JSON.parse(response.content);
      return result.recommendations || [];

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('セッション推奨事項生成エラー', err, { 
        sessionId: session.id,
        itemCount: results.length 
      });
      return ['継続的な復習を心がけてください'];
    }
  }

  // 統計情報の取得
  getMemoryStats(): {
    totalItems: number;
    dueForReview: number;
    averageStrength: number;
    strongestCategory: string;
    weakestCategory: string;
  } {
    const items = Array.from(this.memoryItems.values());
    const dueItems = this.getItemsDueForReview();
    
    if (items.length === 0) {
      return {
        totalItems: 0,
        dueForReview: 0,
        averageStrength: 0,
        strongestCategory: '',
        weakestCategory: ''
      };
    }

    const categoryGroups = this.groupByCategory(items);
    const categoryStrengths = Object.entries(categoryGroups).map(([category, categoryItems]) => ({
      category,
      strength: categoryItems.reduce((sum, item) => sum + item.strength, 0) / categoryItems.length
    }));

    categoryStrengths.sort((a, b) => b.strength - a.strength);

    return {
      totalItems: items.length,
      dueForReview: dueItems.length,
      averageStrength: items.reduce((sum, item) => sum + item.strength, 0) / items.length,
      strongestCategory: categoryStrengths[0]?.category || '',
      weakestCategory: categoryStrengths[categoryStrengths.length - 1]?.category || ''
    };
  }

  // メモリアイテムの取得
  getMemoryItem(id: string): MemoryItem | undefined {
    return this.memoryItems.get(id);
  }

  // 全メモリアイテムの取得
  getAllMemoryItems(): MemoryItem[] {
    return Array.from(this.memoryItems.values());
  }
}

export const aiMemoryRetention = new AIMemoryRetentionService();
