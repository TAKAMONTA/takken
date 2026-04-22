"use client";

import { useState, useEffect, useCallback } from "react";
import { TopicLesson } from "@/lib/data/lessons";

interface LessonScreenProps {
  /** フォールバック用：問題の解説テキスト */
  explanation: string;
  /** 構造化レッスンデータ（あれば優先表示） */
  lesson?: TopicLesson;
  /** カウントダウン秒数（デフォルト10秒） */
  duration?: number;
  /** 授業終了時のコールバック */
  onComplete: () => void;
  /** 現在の問題番号 */
  questionNumber: number;
  /** 全問題数 */
  totalQuestions: number;
}

function extractLearningContent(explanation: string): string[] {
  const lines = explanation
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const result: string[] = [];

  for (const line of lines) {
    if (line.startsWith("【正解】")) continue;
    if (/^正解は[選肢択]/.test(line)) continue;
    result.push(line);
  }

  return result;
}

export default function LessonScreen({
  explanation,
  lesson,
  duration = 10,
  onComplete,
  questionNumber,
  totalQuestions,
}: LessonScreenProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isExiting, setIsExiting] = useState(false);

  const handleComplete = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [onComplete]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, handleComplete]);

  // 円形プログレスの計算
  const progress = ((duration - timeLeft) / duration) * 100;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // 解説から学習コンテンツを抽出
  const contentLines = extractLearningContent(explanation);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-emerald-50 to-blue-50 transition-opacity duration-300 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                初級モード
              </span>
              <span className="text-sm text-gray-500">
                問題 {questionNumber} / {totalQuestions}
              </span>
            </div>

            {/* カウントダウンタイマー（円形） */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute text-sm font-bold text-emerald-700">
                {timeLeft}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 解説プレビュー */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* タイトル */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">
              {lesson ? lesson.title : "📖 まず解説を読もう"}
            </h2>
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              この内容を覚えてから問題に挑戦！
            </p>
          </div>

          {/* レッスン内容 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
            {lesson ? (
              <div className="space-y-4">
                {/* 導入文 */}
                <p
                  className="text-sm text-gray-700 leading-relaxed"
                  style={{ animation: "fadeInUp 0.3s ease-out both" }}
                >
                  {lesson.intro}
                </p>

                {/* 覚えるべきポイント */}
                <ul className="space-y-2 border-t border-emerald-100 pt-3">
                  {lesson.points.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${
                          (index + 1) * 0.1
                        }s both`,
                      }}
                    >
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5">
                        {index + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {/* 覚え方のコツ */}
                <div
                  className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${
                      (lesson.points.length + 1) * 0.1
                    }s both`,
                  }}
                >
                  <p className="text-sm text-amber-900 font-medium leading-relaxed">
                    💡 {lesson.tip}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {contentLines.map((line, index) => {
                  const isHeader = /^【.+】/.test(line);
                  const isPoint = /^【ポイント】/.test(line);
                  const isNumbered = /^\d+\./.test(line);

                  if (isPoint) {
                    return (
                      <div
                        key={index}
                        className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2"
                      >
                        <p className="text-sm text-amber-900 font-medium leading-relaxed">
                          💡 {line.replace(/^【ポイント】/, "").trim()}
                        </p>
                      </div>
                    );
                  }

                  if (isHeader) {
                    return (
                      <h3
                        key={index}
                        className="text-sm font-bold text-emerald-700 pt-1"
                      >
                        {line}
                      </h3>
                    );
                  }

                  return (
                    <p
                      key={index}
                      className={`text-sm text-gray-700 leading-relaxed ${
                        isNumbered ? "pl-2" : ""
                      }`}
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${
                          Math.min(index, 5) * 0.1
                        }s both`,
                      }}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* スキップボタン */}
        <div className="mt-6">
          <button
            onClick={handleComplete}
            className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-sm"
          >
            覚えた！問題へ →
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            {timeLeft}秒後に自動で問題に進みます
          </p>
        </div>
      </div>

      {/* アニメーション定義 */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
