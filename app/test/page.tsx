"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [status, setStatus] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testImports = async () => {
      try {
        setStatus("Testing imports...");

        // 問題データのインポートをテスト
        const { allQuestions } = await import("@/lib/data/questions/index");
        console.log("allQuestions loaded:", allQuestions.length);

        // ミニテスト関数のインポートをテスト
        const { getQuickTestQuestions } = await import("@/lib/study-utils");
        console.log("getQuickTestQuestions loaded");

        // ミニテスト関数を実行
        const questions = getQuickTestQuestions(5);
        console.log("Quick test questions:", questions.length);

        setStatus(
          `Success! Loaded ${allQuestions.length} questions, got ${questions.length} for quick test`
        );
      } catch (err: any) {
        console.error("Test failed:", err);
        setError(err.message);
        setStatus("Failed");
      }
    };

    testImports();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ミニテスト機能テスト</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">ステータス</h2>
          <p className="text-blue-600">{status}</p>
        </div>

        {error && (
          <div>
            <h2 className="text-lg font-semibold text-red-600">エラー</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold">次のステップ</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>ブラウザのコンソールを開いてエラーメッセージを確認</li>
            <li>開発者ツールのNetworkタブでリクエストの状況を確認</li>
            <li>エラーが解決したら、ミニテストページにアクセス</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
