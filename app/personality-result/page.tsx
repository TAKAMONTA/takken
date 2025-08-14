'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const learningPlans = {
  planner: {
    icon: '🐉',
    name: '着実な計画家',
    color: 'from-green-400 to-green-600',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    approach: '段階的で継続的な学習アプローチ',
    schedule: '毎日30-60分のコツコツ学習',
    strengths: '継続性と基礎固めを重視した着実な成長',
    recommendations: [
      {
        category: '📅 学習スケジュール',
        items: [
          '毎日決まった時間に30-60分の学習',
          '週単位での学習計画を立てる',
          '進捗チェックリストで達成感を得る'
        ]
      },
      {
        category: '📚 学習方法',
        items: [
          '基礎から順番に体系的に学習',
          '復習スケジュールを組み込む',
          '間違えた問題は必ず復習ノートに記録'
        ]
      },
      {
        category: '🎯 重点対策',
        items: [
          '宅建業法から確実にマスター',
          '過去問は年度順に解いて傾向把握',
          '模試は本番2ヶ月前から定期実施'
        ]
      }
    ]
  },
  scholar: {
    icon: '🦉',
    name: '探究心旺盛な学者',
    color: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    approach: '深い理解を追求する探究型学習',
    schedule: '興味に応じて柔軟に2-3時間',
    strengths: '深い理解力と関連知識の習得',
    recommendations: [
      {
        category: '🔍 学習アプローチ',
        items: [
          '興味のある分野から深く掘り下げる',
          '関連法規や判例も併せて学習',
          '「なぜ？」を大切にした理解重視'
        ]
      },
      {
        category: '📖 学習リソース',
        items: [
          '詳細な解説書や専門書を活用',
          '判例集で実務的な理解を深める',
          'オンライン講座で多角的に学習'
        ]
      },
      {
        category: '💡 学習のコツ',
        items: [
          '疑問点は徹底的に調べて解決',
          '関連分野の横断的な学習',
          '理解したことを自分の言葉で説明'
        ]
      }
    ]
  },
  team: {
    icon: '🐺',
    name: '協調的なチームプレイヤー',
    color: 'from-orange-400 to-orange-600',
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50',
    approach: '仲間との協調学習で相互成長',
    schedule: '週3-4回、仲間と1-2時間ずつ',
    strengths: 'モチベーション維持と知識の共有',
    recommendations: [
      {
        category: '👥 グループ学習',
        items: [
          '勉強仲間やオンラインコミュニティに参加',
          '週1回のグループ勉強会を開催',
          '互いに問題を出し合って理解度チェック'
        ]
      },
      {
        category: '💬 コミュニケーション重視',
        items: [
          '分からない点は積極的に質問',
          '学んだことを仲間に説明して定着',
          'SNSで学習進捗を共有してモチベーション維持'
        ]
      },
      {
        category: '🤝 相互サポート',
        items: [
          '得意分野を教え合う',
          '励まし合いながら継続',
          '合格体験談を共有して目標を明確化'
        ]
      }
    ]
  },
  strategist: {
    icon: '🦁',
    name: '効率重視の戦略家',
    color: 'from-purple-400 to-purple-600',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    approach: '効率性を重視した戦略的学習',
    schedule: '短時間集中で週5-6回',
    strengths: '時間効率と重要分野の集中攻略',
    recommendations: [
      {
        category: '⚡ 効率化戦略',
        items: [
          '過去問分析で頻出分野を特定',
          '短時間集中学習（ポモドーロ法活用）',
          '重要度に応じた学習時間の配分'
        ]
      },
      {
        category: '🎯 重点対策',
        items: [
          '宅建業法は満点を目指す',
          '民法は重要条文に絞って学習',
          '法令制限は暗記項目を効率的に覚える'
        ]
      },
      {
        category: '📊 進捗管理',
        items: [
          'データで学習効果を可視化',
          '弱点分野を特定して集中対策',
          '模試結果を分析して戦略調整'
        ]
      }
    ]
  }
};

export default function PersonalityResult() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('takken_rpg_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  const handleStartLearning = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !user.personalityType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">性格診断が完了していません</p>
          <Link href="/personality-test">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold !rounded-button">
              性格診断を受ける
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const plan = learningPlans[user.personalityType.type as keyof typeof learningPlans];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link href="/personality-test" className="text-purple-600 mr-4">
            <i className="ri-arrow-left-line text-xl"></i>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">あなたの学習プラン</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 性格タイプ表示 */}
        <div className={`bg-gradient-to-r ${plan.color} rounded-xl p-6 text-white`}>
          <div className="text-center">
            <div className="text-5xl mb-3">{plan.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-white/90 text-sm">{user.personalityType.description}</p>
          </div>
        </div>

        {/* 学習アプローチ概要 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-800">🎯 あなたの学習スタイル</h3>
          <div className="space-y-3">
            <div className={`${plan.bgColor} ${plan.borderColor} border rounded-lg p-3`}>
              <div className="text-sm font-medium text-gray-700 mb-1">基本方針</div>
              <div className="text-gray-800">{plan.approach}</div>
            </div>
            <div className={`${plan.bgColor} ${plan.borderColor} border rounded-lg p-3`}>
              <div className="text-sm font-medium text-gray-700 mb-1">推奨スケジュール</div>
              <div className="text-gray-800">{plan.schedule}</div>
            </div>
            <div className={`${plan.bgColor} ${plan.borderColor} border rounded-lg p-3`}>
              <div className="text-sm font-medium text-gray-700 mb-1">あなたの強み</div>
              <div className="text-gray-800">{plan.strengths}</div>
            </div>
          </div>
        </div>

        {/* 詳細推奨事項 */}
        <div className="space-y-4">
          {plan.recommendations.map((section, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-3 text-gray-800">{section.category}</h4>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-2">
                    <div className="text-purple-500 mt-1">
                      <i className="ri-checkbox-circle-line text-sm"></i>
                    </div>
                    <div className="text-sm text-gray-700">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ペット紹介 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-800">🐾 あなたのパートナー</h3>
          <div className="text-center">
            <div className="text-4xl mb-3">🥚</div>
            <p className="text-sm text-gray-600">
              学習を進めると、あなた専用の{plan.name}タイプのペットが成長します！
            </p>
            <div className="mt-3 text-xs text-gray-500">
              経験値を貯めてペットを進化させよう
            </div>
          </div>
        </div>

        {/* 学習開始ボタン */}
        <div className="sticky bottom-4">
          <button
            onClick={handleStartLearning}
            className={`w-full bg-gradient-to-r ${plan.color} text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all !rounded-button`}
          >
            🚀 学習を開始する
          </button>
        </div>
      </div>
    </div>
  );
}