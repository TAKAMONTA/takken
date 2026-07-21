"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const practiceCategories = {
  takkengyouhou: {
    name: "宅建業法",
    icon: "🏢",
    subCategories: [
      {
        id: "takken-license",
        name: "免許制度",
        description: "宅建業の免許、更新、廃業等",
        questions: 45,
        difficulty: { basic: 25, intermediate: 15, advanced: 5 },
        icon: "📋",
      },
      {
        id: "takken-business",
        name: "業務規制",
        description: "広告規制、契約締結時期の制限等",
        questions: 38,
        difficulty: { basic: 20, intermediate: 12, advanced: 6 },
        icon: "⚖️",
      },
      {
        id: "takken-supervision",
        name: "監督処分",
        description: "指示処分、業務停止、免許取消等",
        questions: 28,
        difficulty: { basic: 15, intermediate: 8, advanced: 5 },
        icon: "⚠️",
      },
      {
        id: "takken-guarantee",
        name: "営業保証金・保証協会",
        description: "営業保証金の供託、保証協会制度",
        questions: 25,
        difficulty: { basic: 12, intermediate: 8, advanced: 5 },
        icon: "💰",
      },
      {
        id: "takken-contract",
        name: "契約・重要事項説明",
        description: "37条書面、35条書面の作成・交付",
        questions: 20,
        difficulty: { basic: 8, intermediate: 7, advanced: 5 },
        icon: "📄",
      },
    ],
  },
  minpou: {
    name: "民法等",
    icon: "⚖️",
    subCategories: [
      {
        id: "civil-property",
        name: "物権法",
        description: "所有権、抵当権、地上権等",
        questions: 35,
        difficulty: { basic: 15, intermediate: 12, advanced: 8 },
        icon: "🏠",
      },
      {
        id: "civil-debt",
        name: "債権法",
        description: "契約、不法行為、保証等",
        questions: 32,
        difficulty: { basic: 12, intermediate: 12, advanced: 8 },
        icon: "🤝",
      },
      {
        id: "civil-family",
        name: "親族・相続法",
        description: "相続、遺言、親族関係等",
        questions: 25,
        difficulty: { basic: 10, intermediate: 10, advanced: 5 },
        icon: "👨‍👩‍👧‍👦",
      },
      {
        id: "civil-general",
        name: "総則",
        description: "意思表示、代理、時効等",
        questions: 20,
        difficulty: { basic: 8, intermediate: 8, advanced: 4 },
        icon: "📚",
      },
      {
        id: "civil-other",
        name: "その他民法",
        description: "借地借家法、区分所有法等",
        questions: 12,
        difficulty: { basic: 5, intermediate: 4, advanced: 3 },
        icon: "🏘️",
      },
    ],
  },
  hourei: {
    name: "法令上の制限",
    icon: "📋",
    subCategories: [
      {
        id: "urban-planning",
        name: "都市計画法",
        description: "開発許可、用途地域等",
        questions: 28,
        difficulty: { basic: 15, intermediate: 8, advanced: 5 },
        icon: "🏙️",
      },
      {
        id: "building-standards",
        name: "建築基準法",
        description: "建蔽率、容積率、高さ制限等",
        questions: 25,
        difficulty: { basic: 12, intermediate: 8, advanced: 5 },
        icon: "🏗️",
      },
      {
        id: "agricultural-land",
        name: "農地法",
        description: "農地転用、売買許可等",
        questions: 15,
        difficulty: { basic: 8, intermediate: 4, advanced: 3 },
        icon: "🌾",
      },
      {
        id: "land-use",
        name: "国土利用計画法",
        description: "土地取引の届出・許可制度",
        questions: 12,
        difficulty: { basic: 6, intermediate: 4, advanced: 2 },
        icon: "🗾",
      },
      {
        id: "other-laws",
        name: "その他法令",
        description: "宅地造成等規制法、土地区画整理法等",
        questions: 18,
        difficulty: { basic: 10, intermediate: 5, advanced: 3 },
        icon: "📜",
      },
    ],
  },
  zeihou: {
    name: "税・その他",
    icon: "💰",
    subCategories: [
      {
        id: "tax-income",
        name: "所得税",
        description: "不動産所得、譲渡所得等",
        questions: 18,
        difficulty: { basic: 10, intermediate: 5, advanced: 3 },
        icon: "💸",
      },
      {
        id: "tax-property",
        name: "固定資産税・都市計画税",
        description: "課税標準、軽減措置等",
        questions: 15,
        difficulty: { basic: 8, intermediate: 4, advanced: 3 },
        icon: "🏘️",
      },
      {
        id: "tax-acquisition",
        name: "不動産取得税・登録免許税",
        description: "税率、軽減措置等",
        questions: 12,
        difficulty: { basic: 6, intermediate: 4, advanced: 2 },
        icon: "📋",
      },
      {
        id: "appraisal",
        name: "不動産鑑定評価",
        description: "鑑定評価基準、価格形成要因等",
        questions: 12,
        difficulty: { basic: 6, intermediate: 4, advanced: 2 },
        icon: "📊",
      },
      {
        id: "statistics",
        name: "統計・その他",
        description: "地価公示、建築着工統計等",
        questions: 10,
        difficulty: { basic: 5, intermediate: 3, advanced: 2 },
        icon: "📈",
      },
    ],
  },
};

type QuizLevel = "beginner" | "intermediate";

function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel>("beginner");

  const category = categoryId
    ? practiceCategories[categoryId as keyof typeof practiceCategories]
    : null;

  const handleStartQuiz = (subCategoryId: string) => {
    router.push(
      `/practice/quiz?category=${categoryId}&subcategory=${subCategoryId}&level=${selectedLevel}`
    );
  };

  if (!category) {
    return (
      <div className="study-shell flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">カテゴリが見つかりません</p>
          <Link href="/practice">
            <button className="button-minimal">戻る</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="study-shell">
      {/* シンプルなヘッダー */}
      <header className="border-b border-study-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/practice"
              className="tap-target flex items-center justify-center text-study-muted hover:text-study-ink"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{category.icon}</span>
              <h1 className="text-lg font-semibold text-study-ink">
                {category.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 pb-safe">
        {/* レベル選択 */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-study-muted">
            学習レベルを選択
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* 初級 */}
            <button
              onClick={() => setSelectedLevel("beginner")}
              className={`relative min-h-[44px] rounded-xl border-2 p-4 text-left transition-all ${
                selectedLevel === "beginner"
                  ? "border-study-beginner bg-study-beginner-soft shadow-sm"
                  : "border-study-border bg-white hover:border-study-accent"
              }`}
            >
              {selectedLevel === "beginner" && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-study-beginner">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              <div className="text-2xl mb-1">🌱</div>
              <div
                className={`text-sm font-bold ${
                  selectedLevel === "beginner"
                    ? "text-study-beginner"
                    : "text-study-ink"
                }`}
              >
                初級
              </div>
              <div className="mt-1 text-xs leading-relaxed text-study-muted">
                各問題の前にミニ授業付き。初めての方におすすめ
              </div>
            </button>

            {/* 中級 */}
            <button
              onClick={() => setSelectedLevel("intermediate")}
              className={`relative min-h-[44px] rounded-xl border-2 p-4 text-left transition-all ${
                selectedLevel === "intermediate"
                  ? "border-study-accent bg-study-accent-soft shadow-sm"
                  : "border-study-border bg-white hover:border-study-accent"
              }`}
            >
              {selectedLevel === "intermediate" && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-study-accent">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              <div className="text-2xl mb-1">🔥</div>
              <div
                className={`text-sm font-bold ${
                  selectedLevel === "intermediate"
                    ? "text-study-accent"
                    : "text-study-ink"
                }`}
              >
                中級
              </div>
              <div className="mt-1 text-xs leading-relaxed text-study-muted">
                問題に直接挑戦。学習経験のある方向け
              </div>
            </button>
          </div>
        </div>

        {/* 分野選択 */}
        <div className="space-y-2">
          {category.subCategories.map((subCategory) => (
            <button
              key={subCategory.id}
              onClick={() => handleStartQuiz(subCategory.id)}
              className="study-card w-full min-h-[44px] p-4 text-left transition-colors hover:bg-study-accent-soft/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{subCategory.icon}</span>
                  <div>
                    <div className="font-medium text-study-ink">
                      {subCategory.name}
                    </div>
                    <div className="text-sm text-study-muted">
                      {subCategory.questions}問
                    </div>
                  </div>
                </div>
                <i className="ri-arrow-right-s-line text-study-muted"></i>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function PracticeDetail() {
  return (
    <Suspense
      fallback={
        <div className="study-shell flex items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
