"use client";

import Link from "next/link";

interface AIUsageLimitNoticeProps {
  message?: string;
  compact?: boolean;
}

export default function AIUsageLimitNotice({
  message = "今月の無料AI利用回数に達しました。",
  compact = false,
}: AIUsageLimitNoticeProps) {
  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-purple-900">
      <p className={compact ? "text-xs font-medium" : "text-sm font-medium"}>
        {message}
      </p>
      <p className="mt-1 text-xs text-purple-700">
        プレミアムプランではAIヒント・解説を無制限で利用できます。
      </p>
      <Link
        href="/subscription/pricing"
        className="mt-2 inline-flex items-center rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
      >
        プレミアムプランを見る
      </Link>
    </div>
  );
}
