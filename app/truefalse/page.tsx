'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableLaws } from '@/lib/utils/generate-truefalse-items';

export default function TrueFalsePage() {
  const router = useRouter();
  const [selectedLaw, setSelectedLaw] = useState<string>('');
  const [selectedCount, setSelectedCount] = useState<number>(10);

  const laws = getAvailableLaws();
  const countOptions = [10, 20, 30];

  const handleStart = () => {
    if (!selectedLaw) return;
    router.push(`/truefalse/quiz?law=${selectedLaw}&count=${selectedCount}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            ○×問題（法令別）
          </h1>
          <p className="text-gray-600 text-lg">
            各法令ごとの重要ポイントを○×形式で効率的に学習
          </p>
          <p className="text-sm text-gray-500 mt-2">
            出題頻度の高いテーマから優先的に出題されます
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* 法令カテゴリ選択 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📚 法令カテゴリを選択
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {laws.map((law) => (
                <button
                  key={law.id}
                  onClick={() => setSelectedLaw(law.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedLaw === law.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                  }`}
                >
                  <div className="font-bold text-lg text-gray-800 mb-2">
                    {law.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {law.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 出題数選択 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📊 出題数を選択
            </h2>
            <div className="flex gap-4 justify-center">
              {countOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedCount(count)}
                  className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                    selectedCount === count
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {count}問
                </button>
              ))}
            </div>
          </div>

          {/* 開始ボタン */}
          <div className="text-center">
            <button
              onClick={handleStart}
              disabled={!selectedLaw}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
                selectedLaw
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedLaw ? '○×問題を開始' : '法令カテゴリを選択してください'}
            </button>
          </div>

          {/* トップページに戻るボタン */}
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              🏠 トップページに戻る
            </button>
          </div>

          {/* 選択内容の確認 */}
          {selectedLaw && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-center text-sm text-blue-700">
                <strong>
                  {laws.find(l => l.id === selectedLaw)?.name}
                </strong>
                の○×問題を <strong>{selectedCount}問</strong> 出題します
              </div>
            </div>
          )}
        </div>

        {/* 機能説明 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            💡 ○×問題の特徴
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-500">✓</span>
              <span>過去問の選択肢を○×形式に変換</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">✓</span>
              <span>頻出テーマから重要ポイントを出題</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">✓</span>
              <span>出題頻度に応じた重み付け</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">✓</span>
              <span>即時フィードバックで効率学習</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
