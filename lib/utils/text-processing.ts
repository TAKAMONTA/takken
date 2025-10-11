// テキスト処理ユーティリティ関数

/**
 * 空欄番号を対応する文字に変換
 * ① = 9312, ② = 9313, ③ = 9314, ...
 */
export const getBlankCharacter = (index: number): string => {
  return String.fromCharCode(9312 + index);
};

/**
 * テキスト内の空欄パターンを検出
 */
export const findBlankPatterns = (text: string): string[] => {
  const patterns: string[] = [];
  const regex = /（\s*([①②③④⑤⑥⑦⑧⑨⑩])\s*）/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    patterns.push(match[1]);
  }
  
  return patterns;
};

/**
 * 学習進捗の計算
 */
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * 難易度レベルの判定
 */
export const getDifficultyLevel = (correctRate: number): {
  level: string;
  color: string;
  description: string;
} => {
  if (correctRate >= 90) {
    return {
      level: '習得済み',
      color: 'text-green-600',
      description: '十分に理解できています'
    };
  } else if (correctRate >= 70) {
    return {
      level: '良好',
      color: 'text-blue-600',
      description: 'もう少しで習得です'
    };
  } else if (correctRate >= 50) {
    return {
      level: '要復習',
      color: 'text-yellow-600',
      description: '復習が必要です'
    };
  } else {
    return {
      level: '要強化',
      color: 'text-red-600',
      description: '重点的な学習が必要です'
    };
  }
};

/**
 * カテゴリIDからアイコンを取得
 */
export const getCategoryIcon = (categoryId: string): string => {
  const icons: Record<string, string> = {
    takkengyouhou: '🏢',
    kenri: '⚖️',
    hourei: '📋',
    zei: '💰'
  };
  return icons[categoryId] || '📚';
};

/**
 * カテゴリIDからカラーテーマを取得
 */
export const getCategoryColors = (categoryId: string): {
  bg: string;
  text: string;
  border: string;
  accent: string;
} => {
  const colors: Record<string, { bg: string; text: string; border: string; accent: string }> = {
    takkengyouhou: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      accent: 'bg-blue-100'
    },
    kenri: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      accent: 'bg-green-100'
    },
    hourei: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      accent: 'bg-orange-100'
    },
    zei: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      accent: 'bg-purple-100'
    }
  };
  
  return colors[categoryId] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    accent: 'bg-gray-100'
  };
};
