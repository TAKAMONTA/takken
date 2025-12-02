"use client";

import React, { useState, useEffect } from "react";
import {
  LearningProgressTracker,
  ProgressMetrics,
  PersonalityCorrelation,
} from "@/lib/learning-progress-tracker";
import ProgressAnalytics from "@/components/ProgressAnalytics";
import { logger } from "@/lib/logger";

export default function ProgressPage() {
  const [progressMetrics, setProgressMetrics] =
    useState<ProgressMetrics | null>(null);
  const [correlations] = useState<PersonalityCorrelation[]>(
    []
  );
  const [improvementSuggestions] = useState<
    string[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    let userId: string | undefined;
    try {
      setIsLoading(true);
      setError(null);

      // 仮のユーザーID（実際の実装では認証システムから取得）
      userId = "user_" + Date.now();

      // 進捗メトリクスを取得
      const metrics = await LearningProgressTracker.getProgressMetrics(userId);
      setProgressMetrics(metrics);

      // 性格診断機能は削除されました
      // 今後、学習履歴のみに基づく分析機能を実装予定
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("進捗データの読み込みに失敗しました", err, { userId });
      setError("進捗データの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadProgressData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">進捗データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!progressMetrics) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            データがありません
          </h1>
          <p className="text-gray-600 mb-4">
            進捗分析を行うには、まず学習を開始する必要があります。
          </p>
          <div className="space-x-4">
            <a
              href="/dashboard"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors inline-block"
            >
              ダッシュボードに戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">学習進捗分析</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              🔄 更新
            </button>
            <a
              href="/dashboard"
              className="text-gray-600 hover:text-gray-700 font-medium"
            >
              ← ダッシュボードに戻る
            </a>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <ProgressAnalytics
        progressMetrics={progressMetrics}
        correlations={correlations}
        improvementSuggestions={improvementSuggestions}
      />
    </div>
  );
}
