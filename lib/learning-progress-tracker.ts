// 性格診断機能は削除済み
import { LearningPlan, LearningStrategy } from "./learning-plan-generator";

export interface LearningSession {
  id: string;
  userId: string;
  sessionDate: Date;
  duration: number; // 分単位
  category: string; // 学習分野
  strategyId: string; // 使用した学習戦略
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  confidenceLevel: 1 | 2 | 3 | 4 | 5; // 1: 全く自信なし, 5: 完全に自信あり
  difficulty: "easy" | "medium" | "hard";
  notes?: string;
}

export interface ProgressMetrics {
  totalStudyTime: number; // 分単位
  averageAccuracy: number; // 0-100%
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  averageConfidence: number; // 1-5
  studyStreak: number; // 連続学習日数
  lastStudyDate: Date;
  categoryProgress: Record<string, CategoryProgress>;
  strategyEffectiveness: Record<string, StrategyEffectiveness>;
}

export interface CategoryProgress {
  category: string;
  totalTime: number;
  questionsAnswered: number;
  accuracy: number;
  confidence: number;
  lastStudied: Date;
  improvementRate: number; // 週間での改善率
}

export interface StrategyEffectiveness {
  strategyId: string;
  strategyName: string;
  usageCount: number;
  averageAccuracy: number;
  averageConfidence: number;
  userRating: number; // 1-5のユーザー評価
  recommended: boolean;
}

export interface PersonalityCorrelation {
  trait: string;
  traitName: string;
  correlation: number; // -1 to 1
  strength: "strong" | "moderate" | "weak";
  description: string;
  recommendations: string[];
}

export class LearningProgressTracker {
  private static readonly COLLECTION_NAME = "learningSessions";

  /**
   * 学習セッションを記録
   */
  static async recordLearningSession(
    session: Omit<LearningSession, "id">
  ): Promise<string> {
    try {
      const sessionWithId: LearningSession = {
        ...session,
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      // Firebaseが利用可能かチェック
      if (typeof window !== "undefined" && (window as any).firebase) {
        const docRef = await (window as any).firebase
          .firestore()
          .collection(this.COLLECTION_NAME)
          .add(sessionWithId);

        return docRef.id;
      } else {
        // ローカルストレージに保存
        return this.saveToLocalStorage(sessionWithId);
      }
    } catch (error) {
      console.error("学習セッションの記録に失敗しました:", error);
      // フォールバック: ローカルストレージに保存
      return this.saveToLocalStorage({
        ...session,
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    }
  }

  /**
   * ユーザーの進捗メトリクスを取得
   */
  static async getProgressMetrics(userId: string): Promise<ProgressMetrics> {
    try {
      const sessions = await this.getLearningSessions(userId);

      if (sessions.length === 0) {
        return this.createEmptyProgressMetrics();
      }

      return this.calculateProgressMetrics(sessions);
    } catch (error) {
      console.error("進捗メトリクスの取得に失敗しました:", error);
      return this.createEmptyProgressMetrics();
    }
  }

  /**
   * 性格特性と学習成果の相関を分析
   * @deprecated 性格診断機能は削除されました
   */
  /* static analyzePersonalityCorrelation(
    personalityResult: any,
    progressMetrics: ProgressMetrics
  ): PersonalityCorrelation[] {
    const correlations: PersonalityCorrelation[] = [];
    const { traits } = personalityResult;

    // 開放性の相関分析
    const opennessCorrelation = this.analyzeTraitCorrelation(
      "openness",
      "開放性",
      traits.openness.level,
      progressMetrics,
      {
        high: {
          accuracy: 0.3, // 高い開放性は学習効果にプラス
          confidence: 0.4,
          studyTime: 0.2,
        },
        medium: {
          accuracy: 0.1,
          confidence: 0.2,
          studyTime: 0.1,
        },
        low: {
          accuracy: -0.1,
          confidence: -0.1,
          studyTime: 0.0,
        },
      }
    );
    correlations.push(opennessCorrelation);

    // 誠実性の相関分析
    const conscientiousnessCorrelation = this.analyzeTraitCorrelation(
      "conscientiousness",
      "誠実性",
      traits.conscientiousness.level,
      progressMetrics,
      {
        high: {
          accuracy: 0.5, // 高い誠実性は学習効果に大きくプラス
          confidence: 0.3,
          studyTime: 0.4,
        },
        medium: {
          accuracy: 0.2,
          confidence: 0.2,
          studyTime: 0.2,
        },
        low: {
          accuracy: -0.2,
          confidence: -0.2,
          studyTime: -0.1,
        },
      }
    );
    correlations.push(conscientiousnessCorrelation);

    // 外向性の相関分析
    const extraversionCorrelation = this.analyzeTraitCorrelation(
      "extraversion",
      "外向性",
      traits.extraversion.level,
      progressMetrics,
      {
        high: {
          accuracy: 0.2,
          confidence: 0.3,
          studyTime: 0.1,
        },
        medium: {
          accuracy: 0.1,
          confidence: 0.1,
          studyTime: 0.0,
        },
        low: {
          accuracy: 0.0,
          confidence: -0.1,
          studyTime: 0.1,
        },
      }
    );
    correlations.push(extraversionCorrelation);

    // 協調性の相関分析
    const agreeablenessCorrelation = this.analyzeTraitCorrelation(
      "agreeableness",
      "協調性",
      traits.agreeableness.level,
      progressMetrics,
      {
        high: {
          accuracy: 0.1,
          confidence: 0.2,
          studyTime: 0.0,
        },
        medium: {
          accuracy: 0.0,
          confidence: 0.1,
          studyTime: 0.0,
        },
        low: {
          accuracy: 0.0,
          confidence: -0.1,
          studyTime: 0.0,
        },
      }
    );
    correlations.push(agreeablenessCorrelation);

    // 神経症傾向の相関分析
    const neuroticismCorrelation = this.analyzeTraitCorrelation(
      "neuroticism",
      "神経症傾向",
      traits.neuroticism.level,
      progressMetrics,
      {
        high: {
          accuracy: -0.3, // 高い神経症傾向は学習効果にマイナス
          confidence: -0.4,
          studyTime: -0.2,
        },
        medium: {
          accuracy: -0.1,
          confidence: -0.1,
          studyTime: 0.0,
        },
        low: {
          accuracy: 0.2,
          confidence: 0.3,
          studyTime: 0.1,
        },
      }
    );
    correlations.push(neuroticismCorrelation);

    return correlations;
  } */

  /**
   * 学習戦略の効果を評価
   */
  static evaluateStrategyEffectiveness(
    strategyId: string,
    sessions: LearningSession[]
  ): StrategyEffectiveness {
    const strategySessions = sessions.filter(
      (s) => s.strategyId === strategyId
    );

    if (strategySessions.length === 0) {
      return {
        strategyId,
        strategyName: "不明",
        usageCount: 0,
        averageAccuracy: 0,
        averageConfidence: 0,
        userRating: 0,
        recommended: false,
      };
    }

    const totalQuestions = strategySessions.reduce(
      (sum, s) => sum + s.questionsAnswered,
      0
    );
    const totalCorrect = strategySessions.reduce(
      (sum, s) => sum + s.correctAnswers,
      0
    );
    const averageAccuracy =
      totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    const averageConfidence =
      strategySessions.reduce((sum, s) => sum + s.confidenceLevel, 0) /
      strategySessions.length;

    // 効果性に基づいて推奨度を判定
    const recommended = averageAccuracy > 70 && averageConfidence > 3.5;

    return {
      strategyId,
      strategyName: strategyId, // 実際の実装では名前を取得
      usageCount: strategySessions.length,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      averageConfidence: Math.round(averageConfidence * 10) / 10,
      userRating: 0, // ユーザー評価は別途実装
      recommended,
    };
  }

  /**
   * 学習の改善提案を生成
   * @deprecated 性格診断機能は削除されました
   */
  /* static generateImprovementSuggestions(
    personalityResult: any,
    progressMetrics: ProgressMetrics,
    correlations: PersonalityCorrelation[]
  ): string[] {
    const suggestions: string[] = [];

    // 精度が低い場合の提案
    if (progressMetrics.averageAccuracy < 70) {
      suggestions.push(
        "学習の精度を向上させるために、復習の頻度を増やしましょう。"
      );

      if (personalityResult.traits.conscientiousness.level === "low") {
        suggestions.push(
          "計画的な学習を心がけ、小さな目標を設定して達成感を積み重ねましょう。"
        );
      }

      if (personalityResult.traits.neuroticism.level === "high") {
        suggestions.push(
          "ストレスを感じている場合は、学習環境を整えてリラックスした状態で学習しましょう。"
        );
      }
    }

    // 自信が低い場合の提案
    if (progressMetrics.averageConfidence < 3) {
      suggestions.push(
        "自信をつけるために、基礎的な問題から始めて、段階的に難易度を上げていきましょう。"
      );

      if (personalityResult.traits.openness.level === "low") {
        suggestions.push(
          "新しい学習方法を試して、自分に合ったアプローチを見つけましょう。"
        );
      }
    }

    // 学習時間が少ない場合の提案
    if (progressMetrics.totalStudyTime < 300) {
      // 5時間未満
      suggestions.push(
        "学習時間を増やして、継続的な学習習慣を身につけましょう。"
      );

      if (personalityResult.traits.extraversion.level === "high") {
        suggestions.push(
          "学習グループや勉強会に参加して、モチベーションを高めましょう。"
        );
      }
    }

    // 連続学習が途切れている場合の提案
    if (progressMetrics.studyStreak < 3) {
      suggestions.push(
        "毎日少しずつでも学習を続けて、学習習慣を確立しましょう。"
      );
    }

    return suggestions.slice(0, 5); // 最大5つの提案
  } */

  /**
   * 学習セッションを取得
   */
  private static async getLearningSessions(
    userId: string
  ): Promise<LearningSession[]> {
    try {
      if (typeof window !== "undefined" && (window as any).firebase) {
        const snapshot = await (window as any).firebase
          .firestore()
          .collection(this.COLLECTION_NAME)
          .where("userId", "==", userId)
          .orderBy("sessionDate", "desc")
          .get();

        return snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as LearningSession[];
      } else {
        // ローカルストレージから取得
        return this.getFromLocalStorage(userId);
      }
    } catch (error) {
      console.error("学習セッションの取得に失敗しました:", error);
      return this.getFromLocalStorage(userId);
    }
  }

  /**
   * 進捗メトリクスを計算
   */
  private static calculateProgressMetrics(
    sessions: LearningSession[]
  ): ProgressMetrics {
    const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalQuestions = sessions.reduce(
      (sum, s) => sum + s.questionsAnswered,
      0
    );
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalIncorrect = sessions.reduce(
      (sum, s) => sum + s.incorrectAnswers,
      0
    );
    const totalSkipped = sessions.reduce(
      (sum, s) => sum + s.skippedQuestions,
      0
    );
    const averageAccuracy =
      totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    const averageConfidence =
      sessions.reduce((sum, s) => sum + s.confidenceLevel, 0) / sessions.length;

    // 連続学習日数を計算
    const studyStreak = this.calculateStudyStreak(sessions);

    // カテゴリ別進捗を計算
    const categoryProgress = this.calculateCategoryProgress(sessions);

    // 戦略効果性を計算
    const strategyEffectiveness = this.calculateStrategyEffectiveness(sessions);

    return {
      totalStudyTime,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      totalQuestions,
      correctAnswers: totalCorrect,
      incorrectAnswers: totalIncorrect,
      skippedQuestions: totalSkipped,
      averageConfidence: Math.round(averageConfidence * 10) / 10,
      studyStreak,
      lastStudyDate: sessions[0].sessionDate,
      categoryProgress,
      strategyEffectiveness,
    };
  }

  /**
   * 連続学習日数を計算
   */
  private static calculateStudyStreak(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0;

    const sortedSessions = sessions.sort(
      (a, b) =>
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      // 最大1年分チェック
      const sessionOnDate = sortedSessions.find((s) => {
        const sessionDate = new Date(s.sessionDate);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === currentDate.getTime();
      });

      if (sessionOnDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * カテゴリ別進捗を計算
   */
  private static calculateCategoryProgress(
    sessions: LearningSession[]
  ): Record<string, CategoryProgress> {
    const categoryMap = new Map<string, CategoryProgress>();

    sessions.forEach((session) => {
      if (!categoryMap.has(session.category)) {
        categoryMap.set(session.category, {
          category: session.category,
          totalTime: 0,
          questionsAnswered: 0,
          accuracy: 0,
          confidence: 0,
          lastStudied: session.sessionDate,
          improvementRate: 0,
        });
      }

      const progress = categoryMap.get(session.category)!;
      progress.totalTime += session.duration;
      progress.questionsAnswered += session.questionsAnswered;
      progress.lastStudied = session.sessionDate;
    });

    // 精度と自信度を計算
    categoryMap.forEach((progress, category) => {
      const categorySessions = sessions.filter((s) => s.category === category);
      const totalQuestions = categorySessions.reduce(
        (sum, s) => sum + s.questionsAnswered,
        0
      );
      const totalCorrect = categorySessions.reduce(
        (sum, s) => sum + s.correctAnswers,
        0
      );

      progress.accuracy =
        totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
      progress.confidence =
        categorySessions.reduce((sum, s) => sum + s.confidenceLevel, 0) /
        categorySessions.length;

      // 改善率を計算（簡易版）
      progress.improvementRate =
        this.calculateImprovementRate(categorySessions);
    });

    return Object.fromEntries(categoryMap);
  }

  /**
   * 戦略効果性を計算
   */
  private static calculateStrategyEffectiveness(
    sessions: LearningSession[]
  ): Record<string, StrategyEffectiveness> {
    const strategyMap = new Map<string, StrategyEffectiveness>();
    const uniqueStrategies = [...new Set(sessions.map((s) => s.strategyId))];

    uniqueStrategies.forEach((strategyId) => {
      strategyMap.set(
        strategyId,
        this.evaluateStrategyEffectiveness(strategyId, sessions)
      );
    });

    return Object.fromEntries(strategyMap);
  }

  /**
   * 改善率を計算（簡易版）
   */
  private static calculateImprovementRate(sessions: LearningSession[]): number {
    if (sessions.length < 2) return 0;

    const sortedSessions = sessions.sort(
      (a, b) =>
        new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
    );

    const firstHalf = sortedSessions.slice(0, Math.floor(sessions.length / 2));
    const secondHalf = sortedSessions.slice(Math.floor(sessions.length / 2));

    const firstAccuracy =
      firstHalf.reduce(
        (sum, s) => sum + s.correctAnswers / s.questionsAnswered,
        0
      ) / firstHalf.length;
    const secondAccuracy =
      secondHalf.reduce(
        (sum, s) => sum + s.correctAnswers / s.questionsAnswered,
        0
      ) / secondHalf.length;

    return firstAccuracy > 0
      ? ((secondAccuracy - firstAccuracy) / firstAccuracy) * 100
      : 0;
  }

  /**
   * 特性の相関を分析
   */
  private static analyzeTraitCorrelation(
    traitKey: string,
    traitName: string,
    level: string,
    progressMetrics: ProgressMetrics,
    correlations: Record<
      string,
      { accuracy: number; confidence: number; studyTime: number }
    >
  ): PersonalityCorrelation {
    const levelCorrelations = correlations[level] || correlations.medium;

    // 相関係数を計算
    const accuracyCorrelation = levelCorrelations.accuracy;
    const confidenceCorrelation = levelCorrelations.confidence;
    const studyTimeCorrelation = levelCorrelations.studyTime;

    const averageCorrelation =
      (accuracyCorrelation + confidenceCorrelation + studyTimeCorrelation) / 3;

    // 相関の強さを判定
    let strength: "strong" | "moderate" | "weak";
    if (Math.abs(averageCorrelation) > 0.4) {
      strength = "strong";
    } else if (Math.abs(averageCorrelation) > 0.2) {
      strength = "moderate";
    } else {
      strength = "weak";
    }

    // 説明と推奨事項を生成
    const description = this.generateTraitDescription(
      traitKey,
      level,
      averageCorrelation
    );
    const recommendations = this.generateTraitRecommendations(
      traitKey,
      level,
      averageCorrelation
    );

    return {
      trait: traitKey,
      traitName,
      correlation: Math.round(averageCorrelation * 100) / 100,
      strength,
      description,
      recommendations,
    };
  }

  /**
   * 特性の説明を生成
   */
  private static generateTraitDescription(
    traitKey: string,
    level: string,
    correlation: number
  ): string {
    const descriptions: Record<string, Record<string, string>> = {
      openness: {
        high: "高い開放性は、新しい学習方法への適応力と創造的な問題解決を促進します。",
        medium:
          "適度な開放性により、バランスの取れた学習アプローチが可能です。",
        low: "低い開放性は、既存の学習方法を着実に実践することを重視します。",
      },
      conscientiousness: {
        high: "高い誠実性は、計画的な学習と継続的な努力を支えます。",
        medium: "適度な誠実性により、柔軟性と計画性のバランスが取れています。",
        low: "低い誠実性は、短期的な目標設定と達成感を重視した学習が効果的です。",
      },
      extraversion: {
        high: "高い外向性は、他者との交流を通じた学習効果を高めます。",
        medium:
          "適度な外向性により、個人学習とグループ学習のバランスが取れています。",
        low: "低い外向性は、静かな環境での集中した学習を好みます。",
      },
      agreeableness: {
        high: "高い協調性は、他者との協力を通じた学習を促進します。",
        medium:
          "適度な協調性により、独立学習と協調学習のバランスが取れています。",
        low: "低い協調性は、独立した学習スタイルの確立を重視します。",
      },
      neuroticism: {
        high: "高い神経症傾向は、ストレス管理を重視した学習環境の整備が重要です。",
        medium:
          "適度な神経症傾向により、適度な緊張感が学習のモチベーションになります。",
        low: "低い神経症傾向は、安定した感情で着実な学習を進めることができます。",
      },
    };

    return (
      descriptions[traitKey]?.[level] ||
      "この特性と学習成果の関係性は中程度です。"
    );
  }

  /**
   * 特性に基づく推奨事項を生成
   */
  private static generateTraitRecommendations(
    traitKey: string,
    level: string,
    correlation: number
  ): string[] {
    const recommendations: Record<string, Record<string, string[]>> = {
      openness: {
        high: [
          "新しい学習方法を積極的に試してみましょう",
          "多角的な視点から問題を分析しましょう",
          "創造的な学習ツールを活用しましょう",
        ],
        medium: [
          "既存の方法と新しい方法を組み合わせましょう",
          "興味のある分野から学習を始めましょう",
        ],
        low: [
          "実用的で具体的な例から学習を始めましょう",
          "段階的に新しい概念を導入しましょう",
        ],
      },
      conscientiousness: {
        high: [
          "詳細な学習計画を立てて実行しましょう",
          "定期的な進捗評価を行いましょう",
          "長期的な目標に向かって着実に進歩しましょう",
        ],
        medium: [
          "適度な計画性を保ちながら柔軟性も維持しましょう",
          "定期的な振り返りを習慣化しましょう",
        ],
        low: [
          "小さな目標を設定して達成感を積み重ねましょう",
          "学習の記録を簡単な方法で始めましょう",
        ],
      },
      extraversion: {
        high: [
          "学習グループや勉強会に参加しましょう",
          "学習の成果を他の人と共有しましょう",
          "他者との競争や協力をモチベーションにしましょう",
        ],
        medium: [
          "一人での学習とグループ学習のバランスを取りましょう",
          "必要に応じて他者との交流も取り入れましょう",
        ],
        low: [
          "静かな環境で集中して学習しましょう",
          "一人での学習時間を大切にしましょう",
        ],
      },
      agreeableness: {
        high: [
          "他者との協力を学習に取り入れましょう",
          "学習のアドバイスを積極的に求めましょう",
          "他の人の学習をサポートすることも学習になります",
        ],
        medium: [
          "協調性と独立心のバランスを取りましょう",
          "必要に応じて他者の意見も参考にしましょう",
        ],
        low: [
          "自分の学習スタイルを確立しましょう",
          "独立した学習方法を追求しましょう",
        ],
      },
      neuroticism: {
        high: [
          "ストレス管理の方法を積極的に学びましょう",
          "小さな成功体験を積み重ねて自信をつけましょう",
          "学習の環境を整えてリラックスして学習できるようにしましょう",
        ],
        medium: [
          "適度な緊張感を学習のモチベーションにしましょう",
          "ストレス管理の方法を身につけましょう",
        ],
        low: [
          "安定した感情を活かして着実に学習を進めましょう",
          "長期的な学習計画を立てましょう",
        ],
      },
    };

    return (
      recommendations[traitKey]?.[level] || ["継続的な学習を心がけましょう"]
    );
  }

  /**
   * 空の進捗メトリクスを作成
   */
  private static createEmptyProgressMetrics(): ProgressMetrics {
    return {
      totalStudyTime: 0,
      averageAccuracy: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      skippedQuestions: 0,
      averageConfidence: 0,
      studyStreak: 0,
      lastStudyDate: new Date(),
      categoryProgress: {},
      strategyEffectiveness: {},
    };
  }

  /**
   * ローカルストレージに保存
   */
  private static saveToLocalStorage(session: LearningSession): string {
    const key = `learning_session_${session.userId}`;
    const existingSessions = this.getFromLocalStorage(session.userId);
    existingSessions.push(session);

    localStorage.setItem(key, JSON.stringify(existingSessions));
    return session.id;
  }

  /**
   * ローカルストレージから取得
   */
  private static getFromLocalStorage(userId: string): LearningSession[] {
    try {
      const key = `learning_session_${userId}`;
      const data = localStorage.getItem(key);

      if (data) {
        const sessions = JSON.parse(data) as LearningSession[];
        // Dateオブジェクトを復元
        return sessions.map((session) => ({
          ...session,
          sessionDate: new Date(session.sessionDate),
        }));
      }
    } catch (error) {
      console.error(
        "ローカルストレージからの学習セッション取得に失敗しました:",
        error
      );
    }

    return [];
  }
}
