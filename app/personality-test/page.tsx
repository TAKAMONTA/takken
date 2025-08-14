'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    type: 'planner' | 'scholar' | 'team' | 'strategist';
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "宅建の勉強を始めるとき、あなたはどのようなアプローチを取りますか？",
    options: [
      { text: "詳細な学習計画を立てて、段階的に進める", type: "planner" },
      { text: "まず興味のある分野から深く学習する", type: "scholar" },
      { text: "仲間と一緒に勉強会を開く", type: "team" },
      { text: "過去問を分析して重要分野を特定する", type: "strategist" }
    ]
  },
  {
    id: 2,
    question: "学習方法として最も効果的だと思うのはどれですか？",
    options: [
      { text: "詳細な教材を順番に読み込む", type: "planner" },
      { text: "実例やケーススタディで理解を深める", type: "scholar" },
      { text: "グループディスカッションで知識を共有する", type: "team" },
      { text: "要点を整理したまとめ資料で効率学習", type: "strategist" }
    ]
  },
  {
    id: 3,
    question: "学習でつまずいたとき、どのように対処しますか？",
    options: [
      { text: "基礎に戻って丁寧に復習する", type: "planner" },
      { text: "多角的に調べて納得するまで理解する", type: "scholar" },
      { text: "仲間や先生に積極的に質問する", type: "team" },
      { text: "一旦置いて他の分野を先に進める", type: "strategist" }
    ]
  },
  {
    id: 4,
    question: "理想的な学習スケジュールはどれですか？",
    options: [
      { text: "毎日30-60分のコツコツ学習", type: "planner" },
      { text: "興味に応じて柔軟に2-3時間", type: "scholar" },
      { text: "週3-4回、仲間と1-2時間ずつ", type: "team" },
      { text: "短時間集中で週5-6回", type: "strategist" }
    ]
  },
  {
    id: 5,
    question: "宅建試験に向けてのモチベーションの源は何ですか？",
    options: [
      { text: "着実な成長を実感すること", type: "planner" },
      { text: "新しい知識を深く理解すること", type: "scholar" },
      { text: "仲間と励まし合いながら頑張ること", type: "team" },
      { text: "効率よく目標達成すること", type: "strategist" }
    ]
  }
];

const personalityTypes = {
  planner: {
    name: "着実な計画家",
    icon: "🐉",
    description: "計画的で継続性重視、基礎から積み上げるタイプ",
    petType: "dragon",
    color: "bg-green-500"
  },
  scholar: {
    name: "探究心旺盛な学者",
    icon: "🦉",
    description: "好奇心が強く、深い理解を求めるタイプ",
    petType: "owl",
    color: "bg-blue-500"
  },
  team: {
    name: "協調的なチームプレイヤー",
    icon: "🐺",
    description: "他者との交流を通して学ぶタイプ",
    petType: "dog",
    color: "bg-orange-500"
  },
  strategist: {
    name: "効率重視の戦略家",
    icon: "🦁",
    description: "限られた時間で最大成果を求めるタイプ",
    petType: "cat",
    color: "bg-purple-500"
  }
};

export default function PersonalityTest() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnswer = () => {
    if (!selectedOption) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 診断結果を計算
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (allAnswers: string[]) => {
    const counts = {
      planner: 0,
      scholar: 0,
      team: 0,
      strategist: 0
    };

    allAnswers.forEach(answer => {
      counts[answer as keyof typeof counts]++;
    });

    const dominantType = Object.entries(counts).reduce((a, b) =>
      counts[a[0] as keyof typeof counts] > counts[b[0] as keyof typeof counts] ? a : b
    )[0] as keyof typeof personalityTypes;

    const personalityResult = personalityTypes[dominantType];
    setResult(personalityResult);
    setIsComplete(true);

    // ユーザーデータを更新
    const userData = JSON.parse(localStorage.getItem('takken_rpg_user') || '{}');
    userData.personalityType = {
      type: dominantType,
      name: personalityResult.name,
      icon: personalityResult.icon,
      description: personalityResult.description
    };
    
    // ペットを割り当て
    userData.pet = {
      type: personalityResult.petType,
      stage: 1,
      level: 1,
      happiness: 100,
      hunger: 50,
      xp: 0
    };

    localStorage.setItem('takken_rpg_user', JSON.stringify(userData));
  };

  const handleComplete = () => {
    router.push('/personality-result');
  };

  if (isComplete && result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        {/* ヘッダー */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-800 text-center">診断完了！</h1>
          </div>
        </div>

        {/* 結果表示 */}
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{result.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {result.name}
              </h2>
              <p className="text-gray-600">
                {result.description}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-2">🐾 あなたのパートナー</h3>
              <div className="flex items-center justify-center">
                <div className="text-4xl">🥚</div>
              </div>
              <p className="text-sm text-gray-600 text-center mt-2">
                学習を進めると、あなた専用のペットが成長します！
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-700 transition-colors !rounded-button"
            >
              学習プランを見る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link href="/auth/register" className="text-purple-600 mr-4">
            <i className="ri-arrow-left-line text-xl"></i>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">性格診断</h1>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          {currentQuestion + 1} / {questions.length}
        </p>
      </div>

      {/* 質問 */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🧠</div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {questions[currentQuestion].question}
            </h2>
          </div>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option.type)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all !rounded-button ${
                  selectedOption === option.type
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="text-sm text-gray-800">{option.text}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleAnswer}
            disabled={!selectedOption}
            className="w-full mt-6 bg-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
          >
            {currentQuestion === questions.length - 1 ? '診断結果を見る' : '次へ'}
          </button>
        </div>
      </div>
    </div>
  );
}