"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const practiceCategories = [
  { id: "takkengyouhou", name: "宅建業法" },
  { id: "minpou", name: "民法等" },
  { id: "hourei", name: "法令上の制限" },
  { id: "zeihou", name: "税・その他" },
];

export default function Practice() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("takken_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* シンプルなヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className="text-lg font-medium text-gray-900">学習</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* シンプルな分野選択 */}
        <div className="space-y-2">
          {practiceCategories.map((category) => (
            <Link
              key={category.id}
              href={`/practice/detail?category=${category.id}`}
            >
              <div className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">
                    {category.name}
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 弱点克服 */}
        <div className="mt-6">
          <Link href="/weak-points">
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">弱点克服</span>
                <i className="ri-arrow-right-s-line text-gray-400"></i>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* シンプルなボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            <Link
              href="/dashboard"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-home-line text-xl"></i>
              <span className="text-xs">ホーム</span>
            </Link>
            <Link
              href="/practice"
              className="flex flex-col items-center space-y-1 text-blue-600"
            >
              <i className="ri-book-open-fill text-xl"></i>
              <span className="text-xs">学習</span>
            </Link>
            <Link
              href="/stats"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-bar-chart-line text-xl"></i>
              <span className="text-xs">分析</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-user-line text-xl"></i>
              <span className="text-xs">設定</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
