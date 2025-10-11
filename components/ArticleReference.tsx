'use client';

import { useState } from 'react';
import { Article } from '@/lib/types/quiz';

interface ArticleReferenceProps {
  articles: Article[];
  className?: string;
}

export default function ArticleReference({ articles, className = '' }: ArticleReferenceProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className={`bg-blue-50 rounded-lg p-4 ${className}`}>
      <h3 className="font-bold text-sm text-blue-800 mb-3 flex items-center gap-2">
        📚 関連条文
      </h3>
      <div className="space-y-2">
        {articles.map((article, index) => (
          <button
            key={index}
            onClick={() => setSelectedArticle(article)}
            className="w-full text-left bg-white rounded-lg p-3 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                  {article.law}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {article.article}
                </span>
              </div>
              <div className="text-blue-600 text-sm">
                詳細 →
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 条文詳細ポップアップ */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                📖 {selectedArticle.law} {selectedArticle.article}
              </h3>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">条文内容</h4>
              <div className="text-sm text-gray-800 leading-relaxed">
                {selectedArticle.content}
              </div>
            </div>

            {selectedArticle.url && (
              <div className="mb-4">
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  🔗 条文の詳細を確認する
                </a>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
