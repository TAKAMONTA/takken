"use client";

import { useEffect } from "react";
import { initializeFirebaseWithFallback } from "@/lib/firebase-client";

/**
 * Firebase Client SDK初期化コンポーネント
 * アプリ起動時にFirebaseを初期化します
 */
export default function FirebaseInitializer() {
  useEffect(() => {
    // ブラウザ環境でのみ初期化
    if (typeof window !== "undefined") {
      initializeFirebaseWithFallback().catch((error) => {
        console.error("[Firebase] 初期化エラー:", error);
      });
    }
  }, []);

  // このコンポーネントはUIを持たない
  return null;
}

