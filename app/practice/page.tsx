"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requireCachedUserForCurrentAuth } from "@/lib/auth-cache";

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
    let cancelled = false;

    requireCachedUserForCurrentAuth<any>(() => router.push("/auth/login"))
      .then((cachedUser) => {
        if (!cancelled && cachedUser) {
          setUser(cachedUser);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !user) {
    return (
      <div className="study-shell flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="study-shell">
      <header className="border-b border-study-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="tap-target flex items-center justify-center text-study-muted hover:text-study-ink"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className="text-lg font-semibold text-study-ink">AI予想問題</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 pb-safe-nav">
        <div className="space-y-3">
          {practiceCategories.map((category) => (
            <Link
              key={category.id}
              href={`/practice/detail?category=${category.id}`}
            >
              <div className="study-card mb-3 p-4 transition-colors hover:bg-study-accent-soft/50">
                <div className="flex min-h-[44px] items-center justify-between">
                  <span className="font-medium text-study-ink">
                    {category.name}
                  </span>
                  <i className="ri-arrow-right-s-line text-study-muted"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <Link href="/weak-points">
            <div className="study-card p-4 transition-colors hover:bg-study-accent-soft/50">
              <div className="flex min-h-[44px] items-center justify-between">
                <span className="font-medium text-study-ink">弱点克服</span>
                <i className="ri-arrow-right-s-line text-study-muted"></i>
              </div>
            </div>
          </Link>
        </div>
      </main>

      <nav className="study-bottom-nav" aria-label="メインメニュー">
        <div className="study-bottom-nav-inner">
          <Link href="/dashboard" className="study-nav-item">
            <i className="ri-home-line text-xl"></i>
            <span>ホーム</span>
          </Link>
          <Link href="/practice" className="study-nav-item study-nav-item-active">
            <i className="ri-book-open-line text-xl"></i>
            <span>学習</span>
          </Link>
          <Link href="/mock-exam" className="study-nav-item">
            <i className="ri-file-list-3-line text-xl"></i>
            <span>模試</span>
          </Link>
          <Link href="/weak-points" className="study-nav-item">
            <i className="ri-target-line text-xl"></i>
            <span>弱点</span>
          </Link>
          <Link href="/profile" className="study-nav-item">
            <i className="ri-user-line text-xl"></i>
            <span>設定</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
