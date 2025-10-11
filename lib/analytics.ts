// Learning Analytics and Progress Tracking

import { UserProfile, StudyProgress, StudyStreak, StudySession } from './types';
import { Question } from './types/quiz';

export interface LearningPattern {
  preferredStudyTime: string[];
  averageSessionDuration: number;
  studyFrequency: number; // sessions per week
  difficultyProgression: number;
  categoryPreferences: { [category: string]: number };
}

export interface WeaknessAnalysis {
  weakCategories: string[];
  weakQuestionTypes: string[];
  commonMistakes: string[];
  improvementRate: number;
  recommendedFocus: string[];
}

export interface StudyRecommendation {
  type: 'category' | 'difficulty' | 'time' | 'review';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionUrl: string;
  estimatedTime: number; // minutes
}

export interface PerformanceMetrics {
  overallAccuracy: number;
  categoryAccuracy: { [category: string]: number };
  difficultyAccuracy: { [difficulty: string]: number };
  timeEfficiency: number; // questions per minute
  consistencyScore: number; // 0-100
  improvementTrend: 'improving' | 'stable' | 'declining';
}

class LearningAnalytics {
  // Analyze learning patterns
  analyzeLearningPatterns(sessions: StudySession[]): LearningPattern {
    if (sessions.length === 0) {
      return {
        preferredStudyTime: [],
        averageSessionDuration: 0,
        studyFrequency: 0,
        difficultyProgression: 0,
        categoryPreferences: {}
      };
    }

    // Analyze preferred study times
    const studyHours = sessions.map(session => 
      new Date(session.startTime).getHours()
    );
    const hourCounts = studyHours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as { [hour: number]: number });

    const preferredStudyTime = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    // Calculate average session duration
    const averageSessionDuration = sessions.reduce((sum, session) => 
      sum + session.timeSpent, 0) / sessions.length;

    // Calculate study frequency (sessions per week)
    const firstSession = new Date(Math.min(...sessions.map(s => s.startTime.getTime())));
    const lastSession = new Date(Math.max(...sessions.map(s => s.startTime.getTime())));
    const weeksDiff = Math.max(1, (lastSession.getTime() - firstSession.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const studyFrequency = sessions.length / weeksDiff;

    // Analyze category preferences
    const categoryPreferences = sessions.reduce((acc, session) => {
      acc[session.category] = (acc[session.category] || 0) + 1;
      return acc;
    }, {} as { [category: string]: number });

    // Calculate difficulty progression
    const recentSessions = sessions.slice(-10);
    const difficultyScores = recentSessions.map(session => {
      switch (session.difficulty) {
        case 'basic': return 1;
        case 'intermediate': return 2;
        case 'advanced': return 3;
        default: return 1;
      }
    });
    const difficultyProgression = difficultyScores.length > 1 
      ? (difficultyScores[difficultyScores.length - 1] - difficultyScores[0]) / difficultyScores.length
      : 0;

    return {
      preferredStudyTime,
      averageSessionDuration,
      studyFrequency,
      difficultyProgression,
      categoryPreferences
    };
  }

  // Analyze weaknesses and areas for improvement
  analyzeWeaknesses(sessions: StudySession[], questions: Question[]): WeaknessAnalysis {
    if (sessions.length === 0) {
      return {
        weakCategories: [],
        weakQuestionTypes: [],
        commonMistakes: [],
        improvementRate: 0,
        recommendedFocus: []
      };
    }

    // Calculate accuracy by category
    const categoryStats = sessions.reduce((acc, session) => {
      if (!acc[session.category]) {
        acc[session.category] = { total: 0, correct: 0 };
      }
      acc[session.category].total += session.questionsAnswered;
      acc[session.category].correct += session.correctAnswers;
      return acc;
    }, {} as { [category: string]: { total: number; correct: number } });

    // Identify weak categories (accuracy < 70%)
    const weakCategories = Object.entries(categoryStats)
      .filter(([, stats]) => (stats.correct / stats.total) < 0.7)
      .map(([category]) => category)
      .sort((a, b) => {
        const aAccuracy = categoryStats[a].correct / categoryStats[a].total;
        const bAccuracy = categoryStats[b].correct / categoryStats[b].total;
        return aAccuracy - bAccuracy;
      });

    // Calculate improvement rate
    const recentSessions = sessions.slice(-10);
    const oldSessions = sessions.slice(0, Math.min(10, sessions.length - 10));
    
    const recentAccuracy = recentSessions.length > 0 
      ? recentSessions.reduce((sum, s) => sum + (s.correctAnswers / s.questionsAnswered), 0) / recentSessions.length
      : 0;
    
    const oldAccuracy = oldSessions.length > 0
      ? oldSessions.reduce((sum, s) => sum + (s.correctAnswers / s.questionsAnswered), 0) / oldSessions.length
      : recentAccuracy;

    const improvementRate = recentAccuracy - oldAccuracy;

    // Generate recommendations
    const recommendedFocus = weakCategories.slice(0, 3);

    return {
      weakCategories,
      weakQuestionTypes: [], // Would need more detailed question analysis
      commonMistakes: [], // Would need error pattern analysis
      improvementRate,
      recommendedFocus
    };
  }

  // Generate study recommendations
  generateRecommendations(
    userProfile: UserProfile,
    patterns: LearningPattern,
    weaknesses: WeaknessAnalysis
  ): StudyRecommendation[] {
    const recommendations: StudyRecommendation[] = [];

    // Weakness-based recommendations
    if (weaknesses.weakCategories.length > 0) {
      const weakestCategory = weaknesses.weakCategories[0];
      recommendations.push({
        type: 'category',
        priority: 'high',
        title: `${this.getCategoryDisplayName(weakestCategory)}の強化`,
        description: `正答率が低い${this.getCategoryDisplayName(weakestCategory)}を重点的に学習しましょう`,
        actionUrl: `/practice/detail?category=${weakestCategory}`,
        estimatedTime: 30
      });
    }

    // Study frequency recommendations
    if (patterns.studyFrequency < 3) {
      recommendations.push({
        type: 'time',
        priority: 'medium',
        title: '学習頻度の向上',
        description: '週3回以上の学習で効果的な記憶定着を図りましょう',
        actionUrl: '/quick-test',
        estimatedTime: 15
      });
    }

    // Difficulty progression recommendations
    if (patterns.difficultyProgression < 0.1) {
      recommendations.push({
        type: 'difficulty',
        priority: 'medium',
        title: '難易度の段階的向上',
        description: 'より高い難易度の問題にチャレンジして実力を向上させましょう',
        actionUrl: '/practice',
        estimatedTime: 25
      });
    }

    // Review recommendations
    const daysSinceLastStudy = this.getDaysSinceLastStudy(userProfile);
    if (daysSinceLastStudy > 2) {
      recommendations.push({
        type: 'review',
        priority: 'high',
        title: '復習の実施',
        description: '学習内容の定着のため、定期的な復習を行いましょう',
        actionUrl: '/weak-points',
        estimatedTime: 20
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Calculate performance metrics
  calculatePerformanceMetrics(sessions: StudySession[]): PerformanceMetrics {
    if (sessions.length === 0) {
      return {
        overallAccuracy: 0,
        categoryAccuracy: {},
        difficultyAccuracy: {},
        timeEfficiency: 0,
        consistencyScore: 0,
        improvementTrend: 'stable'
      };
    }

    // Overall accuracy
    const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const overallAccuracy = totalCorrect / totalQuestions;

    // Category accuracy
    const categoryStats = sessions.reduce((acc, session) => {
      if (!acc[session.category]) {
        acc[session.category] = { total: 0, correct: 0 };
      }
      acc[session.category].total += session.questionsAnswered;
      acc[session.category].correct += session.correctAnswers;
      return acc;
    }, {} as { [category: string]: { total: number; correct: number } });

    const categoryAccuracy = Object.entries(categoryStats).reduce((acc, [category, stats]) => {
      acc[category] = stats.correct / stats.total;
      return acc;
    }, {} as { [category: string]: number });

    // Difficulty accuracy
    const difficultyStats = sessions.reduce((acc, session) => {
      if (!acc[session.difficulty]) {
        acc[session.difficulty] = { total: 0, correct: 0 };
      }
      acc[session.difficulty].total += session.questionsAnswered;
      acc[session.difficulty].correct += session.correctAnswers;
      return acc;
    }, {} as { [difficulty: string]: { total: number; correct: number } });

    const difficultyAccuracy = Object.entries(difficultyStats).reduce((acc, [difficulty, stats]) => {
      acc[difficulty] = stats.correct / stats.total;
      return acc;
    }, {} as { [difficulty: string]: number });

    // Time efficiency (questions per minute)
    const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
    const timeEfficiency = totalQuestions / totalTime;

    // Consistency score (based on accuracy variance)
    const accuracyScores = sessions.map(s => s.correctAnswers / s.questionsAnswered);
    const avgAccuracy = accuracyScores.reduce((sum, acc) => sum + acc, 0) / accuracyScores.length;
    const variance = accuracyScores.reduce((sum, acc) => sum + Math.pow(acc - avgAccuracy, 2), 0) / accuracyScores.length;
    const consistencyScore = Math.max(0, 100 - (variance * 100));

    // Improvement trend
    const recentSessions = sessions.slice(-5);
    const olderSessions = sessions.slice(-10, -5);
    
    const recentAvg = recentSessions.length > 0 
      ? recentSessions.reduce((sum, s) => sum + (s.correctAnswers / s.questionsAnswered), 0) / recentSessions.length
      : 0;
    
    const olderAvg = olderSessions.length > 0
      ? olderSessions.reduce((sum, s) => sum + (s.correctAnswers / s.questionsAnswered), 0) / olderSessions.length
      : recentAvg;

    let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvg > olderAvg + 0.05) improvementTrend = 'improving';
    else if (recentAvg < olderAvg - 0.05) improvementTrend = 'declining';

    return {
      overallAccuracy,
      categoryAccuracy,
      difficultyAccuracy,
      timeEfficiency,
      consistencyScore,
      improvementTrend
    };
  }

  // Helper methods
  private getCategoryDisplayName(category: string): string {
    const displayNames: { [key: string]: string } = {
      'takkengyouhou': '宅建業法',
      'minpou': '民法等',
      'hourei': '法令上の制限',
      'zeihou': '税・その他'
    };
    return displayNames[category] || category;
  }

  private getDaysSinceLastStudy(userProfile: UserProfile): number {
    const lastStudyDate = new Date(userProfile.streak.lastStudyDate);
    const today = new Date();
    const diffTime = today.getTime() - lastStudyDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Save study session
  saveStudySession(session: Omit<StudySession, 'id'>): StudySession {
    const fullSession: StudySession = {
      ...session,
      id: Date.now().toString()
    };

    // Save to localStorage
    const existingSessions = this.getStudySessions(session.userId);
    existingSessions.push(fullSession);
    
    localStorage.setItem(
      `study_sessions_${session.userId}`,
      JSON.stringify(existingSessions)
    );

    return fullSession;
  }

  // Get study sessions for a user
  getStudySessions(userId: string): StudySession[] {
    try {
      const sessions = localStorage.getItem(`study_sessions_${userId}`);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Failed to load study sessions:', error);
      return [];
    }
  }

  // Get analytics summary for a user
  getAnalyticsSummary(userId: string): {
    patterns: LearningPattern;
    weaknesses: WeaknessAnalysis;
    recommendations: StudyRecommendation[];
    metrics: PerformanceMetrics;
  } {
    const sessions = this.getStudySessions(userId);
    const userProfile = this.getUserProfile(userId);
    
    const patterns = this.analyzeLearningPatterns(sessions);
    const weaknesses = this.analyzeWeaknesses(sessions, []);
    const recommendations = this.generateRecommendations(userProfile, patterns, weaknesses);
    const metrics = this.calculatePerformanceMetrics(sessions);

    return {
      patterns,
      weaknesses,
      recommendations,
      metrics
    };
  }

  private getUserProfile(userId: string): UserProfile {
    try {
      const userData = localStorage.getItem('takken_rpg_user');
      if (!userData) {
        throw new Error('User profile not found');
      }
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      throw new Error('User profile not found');
    }
  }
}

export const learningAnalytics = new LearningAnalytics();
