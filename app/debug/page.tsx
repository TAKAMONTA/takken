"use client";

import { useEffect, useState } from "react";
// ビルド時の実行を避けるため、動的インポートに変更
// import { allQuestions } from "@/lib/data/questions/index";
import { getQuickTestQuestions } from "@/lib/study-utils";
import { logger } from "@/lib/logger";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const loadDebugInfo = async () => {
      try {
        // 動的インポートで問題データを読み込む
        const { allQuestions } = await import("@/lib/data/questions/index");
        
        const info = {
          allQuestionsLength: allQuestions.length,
          categories: {
            takkengyouhou: allQuestions.filter((q) => q.category === "宅建業法")
              .length,
            minpou: allQuestions.filter((q) => q.category === "民法等").length,
            hourei: allQuestions.filter((q) => q.category === "法令上の制限")
              .length,
            zeihou: allQuestions.filter((q) => q.category === "税・その他").length,
          },
          quickTestResults: {
            mixed: getQuickTestQuestions(5).length,
            takkengyouhou: getQuickTestQuestions(5).length,
            minpou: getQuickTestQuestions(5).length,
            hourei: getQuickTestQuestions(5).length,
            zeihou: getQuickTestQuestions(5).length,
          },
        };

        setDebugInfo(info);
        logger.debug("Debug info", info);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Failed to load debug info", err);
        setDebugInfo({
          allQuestionsLength: 0,
          categories: {
            takkengyouhou: 0,
            minpou: 0,
            hourei: 0,
            zeihou: 0,
          },
          quickTestResults: {
            mixed: 0,
            takkengyouhou: 0,
            minpou: 0,
            hourei: 0,
            zeihou: 0,
          },
        });
      }
    };

    loadDebugInfo();
  }, []);

  if (!debugInfo) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">デバッグ情報</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">全問題数</h2>
          <p>{debugInfo.allQuestionsLength}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">カテゴリ別問題数</h2>
          <ul>
            <li>宅建業法: {debugInfo.categories.takkengyouhou}</li>
            <li>民法等: {debugInfo.categories.minpou}</li>
            <li>法令上の制限: {debugInfo.categories.hourei}</li>
            <li>税・その他: {debugInfo.categories.zeihou}</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">ミニテスト結果</h2>
          <ul>
            <li>全分野ミックス: {debugInfo.quickTestResults.mixed}</li>
            <li>宅建業法: {debugInfo.quickTestResults.takkengyouhou}</li>
            <li>民法等: {debugInfo.quickTestResults.minpou}</li>
            <li>法令上の制限: {debugInfo.quickTestResults.hourei}</li>
            <li>税・その他: {debugInfo.quickTestResults.zeihou}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
