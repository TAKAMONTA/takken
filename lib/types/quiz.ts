// クイズ関連の型定義

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: string;
  year: string;
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
