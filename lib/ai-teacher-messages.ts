import { aiClient } from "./ai-client";
import { logger } from "./logger";

export interface UserContext {
  name?: string;
  streak: number;
  petLevel: number; // 精霊レベルとして互換利用
  petType: string; // 'spirit' を設定
  petStage: number; // 精霊段階
  petXP: number; // 植物由来の擬似XP
  recentPerformance?: number;
  weakAreas?: string[];
  lastStudyDate?: string;
  totalStudyDays?: number;
}

export interface AITeacherMessage {
  type: "greeting" | "encouragement" | "advice" | "reminder";
  message: string;
  actionText?: string;
  actionRoute?: string;
}

export class AITeacherService {
  // 時間帯を取得
  private getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  // 基本的な挨拶メッセージを生成
  private generateGreetingMessage(context: UserContext): AITeacherMessage {
    const timeOfDay = this.getTimeOfDay();
    const userName = context.name || "さん";

    const greetings = {
      morning: [
        `おはようございます、${userName}！今日も一緒に宅建の勉強を頑張りましょう！`,
        `おはようございます！新しい一日の始まりですね。今日はどの分野から始めますか？`,
        `おはようございます、${userName}！朝の時間は集中力が高いので、難しい問題に挑戦するのがおすすめです！`,
      ],
      afternoon: [
        `こんにちは、${userName}！午後の学習時間ですね。リフレッシュして頑張りましょう！`,
        `こんにちは！お疲れ様です。短時間でも集中して学習を続けることが大切ですよ。`,
        `こんにちは、${userName}！今日の調子はいかがですか？一緒に頑張りましょう！`,
      ],
      evening: [
        `こんばんは、${userName}！今日も学習お疲れ様でした。復習の時間にしませんか？`,
        `こんばんは！夕方の時間は復習に最適です。今日学んだことを振り返ってみましょう。`,
        `こんばんは、${userName}！一日の締めくくりに軽く問題を解いてみませんか？`,
      ],
      night: [
        `お疲れ様でした、${userName}！夜遅くまで勉強熱心ですね。無理は禁物ですよ。`,
        `こんばんは！夜の学習もいいですが、しっかり休息も取ってくださいね。`,
        `お疲れ様です、${userName}！明日に備えて、今日は軽めの復習にしませんか？`,
      ],
    };

    const messages = greetings[timeOfDay];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      type: "greeting",
      message,
      actionText: "今日の学習を始める",
      actionRoute: "/practice",
    };
  }

  // 連続学習に関する励ましメッセージ
  private generateEncouragementMessage(context: UserContext): AITeacherMessage {
    const { streak } = context;

    if (streak === 0) {
      return {
        type: "encouragement",
        message:
          "今日から新しいスタートですね！継続は力なり。一歩ずつ着実に進んでいきましょう！",
        actionText: "学習を始める",
        actionRoute: "/practice",
      };
    } else if (streak < 7) {
      return {
        type: "encouragement",
        message: `${streak}日連続学習中です！素晴らしいですね。この調子で1週間を目指しましょう！`,
        actionText: "今日も続ける",
        actionRoute: "/practice",
      };
    } else if (streak < 30) {
      return {
        type: "encouragement",
        message: `${streak}日連続学習、本当に素晴らしいです！習慣化できていますね。この調子で1ヶ月を目指しましょう！`,
        actionText: "継続する",
        actionRoute: "/practice",
      };
    } else {
      return {
        type: "encouragement",
        message: `${streak}日連続学習、驚異的な継続力です！あなたの努力は必ず合格につながります！`,
        actionText: "今日も頑張る",
        actionRoute: "/practice",
      };
    }
  }

  // 弱点分野に基づくアドバイス
  private generateAdviceMessage(context: UserContext): AITeacherMessage {
    const { weakAreas, recentPerformance } = context;

    if (weakAreas && weakAreas.length > 0) {
      const area = weakAreas[0];
      const areaNames: { [key: string]: string } = {
        rights: "権利関係",
        law: "宅建業法",
        tax: "税・その他",
        construction: "建築基準法",
      };

      const areaName = areaNames[area] || area;

      return {
        type: "advice",
        message: `${areaName}が少し苦手のようですね。集中的に学習することで必ず克服できます！今日は${areaName}の問題に挑戦してみませんか？`,
        actionText: `${areaName}を学習`,
        actionRoute: "/weak-points",
      };
    } else if (recentPerformance && recentPerformance < 70) {
      return {
        type: "advice",
        message:
          "最近の正答率が少し下がっているようですね。基礎に戻って復習することをおすすめします！",
        actionText: "基礎を復習",
        actionRoute: "/practice",
      };
    } else {
      return {
        type: "advice",
        message:
          "順調に学習が進んでいますね！この調子で模試にも挑戦してみませんか？",
        actionText: "模試に挑戦",
        actionRoute: "/mock-exam",
      };
    }
  }

  // 学習リマインダーメッセージ
  private generateReminderMessage(context: UserContext): AITeacherMessage {
    const { lastStudyDate } = context;
    const today = new Date().toDateString();

    if (!lastStudyDate || new Date(lastStudyDate).toDateString() !== today) {
      return {
        type: "reminder",
        message:
          "今日はまだ学習していませんね。短時間でも構いません。一緒に問題を解いてみませんか？",
        actionText: "学習を始める",
        actionRoute: "/quick-test",
      };
    } else {
      return {
        type: "reminder",
        message:
          "今日も学習お疲れ様でした！継続的な学習が合格への近道です。明日も一緒に頑張りましょう！",
        actionText: "進捗を確認",
        actionRoute: "/stats",
      };
    }
  }

  // メインのメッセージ生成メソッド
  async generateMessage(context: UserContext): Promise<AITeacherMessage> {
    // 基本的なルールベースメッセージを生成
    const messageTypes = ["greeting", "encouragement", "advice", "reminder"];
    const randomType =
      messageTypes[Math.floor(Math.random() * messageTypes.length)];

    switch (randomType) {
      case "greeting":
        return this.generateGreetingMessage(context);
      case "encouragement":
        return this.generateEncouragementMessage(context);
      case "advice":
        return this.generateAdviceMessage(context);
      case "reminder":
        return this.generateReminderMessage(context);
      default:
        return this.generateGreetingMessage(context);
    }
  }

  // AI生成メッセージ（より高度なパーソナライゼーション）
  async generateAIMessage(context: UserContext): Promise<AITeacherMessage> {
    try {
      const prompt = `
ユーザーの学習状況：
- 連続学習日数: ${context.streak}日
- 最近の正答率: ${context.recentPerformance || "データなし"}%
- 苦手分野: ${context.weakAreas?.join(", ") || "なし"}
- 総学習日数: ${context.totalStudyDays || 0}日

上記の情報を基に、宅建試験の学習を続けるユーザーに対して、AI先生として温かく励ましの言葉をかけてください。
メッセージは50文字以内で、親しみやすく、具体的なアドバイスを含めてください。
      `;

      const response = await aiClient.generateMotivationalMessage(
        context.streak,
        context.recentPerformance || 0
      );

      return {
        type: "encouragement",
        message: response,
        actionText: "学習を続ける",
        actionRoute: "/practice",
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("AI message generation failed", err, { context });
      // フォールバックとして基本メッセージを返す
      return this.generateGreetingMessage(context);
    }
  }
}

export const aiTeacherService = new AITeacherService();
