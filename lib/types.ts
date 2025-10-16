// 学習関連の型定義

// 学習ストリーク
export interface StudyStreak {
  currentStreak: number;  // 現在のストリーク日数
  longestStreak: number;  // 最長ストリーク日数
  lastStudyDate: string;  // 最後に学習した日付
  studyDates: string[];   // 学習した日付の配列
}

// 学習履歴（日別）
export interface StudyHistoryRecord {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  studyTimeMinutes: number;
  sessions: number;
}

// 総学習統計
export interface TotalStats {
  totalQuestions: number;
  totalCorrect: number;
  totalStudyTime: number;
  totalSessions: number;
}

// 学習進捗
export interface StudyProgress {
  totalQuestions: number;     // 総問題数
  correctAnswers: number;     // 正解数
  studyTimeMinutes: number;   // 総学習時間（分）
  categoryProgress: {         // カテゴリ別進捗
    [key: string]: {
      total: number;
      correct: number;
      timeSpent: number;
    }
  }
}

// 学習記録（バッジ機能は削除）
export interface LearningRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  completedAt?: string;
  isCompleted: boolean;
}

// ユーザープロファイル拡張
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  streak: StudyStreak;
  progress: StudyProgress;
  learningRecords: LearningRecord[];
  joinedAt: string;
  studyHistory?: StudyHistoryRecord[];
  totalStats?: TotalStats;
}

// 学習セッション
export interface StudySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  category: string;
  mode: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number; // minutes
  difficulty: string;
  xpEarned: number;
  type?: string;
  score?: number;
  rank?: string;
  totalQuestions?: number;
}
