"use client";

import React from "react";
import Link from "next/link";

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          決済がキャンセルされました
        </h1>

        <p className="text-gray-600 mb-8">
          決済がキャンセルされました。
          <br />
          再度お試しになる場合は、料金プランページからお申し込みください。
        </p>

        <div className="space-y-3">
          <Link
            href="/subscription/pricing"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            料金プランを見る
          </Link>

          <Link
            href="/dashboard"
            className="block w-full text-gray-600 hover:text-gray-900 py-3 px-6 rounded-lg font-medium border border-gray-200 hover:border-gray-300 transition-colors"
          >
            ダッシュボードへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}














