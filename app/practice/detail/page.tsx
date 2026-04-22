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
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* シンプルなヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/practice"
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{category.icon}</span>
              <h1 className="text-lg font-medium text-gray-900">
                {category.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* レベル選択 */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            学習レベルを選択
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* 初級 */}
            <button
              onClick={() => setSelectedLevel("beginner")}
              className={`relative rounded-xl p-4 text-left transition-all border-2 ${
                selectedLevel === "beginner"
                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {selectedLevel === "beginner" && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
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
                className={`font-bold text-sm ${
                  selectedLevel === "beginner"
                    ? "text-emerald-700"
                    : "text-gray-800"
                }`}
              >
                初級
              </div>
              <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                各問題の前にミニ授業付き。初めての方におすすめ
              </div>
            </button>

            {/* 中級 */}
            <button
              onClick={() => setSelectedLevel("intermediate")}
              className={`relative rounded-xl p-4 text-left transition-all border-2 ${
                selectedLevel === "intermediate"
                  ? "border-purple-500 bg-purple-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {selectedLevel === "intermediate" && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
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
                className={`font-bold text-sm ${
                  selectedLevel === "intermediate"
                    ? "text-purple-700"
                    : "text-gray-800"
                }`}
              >
                中級
              </div>
              <div className="text-xs text-gray-500 mt-1 leading-relaxed">
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
              className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{subCategory.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {subCategory.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {subCategory.questions}問
                    </div>
                  </div>
                </div>
                <i className="ri-arrow-right-s-line text-gray-400"></i>
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
