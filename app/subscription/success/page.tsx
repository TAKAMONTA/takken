"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/lib/hooks/use-subscription";

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const { refreshSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (sessionId) {
      // サブスクリプション情報をリフレッシュ
      refreshSubscription().finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [searchParams, refreshSubscription]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">処理中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ご登録ありがとうございます！
        </h1>

        <p className="text-gray-600 mb-8">
          プレミアムプランの登録が完了しました。
          <br />
          すべての機能をご利用いただけます。
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            ダッシュボードへ
          </Link>

          <Link
            href="/subscription"
            className="block w-full text-purple-600 hover:text-purple-700 py-3 px-6 rounded-lg font-medium border border-purple-200 hover:border-purple-300 transition-colors"
          >
            サブスクリプション管理
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
