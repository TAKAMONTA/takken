"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getWeaknessItems,
  WeaknessItem,
} from "@/lib/weakness-helper";

/**
 * 呼び出し: dashboard quickActions → /weak-points
 * 既存: 同パスの空 weaknessData 版を置き換え
 * 指示: Implement the plan as specified... Do NOT edit the plan file itself.
 */

const studyMethods = [
  {
    id: "intensive",
    title: "集中特訓",
    icon: "💪",
    description: "この分野だけを徹底的に学習",
    questions: 10,
  },
  {
    id: "mixed",
    title: "ミックス学習",
    icon: "🎯",
    description: "弱点分野を他分野と混ぜて出題",
    questions: 8,
  },
  {
    id: "explanation",
    title: "解説重視",
    icon: "📚",
    description: "少なめの問題で解説を丁寧に",
    questions: 6,
  },
];

export default function WeakPoints() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weaknesses, setWeaknesses] = useState<WeaknessItem[]>([]);
  const [selectedWeakness, setSelectedWeakness] = useState<WeaknessItem | null>(
    null
  );
  const [selectedMethod, setSelectedMethod] = useState<string>("intensive");

  useEffect(() => {
    const savedUser = localStorage.getItem("takken_user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      const items = getWeaknessItems(userData.id);
      setWeaknesses(items);
      if (items.length > 0) {
        setSelectedWeakness(items[0]);
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const handleStartWeakPointStudy = () => {
    if (!selectedWeakness || !selectedMethod) {
      alert("弱点分野と学習方法を選択してください");
      return;
    }

    router.push(
      `/weak-points/quiz?topic=${selectedWeakness.id}&method=${selectedMethod}`
    );
  };

  if (loading) {
    return (
      <div className="study-shell flex items-center justify-center">
        <div className="text-xl font-bold text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="study-shell flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Link href="/">
            <button className="study-btn max-w-xs">
              ホームに戻る
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isFresh = weaknesses.every((w) => w.isDefault);

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
            <h1 className="text-lg font-semibold text-study-ink">弱点克服</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 pb-safe-nav">
        <div className="study-card mb-6 p-4">
          <div className="text-center">
            <div className="mb-2 text-2xl">💪</div>
            <h2 className="mb-1 text-lg font-medium text-study-ink">弱点克服</h2>
            <p className="text-sm text-study-muted">
              {isFresh
                ? "まだ学習履歴が少ないので、おすすめ分野から始めましょう"
                : "正答率が低い分野から集中学習できます"}
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-medium text-study-ink">分野を選択</h3>
          <div className="space-y-3">
            {weaknesses.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedWeakness(item)}
                className={`study-option ${
                  selectedWeakness?.id === item.id
                    ? "study-option-selected"
                    : ""
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-medium text-study-ink">
                        {item.name}
                        {item.accuracy !== null && item.accuracy < 70 && (
                          <span className="ml-2 text-xs font-normal text-study-accent">
                            要強化
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-study-muted">{item.reason}</div>
                    </div>
                  </div>
                  {item.accuracy !== null && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-study-ink">
                        {item.accuracy}%
                      </div>
                      <div className="text-xs text-study-muted">
                        {item.total}問
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-study-ink">学習方法</h3>
          <div className="space-y-3">
            {studyMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`study-option ${
                  selectedMethod === method.id
                    ? "study-option-selected"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{method.icon}</span>
                  <div>
                    <div className="font-medium text-study-ink">
                      {method.title}
                      <span className="ml-2 text-xs text-study-muted">
                        {method.questions}問
                      </span>
                    </div>
                    <div className="text-sm text-study-muted">
                      {method.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleStartWeakPointStudy}
            disabled={!selectedWeakness || !selectedMethod}
            className="study-btn disabled:cursor-not-allowed disabled:opacity-50"
          >
            {selectedWeakness
              ? `${selectedWeakness.name}の克服を開始`
              : "分野を選択してください"}
          </button>
        </div>
      </main>

      <nav className="study-bottom-nav" aria-label="メインメニュー">
        <div className="study-bottom-nav-inner">
          <Link href="/dashboard" className="study-nav-item">
            <i className="ri-home-line text-xl"></i>
            <span>ホーム</span>
          </Link>
          <Link href="/practice" className="study-nav-item">
            <i className="ri-book-open-line text-xl"></i>
            <span>学習</span>
          </Link>
          <Link href="/mock-exam" className="study-nav-item">
            <i className="ri-file-list-3-line text-xl"></i>
            <span>模試</span>
          </Link>
          <Link href="/weak-points" className="study-nav-item study-nav-item-active">
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
