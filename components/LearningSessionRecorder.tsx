"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LearningProgressTracker,
  LearningSession,
} from "@/lib/learning-progress-tracker";
import { logger } from "@/lib/logger";

interface LearningSessionRecorderProps {
  userId: string;
  category: string;
  strategyId: string;
  onSessionComplete?: (sessionId: string) => void;
}

export default function LearningSessionRecorder({
  userId,
  category,
  strategyId,
  onSessionComplete,
}: LearningSessionRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [notes, setNotes] = useState("");

  const startSession = () => {
    setIsRecording(true);
    setStartTime(new Date());
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setSkippedQuestions(0);
    setConfidenceLevel(3);
    setNotes("");
  };

  const endSession = async () => {
    if (!startTime) return;

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    ); // 分単位

    const session: Omit<LearningSession, "id"> = {
      userId,
      sessionDate: startTime,
      duration,
      category,
      strategyId,
      questionsAnswered,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      confidenceLevel,
      difficulty,
      notes: notes.trim() || undefined,
    };

    try {
      const sessionId = await LearningProgressTracker.recordLearningSession(
        session
      );
      logger.info("学習セッションが記録されました", {
        sessionId,
        userId,
        category,
        strategyId,
      });

      if (onSessionComplete) {
        onSessionComplete(sessionId);
      }

      // セッションをリセット
      setIsRecording(false);
      setStartTime(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("学習セッションの記録に失敗しました", err, {
        userId,
        category,
        strategyId,
      });
    }
  };

  const recordAnswer = (isCorrect: boolean, isSkipped: boolean = false) => {
    if (!isRecording) return;

    setQuestionsAnswered((prev) => prev + 1);

    if (isSkipped) {
      setSkippedQuestions((prev) => prev + 1);
    } else if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setIncorrectAnswers((prev) => prev + 1);
    }
  };

  const getSessionDuration = (): string => {
    if (!startTime) return "0分";

    const now = new Date();
    const duration = Math.floor(
      (now.getTime() - startTime.getTime()) / (1000 * 60)
    );
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  const getAccuracy = (): number => {
    if (questionsAnswered === 0) return 0;
    return Math.round((correctAnswers / questionsAnswered) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        📊 学習セッション記録
      </h3>

      {!isRecording ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {category}の学習を開始して、進捗を記録しましょう
          </p>
          <button
            onClick={startSession}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors"
          >
            学習開始
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* セッション情報 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getSessionDuration()}
              </div>
              <div className="text-sm text-gray-600">学習時間</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {questionsAnswered}
              </div>
              <div className="text-sm text-gray-600">解答問題数</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {getAccuracy()}%
              </div>
              <div className="text-sm text-gray-600">正答率</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {confidenceLevel}/5
              </div>
              <div className="text-sm text-gray-600">自信度</div>
            </div>
          </div>

          {/* 詳細統計 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">詳細統計</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">{correctAnswers}</div>
                <div className="text-gray-600">正解</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600">{incorrectAnswers}</div>
                <div className="text-gray-600">不正解</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-600">
                  {skippedQuestions}
                </div>
                <div className="text-gray-600">スキップ</div>
              </div>
            </div>
          </div>

          {/* 設定 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自信度 (1: 全く自信なし - 5: 完全に自信あり)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setConfidenceLevel(level as 1 | 2 | 3 | 4 | 5)
                    }
                    className={`w-10 h-10 rounded-full font-bold transition-colors ${
                      confidenceLevel === level
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                問題の難易度
              </label>
              <div className="flex space-x-2">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      difficulty === level
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {level === "easy"
                      ? "簡単"
                      : level === "medium"
                      ? "普通"
                      : "難しい"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学習メモ (任意)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="学習の感想や気づいたことを記録してください..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex space-x-4">
            <button
              onClick={endSession}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              セッション終了
            </button>
            <button
              onClick={() => setIsRecording(false)}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-700 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
