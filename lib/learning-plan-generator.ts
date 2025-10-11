// import { PersonalityResult } from './personality-analysis'; // 性格診断機能は削除されました

// @ts-nocheck - 性格診断機能が削除されたため、このファイルは現在使用されていません
type PersonalityResult = any;

export interface LearningStrategy {
  id: string;
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "study" | "review" | "practice" | "motivation";
  tips: string[];
}

export interface LearningPlan {
  id: string;
  userId: string;
  // personalityResult: PersonalityResult; // 性格診断機能は削除されました
  strategies: LearningStrategy[];
  weeklySchedule: WeeklySchedule;
  milestones: Milestone[];
  estimatedCompletionTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklySchedule {
  monday: LearningStrategy[];
  tuesday: LearningStrategy[];
  wednesday: LearningStrategy[];
  thursday: LearningStrategy[];
  friday: LearningStrategy[];
  saturday: LearningStrategy[];
  sunday: LearningStrategy[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: "pending" | "in-progress" | "completed";
  requiredStrategies: string[];
}

export class LearningPlanGenerator {
  private static readonly STUDY_CATEGORIES = [
    "民法（幹）",
    "宅建業法（根）",
    "法令上の制限（葉）",
    "税法・その他（花）",
  ];

  /**
   * 性格特性に基づく学習プランを生成
   * @deprecated 性格診断機能が削除されたため使用不可
   */
  static generateLearningPlan(
    userId: string,
    personalityResult: PersonalityResult
  ): LearningPlan {
    const strategies = this.generateStrategies(personalityResult);
    const weeklySchedule = this.createWeeklySchedule(
      strategies,
      personalityResult
    );
    const milestones = this.createMilestones(strategies, personalityResult);

    return {
      id: `plan_${Date.now()}`,
      userId,
      personalityResult,
      strategies,
      weeklySchedule,
      milestones,
      estimatedCompletionTime: this.calculateEstimatedTime(
        strategies,
        personalityResult
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 性格特性に基づく学習戦略を生成
   */
  private static generateStrategies(
    personalityResult: PersonalityResult
  ): LearningStrategy[] {
    const strategies: LearningStrategy[] = [];
    const { traits } = personalityResult;

    // 開放性に基づく戦略
    if (traits.openness.level === "high") {
      strategies.push({
        id: "creative_learning",
        name: "創造的学習アプローチ",
        description: "多角的な視点から学習内容を理解し、新しい学習方法を試す",
        priority: "high",
        estimatedTime: "2-3時間/日",
        difficulty: "intermediate",
        category: "study",
        tips: [
          "複数の教材を並行して使用する",
          "学習内容を図表やマインドマップで整理する",
          "実例やケーススタディを積極的に活用する",
          "学習内容を他の分野と関連付けて考える",
        ],
      });
    } else if (traits.openness.level === "low") {
      strategies.push({
        id: "structured_learning",
        name: "体系的な学習アプローチ",
        description: "既存の学習方法を基盤として、段階的に知識を積み上げる",
        priority: "high",
        estimatedTime: "1-2時間/日",
        difficulty: "beginner",
        category: "study",
        tips: [
          "一つの教材に集中して学習する",
          "基礎から順番に理解を深める",
          "実用的で具体的な例から始める",
          "学習の記録を丁寧に取る",
        ],
      });
    }

    // 誠実性に基づく戦略
    if (traits.conscientiousness.level === "high") {
      strategies.push({
        id: "detailed_planning",
        name: "詳細な学習計画",
        description: "長期的な目標設定と定期的な進捗評価を行う",
        priority: "high",
        estimatedTime: "30分/日（計画）+ 2-3時間/日（学習）",
        difficulty: "intermediate",
        category: "study",
        tips: [
          "月間・週間・日次の学習計画を立てる",
          "学習の進捗を定期的に記録・評価する",
          "目標達成度を数値化して管理する",
          "学習の質を向上させる改善計画を立てる",
        ],
      });
    } else if (traits.conscientiousness.level === "low") {
      strategies.push({
        id: "flexible_learning",
        name: "柔軟な学習アプローチ",
        description: "短期的な目標設定と達成感を重視した学習",
        priority: "medium",
        estimatedTime: "1-2時間/日",
        difficulty: "beginner",
        category: "study",
        tips: [
          "小さな目標を設定して達成感を積み重ねる",
          "学習の記録を簡単な方法で始める",
          "興味のある分野から学習を始める",
          "学習時間を柔軟に調整する",
        ],
      });
    }

    // 外向性に基づく戦略
    if (traits.extraversion.level === "high") {
      strategies.push({
        id: "social_learning",
        name: "社会的学習アプローチ",
        description: "他者との交流を通じて学習効果を高める",
        priority: "high",
        estimatedTime: "2-3時間/日",
        difficulty: "intermediate",
        category: "study",
        tips: [
          "学習グループや勉強会に参加する",
          "学習の成果を他の人と共有する",
          "他者との競争や協力をモチベーションにする",
          "オンライン学習コミュニティを活用する",
        ],
      });
    } else if (traits.extraversion.level === "low") {
      strategies.push({
        id: "individual_learning",
        name: "個人学習アプローチ",
        description: "静かな環境で集中して学習を進める",
        priority: "high",
        estimatedTime: "2-3時間/日",
        difficulty: "beginner",
        category: "study",
        tips: [
          "静かな学習環境を整える",
          "一人での学習時間を大切にする",
          "内省的な学習方法を活用する",
          "学習の記録を個人的に管理する",
        ],
      });
    }

    // 協調性に基づく戦略
    if (traits.agreeableness.level === "high") {
      strategies.push({
        id: "collaborative_learning",
        name: "協調的学習アプローチ",
        description: "他者との協力を重視した学習スタイル",
        priority: "medium",
        estimatedTime: "2-3時間/日",
        difficulty: "intermediate",
        category: "study",
        tips: [
          "学習のアドバイスを積極的に求める",
          "他の人の学習をサポートする",
          "グループ学習で意見を交換する",
          "学習の成果を謙虚に受け止める",
        ],
      });
    } else if (traits.agreeableness.level === "low") {
      strategies.push({
        id: "independent_learning",
        name: "独立学習アプローチ",
        description: "自分の学習スタイルを確立して進める",
        priority: "medium",
        estimatedTime: "2-3時間/日",
        difficulty: "intermediate",
        category: "study",
        tips: [
          "自分の学習スタイルを確立する",
          "独立した学習方法を追求する",
          "自分のペースで学習を進める",
          "学習の成果を客観的に評価する",
        ],
      });
    }

    // 神経症傾向に基づく戦略
    if (traits.neuroticism.level === "high") {
      strategies.push({
        id: "stress_management_learning",
        name: "ストレス管理学習アプローチ",
        description: "ストレスを軽減しながら学習を進める",
        priority: "high",
        estimatedTime: "1-2時間/日",
        difficulty: "beginner",
        category: "motivation",
        tips: [
          "ストレス管理の方法を積極的に学ぶ",
          "小さな成功体験を積み重ねて自信をつける",
          "学習の環境を整えてリラックスする",
          "学習のプレッシャーを適度に保つ",
        ],
      });
    } else if (traits.neuroticism.level === "low") {
      strategies.push({
        id: "stable_learning",
        name: "安定学習アプローチ",
        description: "安定した感情を活かして着実に学習を進める",
        priority: "medium",
        estimatedTime: "2-3時間/日",
        difficulty: "intermediate",
        category: "study",
        tips: [
          "安定した感情を活かして長期的な学習計画を立てる",
          "ストレスに強い特性を活かして困難な課題に挑戦する",
          "着実に学習を進める",
          "学習の質を重視する",
        ],
      });
    }

    // 共通の戦略を追加
    strategies.push(
      {
        id: "regular_review",
        name: "定期的な復習",
        description: "学習した内容を定期的に復習して定着を図る",
        priority: "high",
        estimatedTime: "1時間/日",
        difficulty: "beginner",
        category: "review",
        tips: [
          "学習した内容を翌日に復習する",
          "週末に週の学習内容を総復習する",
          "間違えた問題を重点的に復習する",
          "復習の効果を定期的に確認する",
        ],
      },
      {
        id: "practice_tests",
        name: "実践的な問題演習",
        description: "実際の試験形式に近い問題を解いて実力を確認する",
        priority: "medium",
        estimatedTime: "1-2時間/日",
        difficulty: "intermediate",
        category: "practice",
        tips: [
          "過去問を定期的に解く",
          "模擬試験を受験する",
          "時間を計って問題を解く",
          "間違えた問題の解説を詳しく読む",
        ],
      }
    );

    return strategies;
  }

  /**
   * 週間スケジュールを作成
   */
  private static createWeeklySchedule(
    strategies: LearningStrategy[],
    personalityResult: PersonalityResult
  ): WeeklySchedule {
    const { traits } = personalityResult;
    const schedule: WeeklySchedule = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    // 性格特性に基づいてスケジュールを調整
    if (traits.conscientiousness.level === "high") {
      // 計画性が高い場合は、体系的にスケジュールを組む
      this.distributeStrategiesEvenly(schedule, strategies);
    } else {
      // 計画性が低い場合は、柔軟なスケジュールを組む
      this.distributeStrategiesFlexibly(schedule, strategies);
    }

    return schedule;
  }

  /**
   * 戦略を均等に配分
   */
  private static distributeStrategiesEvenly(
    schedule: WeeklySchedule,
    strategies: LearningStrategy[]
  ): void {
    const days = Object.keys(schedule) as (keyof WeeklySchedule)[];
    const strategiesPerDay = Math.ceil(strategies.length / days.length);

    strategies.forEach((strategy, index) => {
      const dayIndex = Math.floor(index / strategiesPerDay);
      const day = days[dayIndex];
      if (day && schedule[day]) {
        schedule[day].push(strategy);
      }
    });
  }

  /**
   * 戦略を柔軟に配分
   */
  private static distributeStrategiesFlexibly(
    schedule: WeeklySchedule,
    strategies: LearningStrategy[]
  ): void {
    const days = Object.keys(schedule) as (keyof WeeklySchedule)[];

    strategies.forEach((strategy) => {
      // 優先度の高い戦略を平日に、低い戦略を週末に配置
      if (strategy.priority === "high") {
        const weekday = days[Math.floor(Math.random() * 5)]; // 月-金
        if (weekday && schedule[weekday]) {
          schedule[weekday].push(strategy);
        }
      } else {
        const weekend = days[Math.floor(Math.random() * 2) + 5]; // 土-日
        if (weekend && schedule[weekend]) {
          schedule[weekend].push(strategy);
        }
      }
    });
  }

  /**
   * マイルストーンを作成
   */
  private static createMilestones(
    strategies: LearningStrategy[],
    personalityResult: PersonalityResult
  ): Milestone[] {
    const milestones: Milestone[] = [];
    const { traits } = personalityResult;

    // 短期マイルストーン（1-2週間）
    milestones.push({
      id: "short_term_1",
      title: "学習習慣の確立",
      description: "毎日一定時間の学習を継続する",
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1週間後
      status: "pending",
      requiredStrategies: ["regular_review"],
    });

    // 中期マイルストーン（1-2ヶ月）
    if (traits.conscientiousness.level === "high") {
      milestones.push({
        id: "medium_term_1",
        title: "体系的学習の開始",
        description: "詳細な学習計画に基づいて体系的に学習を進める",
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1ヶ月後
        status: "pending",
        requiredStrategies: ["detailed_planning", "regular_review"],
      });
    }

    // 長期マイルストーン（3-6ヶ月）
    milestones.push({
      id: "long_term_1",
      title: "全分野の基礎理解",
      description: "宅建試験の全分野について基礎的な理解を深める",
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3ヶ月後
      status: "pending",
      requiredStrategies: ["regular_review", "practice_tests"],
    });

    return milestones;
  }

  /**
   * 完了予定時間を計算
   */
  private static calculateEstimatedTime(
    strategies: LearningStrategy[],
    personalityResult: PersonalityResult
  ): string {
    const { traits } = personalityResult;

    // 基本の学習時間を計算
    let totalHours = strategies.reduce((total, strategy) => {
      const timeMatch = strategy.estimatedTime.match(/(\d+)-(\d+)時間/);
      if (timeMatch) {
        const avgTime = (parseInt(timeMatch[1]) + parseInt(timeMatch[2])) / 2;
        return total + avgTime;
      }
      return total;
    }, 0);

    // 性格特性に基づいて調整
    if (traits.conscientiousness.level === "high") {
      totalHours *= 0.9; // 計画性が高い場合は効率的
    } else if (traits.conscientiousness.level === "low") {
      totalHours *= 1.2; // 計画性が低い場合は時間がかかる
    }

    if (traits.neuroticism.level === "high") {
      totalHours *= 1.1; // ストレスが高い場合は時間がかかる
    }

    // 日数に変換
    const days = Math.ceil(totalHours / 2); // 1日2時間と仮定
    const months = Math.ceil(days / 30);

    if (months >= 6) {
      return `${months}ヶ月`;
    } else if (days >= 30) {
      return `${months}ヶ月`;
    } else {
      return `${days}日`;
    }
  }

  /**
   * 学習プランを更新
   */
  static updateLearningPlan(plan: LearningPlan, progress: any): LearningPlan {
    // 進捗に基づいてプランを更新
    const updatedPlan = { ...plan };
    updatedPlan.updatedAt = new Date();

    // マイルストーンのステータスを更新
    updatedPlan.milestones = updatedPlan.milestones.map((milestone) => {
      // 進捗に基づいてステータスを更新
      if (progress.completedStrategies?.includes(milestone.id)) {
        return { ...milestone, status: "completed" as const };
      }
      return milestone;
    });

    return updatedPlan;
  }
}
