'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const subjects = [
  {
    id: 'takkengyouhou',
    name: '宅建業法',
    icon: '🏢',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    points: [
      '重要事項説明書（35条書面）の記載事項を完全把握',
      '37条書面（契約書）との違いを明確に理解',
      '自ら売主の制限（8種制限）を体系的に整理',
      '広告規制の具体的内容をマスター'
    ],
    tips: [
      '条文を読んだらすぐに問題演習で定着を確認',
      '似ている制度の違いを表にまとめる',
      '重要な数値（期間・金額）は必ず暗記'
    ],
    targetScore: '20問中18問正解',
    studyTime: '総学習時間の40%（120時間程度）'
  },
  {
    id: 'minpou',
    name: '民法等',
    icon: '⚖️',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    points: [
      '代理と不動産物権変動（最重要分野）',
      '制限行為能力者制度の完全理解',
      '抵当権と保証人の責任範囲',
      '賃貸借契約の重要論点'
    ],
    tips: [
      '問題文を1文ずつ区切って読む習慣をつける',
      '登場人物の関係を図に描いて整理',
      '判例の結論とその理由を必ず押さえる'
    ],
    targetScore: '14問中7-9問正解',
    studyTime: '総学習時間の35%（105時間程度）'
  },
  {
    id: 'hourei',
    name: '法令上の制限',
    icon: '📋',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    points: [
      '都市計画法の開発許可制度',
      '建築基準法の集団規定',
      '国土利用計画法の届出制度',
      '農地法の転用許可制度'
    ],
    tips: [
      '法律ごとの規制の目的を理解する',
      '規制区域と許可基準を表にまとめる',
      '具体例をイメージしながら学習する'
    ],
    targetScore: '8問中5問正解',
    studyTime: '総学習時間の15%（45時間程度）'
  },
  {
    id: 'zeihou',
    name: '税・その他',
    icon: '💰',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    points: [
      '不動産取得税の課税標準と特例',
      '固定資産税の課税のしくみ',
      '登録免許税の税率',
      '地価公示制度の基本'
    ],
    tips: [
      '計算問題は基本パターンを押さえる',
      '非課税と免税の違いを明確に理解',
      '特例適用の要件を確実に暗記'
    ],
    targetScore: '8問中5問正解',
    studyTime: '総学習時間の10%（30時間程度）'
  }
];

export default function Strategy() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 w-full z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center">
          <Link href="/dashboard" className="text-indigo-600 mr-4">
            <i className="ri-arrow-left-line text-2xl"></i>
          </Link>
          <h1 className="text-xl font-extrabold text-indigo-800 tracking-tight">分野別攻略法</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* 分野選択 */}
        <div className="space-y-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id === selectedSubject ? null : subject.id)}
              className={`${subject.bgColor} rounded-2xl p-6 border transition-all cursor-pointer shadow-md ${
                selectedSubject === subject.id
                  ? `${subject.borderColor} border-2 shadow-lg`
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{subject.icon}</div>
                  <div>
                    <h3 className="font-extrabold text-gray-800 tracking-tight">{subject.name}</h3>
                    <p className="text-sm text-gray-600">目標: {subject.targetScore}</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">{subject.studyTime}</div>
              </div>

              {selectedSubject === subject.id && (
                <div className="space-y-4 mt-4 animate-fadeIn">
                  {/* 重要ポイント */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">📍 重要ポイント</h4>
                    <ul className="space-y-2">
                      {subject.points.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-indigo-500">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 学習のコツ */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">💡 学習のコツ</h4>
                    <ul className="space-y-2">
                      {subject.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 学習開始ボタン */}
                  <Link href={`/practice/detail?category=${subject.id}`}>
                    <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md mt-4">
                      この分野を学習する
                    </button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 全体的なアドバイス */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-extrabold text-lg text-indigo-800 tracking-tight mb-4">🎯 合格のポイント</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              • 宅建業法と民法等で全体の68%（34問）を占めるため、この2分野の対策を優先
            </p>
            <p className="text-sm text-gray-700">
              • 法令上の制限は専門用語の理解が重要。用語の定義から学習を始める
            </p>
            <p className="text-sm text-gray-700">
              • 税・その他は基本的な計算問題が多いため、計算手順を確実に押さえる
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}