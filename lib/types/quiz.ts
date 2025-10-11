// クイズ関連の型定義

// 重要語句の定義
export interface KeyTerm {
  term: string;                   // 重要語句
  definition: string;             // 定義・説明
  position?: {                    // 問題文中の位置（オプション）
    start: number;
    end: number;
  };
}

// 関連条文の情報
export interface Article {
  law: string;                    // 法律名（例：「民法」）
  article: string;                // 条文番号（例：「第96条第3項」）
  content: string;                // 条文内容（要約）
  url?: string;                   // 条文へのリンク（オプション）
}

// 学習のコツ
export interface StudyTip {
  type: 'memory' | 'understanding' | 'application';
  content: string;
  icon?: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: string;
  year: string;
  exam?: string;  // 試験回（例：「10月」「12月」）

  // 過去問頻度による格付け用のメタデータ（任意）
  // topic: 過去問集計の単位（例: 不動産取得税/固定資産税/登録免許税 など）
  topic?: string;
  // 直近10年の出題回数（本番の過去問集計から投入）
  frequencyCount?: number;
  // 頻度に基づく格付け（A:高頻度, B:中頻度, C:低頻度）
  grade?: 'A' | 'B' | 'C';

  // 基礎レベル向け学習支援機能（任意）
  keyTerms?: KeyTerm[];           // 重要語句の定義
  relatedArticles?: Article[];    // 関連条文
  hints?: string[];               // ヒント（基礎レベル用）
  studyTips?: StudyTip[];        // 学習のコツ
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  showExplanation: boolean;
  answers: boolean[];
  isComplete: boolean;
  timeLeft: number;
  startTime: Date | null;
}

export interface QuizProps {
  category?: string;
  mode?: string;
}

export interface QuizResults {
  correctCount: number;
  totalQuestions: number;
  score: number;
  timeSpent: number;
  category: string;
  xpEarned: number;
}

export interface StudySession {
  timestamp: string;
  category: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpentMinutes: number;
  xpEarned: number;
}

// ○×問題の型定義
export interface TrueFalseItem {
  id: string;                     // 一意ID（元問題ID＋選択肢index等）
  law: 'takkengyouhou' | 'minpou' | 'hourei' | 'zeihou';
  statement: string;              // 命題文
  answer: boolean;                // true=○, false=×
  source: {                       // 出所情報の明示（本番由来を可視化）
    type: 'mcq' | 'frequency-blank';
    questionId?: number;          // mcq時
    topic?: string;               // frequency-questions時
    year?: string;
  };
  explanation?: string;           // 既存の解説を流用
  reference?: {                   // 参考情報
    law?: string;
    article?: string;
    url?: string;
  };
  topicWeight?: number;           // 重み（頻度に基づく）
}

// ○×クイズの状態管理
export interface TrueFalseQuizState {
  items: TrueFalseItem[];
  currentIndex: number;
  selectedAnswer: boolean | null;
  showExplanation: boolean;
  answers: boolean[];
  isComplete: boolean;
  startTime: Date | null;
  law: 'takkengyouhou' | 'minpou' | 'hourei' | 'zeihou';
}

// ○×クイズの結果
export interface TrueFalseQuizResults {
  correctCount: number;
  totalQuestions: number;
  score: number;
  timeSpent: number;
  law: string;
  xpEarned: number;
}
