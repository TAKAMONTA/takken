"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AnswerFeedbackProps {
  isCorrect: boolean | null;
  streak?: number;
  isWeakPoint?: boolean;
  onComplete?: () => void;
}

export default function AnswerFeedback({
  isCorrect,
  streak = 0,
  isWeakPoint = false,
  onComplete,
}: AnswerFeedbackProps) {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isCorrect !== null) {
      // アニメーション完了後にコールバック
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);

      // 3連続正解で花火演出
      if (isCorrect && streak >= 3) {
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 2000);
      }

      return () => clearTimeout(timer);
    }
  }, [isCorrect, streak, onComplete]);

  // 正解・不正解の絵文字と色を決定
  const getEmoji = () => {
    if (isCorrect === null) return null;

    if (isCorrect) {
      // 苦手問題を正解した時は特別演出
      if (isWeakPoint) return "🎉";
      // 連続正解数に応じて変化
      if (streak >= 5) return "🔥";
      if (streak >= 3) return "⭐";
      return "✨";
    }
    return "💭";
  };

  const getMessage = () => {
    if (isCorrect === null) return null;

    if (isCorrect) {
      if (isWeakPoint) return "苦手克服！素晴らしい！";
      if (streak >= 5) return `${streak}連続正解！絶好調！`;
      if (streak >= 3) return `${streak}連続正解！`;
      return "正解！";
    }
    return "もう一度確認しよう";
  };

  const getColor = () => {
    if (isCorrect === null) return "";
    return isCorrect ? "text-green-600" : "text-orange-600";
  };

  const getBgColor = () => {
    if (isCorrect === null) return "";
    return isCorrect ? "bg-green-50" : "bg-orange-50";
  };

  const getBorderColor = () => {
    if (isCorrect === null) return "";
    return isCorrect ? "border-green-200" : "border-orange-200";
  };

  return (
    <AnimatePresence mode="wait">
      {isCorrect !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* 花火エフェクト（3連続正解以上） */}
          {showFireworks && (
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    x: "50vw",
                    y: "50vh",
                    scale: 0,
                  }}
                  animate={{
                    opacity: [1, 1, 0],
                    x: `${50 + Math.cos((i * Math.PI) / 4) * 30}vw`,
                    y: `${50 + Math.sin((i * Math.PI) / 4) * 30}vh`,
                    scale: [0, 1.5, 0],
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute text-6xl"
                >
                  🎆
                </motion.div>
              ))}
            </div>
          )}

          {/* メインフィードバック */}
          <motion.div
            initial={{ scale: 1 }}
            animate={
              isCorrect
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }
                : {
                    scale: [1, 0.95, 1],
                    x: [0, -10, 10, 0],
                  }
            }
            transition={{ duration: 0.5 }}
            className={`${getBgColor()} ${getBorderColor()} border-2 rounded-2xl p-8 shadow-2xl pointer-events-auto max-w-md mx-4`}
          >
            {/* 絵文字アニメーション */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center mb-4"
            >
              <span className="text-8xl">{getEmoji()}</span>
            </motion.div>

            {/* メッセージ */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className={`text-center ${getColor()}`}
            >
              <p className="text-3xl font-bold mb-2">{getMessage()}</p>

              {/* 連続正解表示 */}
              {isCorrect && streak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="flex items-center justify-center gap-1 mt-3"
                >
                  {[...Array(Math.min(streak, 5))].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.6 + i * 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="text-2xl"
                    >
                      {streak >= 5 ? "🔥" : "⭐"}
                    </motion.span>
                  ))}
                  {streak > 5 && (
                    <span className="text-xl font-bold ml-2">
                      +{streak - 5}
                    </span>
                  )}
                </motion.div>
              )}

              {/* 苦手克服メッセージ */}
              {isCorrect && isWeakPoint && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm mt-3 text-green-700"
                >
                  この問題を克服しました！
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
