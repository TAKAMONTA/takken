"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ProgressMetrics,
  PersonalityCorrelation,
  CategoryProgress,
  StrategyEffectiveness,
} from "@/lib/learning-progress-tracker";

interface ProgressAnalyticsProps {
  progressMetrics: ProgressMetrics;
  correlations: PersonalityCorrelation[];
  improvementSuggestions: string[];
}

export default function ProgressAnalytics({
  progressMetrics,
  correlations,
  improvementSuggestions,
}: ProgressAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "correlations" | "categories" | "strategies" | "suggestions"
  >("overview");

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCorrelationColor = (correlation: number): string => {
    if (correlation > 0.3) return "text-green-600";
    if (correlation > 0.1) return "text-blue-600";
    if (correlation > -0.1) return "text-gray-600";
    if (correlation > -0.3) return "text-orange-600";
    return "text-red-600";
  };

  const getCorrelationIcon = (correlation: number): string => {
    if (correlation > 0.3) return "📈";
    if (correlation > 0.1) return "↗️";
    if (correlation > -0.1) return "➡️";
    if (correlation > -0.3) return "↘️";
    return "📉";
  };

  const getStrengthColor = (strength: string): string => {
    switch (strength) {
      case "strong":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "weak":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStrengthLabel = (strength: string): string => {
    switch (strength) {
      case "strong":
        return "強い";
      case "moderate":
        return "中程度";
      case "weak":
        return "弱い";
      default:
        return "不明";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          📊 学習進捗分析レポート
        </h1>
        <p className="text-lg text-gray-600">
          あなたの学習パターンと性格特性の関係性を分析し、最適な学習戦略を提案します
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex flex-wrap justify-center mb-8">
        {[
          { id: "overview", label: "概要", icon: "📊" },
          { id: "correlations", label: "性格相関", icon: "🧠" },
          { id: "categories", label: "分野別進捗", icon: "📚" },
          { id: "strategies", label: "戦略効果", icon: "🎯" },
          { id: "suggestions", label: "改善提案", icon: "💡" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 mx-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="min-h-[600px]">
        {/* 概要タブ */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl mb-2">⏱️</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  総学習時間
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(progressMetrics.totalStudyTime)}
                </p>
                <p className="text-sm text-gray-600">累計</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">正答率</h3>
                <p className="text-2xl font-bold text-green-600">
                  {progressMetrics.averageAccuracy}%
                </p>
                <p className="text-sm text-gray-600">平均</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl mb-2">🔥</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  連続学習
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {progressMetrics.studyStreak}日
                </p>
                <p className="text-sm text-gray-600">継続中</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl mb-2">💪</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">自信度</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {progressMetrics.averageConfidence}/5
                </p>
                <p className="text-sm text-gray-600">平均</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📝 問題解答状況
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">正解</span>
                    <span className="font-bold text-green-600">
                      {progressMetrics.correctAnswers}問
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">不正解</span>
                    <span className="font-bold text-red-600">
                      {progressMetrics.incorrectAnswers}問
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">スキップ</span>
                    <span className="font-bold text-gray-600">
                      {progressMetrics.skippedQuestions}問
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-semibold">合計</span>
                      <span className="font-bold text-gray-800">
                        {progressMetrics.totalQuestions}問
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📅 学習履歴
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">最終学習日</span>
                    <span className="font-medium text-gray-800">
                      {formatDate(progressMetrics.lastStudyDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">学習分野数</span>
                    <span className="font-medium text-gray-800">
                      {Object.keys(progressMetrics.categoryProgress).length}分野
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">使用戦略数</span>
                    <span className="font-medium text-gray-800">
                      {
                        Object.keys(progressMetrics.strategyEffectiveness)
                          .length
                      }
                      個
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 性格相関タブ */}
        {activeTab === "correlations" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🧠 性格特性と学習成果の相関分析
              </h3>
              <p className="text-gray-600 mb-6">
                あなたの性格特性が学習成果にどのような影響を与えているかを分析しました。
                相関係数は-1から1の範囲で、正の値は学習成果へのプラスの影響、負の値はマイナスの影響を示します。
              </p>

              <div className="space-y-4">
                {correlations.map((correlation) => (
                  <div
                    key={correlation.trait}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {correlation.traitName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-lg font-bold ${getCorrelationColor(
                            correlation.correlation
                          )}`}
                        >
                          {getCorrelationIcon(correlation.correlation)}{" "}
                          {correlation.correlation}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border ${getStrengthColor(
                            correlation.strength
                          )}`}
                        >
                          {getStrengthLabel(correlation.strength)}相関
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">
                      {correlation.description}
                    </p>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        💡 推奨事項
                      </h5>
                      <ul className="space-y-1">
                        {correlation.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-700 flex items-start"
                          >
                            <span className="text-green-600 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 分野別進捗タブ */}
        {activeTab === "categories" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                📚 分野別学習進捗
              </h3>

              {Object.keys(progressMetrics.categoryProgress).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  まだ学習データがありません。学習を開始すると、ここに進捗が表示されます。
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(progressMetrics.categoryProgress).map(
                    ([category, progress]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {category}
                          </h4>
                          <span className="text-sm text-gray-500">
                            最終学習: {formatDate(progress.lastStudied)}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatTime(progress.totalTime)}
                            </div>
                            <div className="text-sm text-gray-600">
                              学習時間
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {progress.questionsAnswered}問
                            </div>
                            <div className="text-sm text-gray-600">
                              解答問題数
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {progress.accuracy}%
                            </div>
                            <div className="text-sm text-gray-600">正答率</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {progress.confidence}/5
                            </div>
                            <div className="text-sm text-gray-600">自信度</div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              改善率
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                progress.improvementRate > 0
                                  ? "text-green-600"
                                  : progress.improvementRate < 0
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {progress.improvementRate > 0 ? "+" : ""}
                              {progress.improvementRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                progress.improvementRate > 0
                                  ? "bg-green-500"
                                  : progress.improvementRate < 0
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                              }`}
                              style={{
                                width: `${Math.min(
                                  Math.abs(progress.improvementRate),
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 戦略効果タブ */}
        {activeTab === "strategies" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🎯 学習戦略の効果性分析
              </h3>

              {Object.keys(progressMetrics.strategyEffectiveness).length ===
              0 ? (
                <div className="text-center py-8 text-gray-500">
                  まだ学習戦略のデータがありません。学習を開始すると、ここに効果性が表示されます。
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(progressMetrics.strategyEffectiveness).map(
                    ([strategyId, effectiveness]) => (
                      <div key={strategyId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {effectiveness.strategyName}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {effectiveness.recommended && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                推奨
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              使用回数: {effectiveness.usageCount}回
                            </span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {effectiveness.averageAccuracy}%
                            </div>
                            <div className="text-sm text-gray-600">
                              平均正答率
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {effectiveness.averageConfidence}/5
                            </div>
                            <div className="text-sm text-gray-600">
                              平均自信度
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {effectiveness.userRating}/5
                            </div>
                            <div className="text-sm text-gray-600">
                              ユーザー評価
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              戦略の効果性
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                effectiveness.recommended
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {effectiveness.recommended ? "高効果" : "中効果"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                effectiveness.recommended
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }`}
                              style={{
                                width: `${
                                  effectiveness.recommended
                                    ? 100
                                    : Math.min(
                                        effectiveness.averageAccuracy +
                                          effectiveness.averageConfidence * 20,
                                        100
                                      )
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 改善提案タブ */}
        {activeTab === "suggestions" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                💡 学習改善提案
              </h3>
              <p className="text-gray-600 mb-6">
                あなたの学習パターンと性格特性を分析した結果、以下の改善提案をお届けします。
                これらの提案を参考に、より効果的な学習を目指しましょう。
              </p>

              {improvementSuggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  現在の学習状況は良好です。継続的な学習を心がけましょう。
                </div>
              ) : (
                <div className="space-y-4">
                  {improvementSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                    >
                      <span className="text-2xl">💡</span>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">
                          {suggestion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  🌟 継続的な改善のポイント
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 定期的に学習の進捗を振り返りましょう</li>
                  <li>
                    • 効果的な戦略は継続し、効果の低い戦略は改善しましょう
                  </li>
                  <li>• 性格特性を活かした学習スタイルを確立しましょう</li>
                  <li>• 小さな改善を積み重ねて、大きな成長を目指しましょう</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
