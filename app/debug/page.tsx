"use client";

import { useEffect, useState } from "react";
import { allQuestions } from "@/lib/data/questions/index";
import { getQuickTestQuestions } from "@/lib/study-utils";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
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
        mixed: getQuickTestQuestions("mixed", 5).length,
        takkengyouhou: getQuickTestQuestions("takkengyouhou", 5).length,
        minpou: getQuickTestQuestions("minpou", 5).length,
        hourei: getQuickTestQuestions("hourei", 5).length,
        zeihou: getQuickTestQuestions("zeihou", 5).length,
      },
    };

    setDebugInfo(info);
    console.log("Debug info:", info);
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
