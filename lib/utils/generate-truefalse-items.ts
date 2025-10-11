// ○×問題生成ユーティリティ
import { TrueFalseItem } from '@/lib/types/quiz';
import { questionsByCategory } from '@/lib/data/questions/index';
import { frequencyData } from '@/lib/data/frequency-questions';
import { frequency10y } from '@/lib/data/past-exams/frequency';

// 法令カテゴリのマッピング（frequency-questions.ts と questions の差異を吸収）
const LAW_MAPPING = {
  'takkengyouhou': 'takkengyouhou',
  'kenri': 'minpou',
  'hourei': 'hourei',
  'zei': 'zeihou'
} as const;

// frequency-questions.tsのIDから実際の法令IDへのマッピング
const FREQUENCY_TO_LAW_MAPPING = {
  'takkengyouhou': 'takkengyouhou',
  'kenri': 'minpou',
  'hourei': 'hourei',
  'zei': 'zeihou'
} as const;

type LawSlug = 'takkengyouhou' | 'minpou' | 'hourei' | 'zeihou';

/**
 * 四択問題から○×アイテムを生成
 */
export function buildTFItemsFromMCQ(law: LawSlug): TrueFalseItem[] {
  const questions = questionsByCategory[law] || [];
  const items: TrueFalseItem[] = [];

  questions.forEach(question => {
    question.options.forEach((option, index) => {
      const isCorrect = index === question.correctAnswer;
      
      items.push({
        id: `q-${question.id}-opt-${index}`,
        law,
        statement: option,
        answer: isCorrect,
        source: {
          type: 'mcq',
          questionId: question.id,
          year: question.year,
          topic: question.topic
        },
        explanation: isCorrect ? question.explanation : undefined,
        topicWeight: 0.5 // デフォルト重み（後で更新）
      });
    });
  });

  return items;
}

/**
 * 頻出問題（穴埋め）から○×アイテムを生成
 */
export function buildTFItemsFromFrequency(law: LawSlug): TrueFalseItem[] {
  const items: TrueFalseItem[] = [];
  
  try {
    // frequency-questions.ts のカテゴリIDを取得（修正されたマッピングを使用）
    const frequencyCategoryId = Object.entries(FREQUENCY_TO_LAW_MAPPING).find(
      ([_, mappedLaw]) => mappedLaw === law
    )?.[0];

    if (!frequencyCategoryId) {
      console.warn(`No frequency category found for law: ${law}`);
      return items;
    }

    const category = frequencyData.find(cat => cat.id === frequencyCategoryId);
    if (!category) {
      console.warn(`No frequency data found for category: ${frequencyCategoryId}`);
      return items;
    }

    category.topics.forEach((topic, topicIdx) => {
      if (!topic.questions || topic.questions.length === 0) {
        console.warn(`No questions found for topic: ${topic.topic}`);
        return;
      }

      topic.questions.forEach((question, qIdx) => {
        try {
          // 穴埋め問題を完全な文に変換
          let statement = question.text;
          if (!statement || statement.trim() === '') {
            console.warn(`Empty question text for topic: ${topic.topic}, question: ${qIdx}`);
            return;
          }

          question.blanks.forEach((blank, blankIdx) => {
            const answer = question.answers[blankIdx] || '';
            statement = statement.replace(`（ ${blank} ）`, answer);
          });

          // 正しい命題と誤った命題の両方を生成
          items.push({
            id: `freq-${law}-${topicIdx}-${qIdx}-true`,
            law,
            statement,
            answer: true,
            source: {
              type: 'frequency-blank',
              topic: topic.topic
            },
            explanation: `${topic.topic}に関する重要事項です。${topic.frequency}`,
            topicWeight: computeTopicWeight(law, topic.topic, topic.frequency)
          });

          // 誤った命題も生成（一部の答えを変更）
          if (question.answers.length > 0) {
            let falseStatement = question.text;
            question.blanks.forEach((blank, blankIdx) => {
              const correctAnswer = question.answers[blankIdx] || '';
              const wrongAnswer = generateWrongAnswer(correctAnswer, topic.topic);
              falseStatement = falseStatement.replace(`（ ${blank} ）`, wrongAnswer);
            });

            items.push({
              id: `freq-${law}-${topicIdx}-${qIdx}-false`,
              law,
              statement: falseStatement,
              answer: false,
              source: {
                type: 'frequency-blank',
                topic: topic.topic
              },
              explanation: `正しくは「${statement}」です。${topic.frequency}`,
              topicWeight: computeTopicWeight(law, topic.topic, topic.frequency)
            });
          }
        } catch (error) {
          console.error(`Error processing question ${qIdx} in topic ${topic.topic}:`, error);
        }
      });
    });
  } catch (error) {
    console.error(`Error building TF items from frequency for law ${law}:`, error);
  }

  return items;
}

/**
 * 間違った答えを生成する
 */
function generateWrongAnswer(correctAnswer: string, topic: string): string {
  // 数値の場合は異なる数値を返す
  if (/^\d+$/.test(correctAnswer)) {
    const num = parseInt(correctAnswer);
    const alternatives = [num + 1, num - 1, num * 2, Math.floor(num / 2)].filter(n => n > 0);
    return alternatives[Math.floor(Math.random() * alternatives.length)].toString();
  }

  // 期間の場合
  if (correctAnswer.includes('年') || correctAnswer.includes('月') || correctAnswer.includes('日')) {
    const wrongPeriods = ['3年', '5年', '10年', '1月', '3月', '6月', '30日', '60日'];
    const filtered = wrongPeriods.filter(p => p !== correctAnswer);
    return filtered[Math.floor(Math.random() * filtered.length)] || correctAnswer;
  }

  // その他の場合は一般的な間違いパターンを返す
  const commonWrongs = {
    '宅地建物取引士': '宅地建物取引主任者',
    '都道府県知事': '市町村長',
    '登記': '届出',
    '許可': '届出',
    '届出': '許可',
    '同意': '承諾',
    '承諾': '同意'
  };

  return commonWrongs[correctAnswer as keyof typeof commonWrongs] || correctAnswer;
}

/**
 * トピックの重みを計算
 */
function computeTopicWeight(law: LawSlug, topicString?: string, frequencyText?: string): number {
  // 優先: frequency10y.data から本番値を取得
  if (topicString && frequency10y.data[topicString]) {
    const count = frequency10y.data[topicString];
    // 10年間の出題回数を重みに変換（最大12回想定）
    return Math.min(count / 12, 1.0);
  }

  // 代替: frequency-questions.ts の frequency テキストから推定
  if (frequencyText) {
    if (frequencyText.includes('全て出題') || frequencyText.includes('12回')) {
      return 1.0; // 最高重み
    }
    if (frequencyText.includes('ほぼ毎年')) {
      return 0.8; // 高重み
    }
    if (frequencyText.includes('頻出') || frequencyText.includes('重要')) {
      return 0.7; // 中高重み
    }
  }

  // デフォルト
  return 0.5;
}

/**
 * 重み付きランダムサンプリング（最適化版）
 */
function weightedSample<T extends { topicWeight?: number; id?: string }>(items: T[], count: number): T[] {
  if (items.length <= count) return [...items];

  // 重みの正規化と累積重みの計算
  const weighted = items.map(item => ({
    item,
    weight: Math.max(0.1, item.topicWeight || 0.5) // 最小重みを0.1に設定
  }));

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  const normalizedWeights = weighted.map(w => ({
    ...w,
    normalizedWeight: w.weight / totalWeight
  }));

  // 累積重みを計算
  let cumulativeWeight = 0;
  const cumulativeWeights = normalizedWeights.map(w => {
    cumulativeWeight += w.normalizedWeight;
    return {
      ...w,
      cumulativeWeight
    };
  });

  // 重み付きランダム選択（重複なし）
  const selected: T[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < count && selected.length < items.length; i++) {
    let attempts = 0;
    let selectedIndex = -1;

    // 最大10回試行して重複を避ける
    while (attempts < 10 && selectedIndex === -1) {
      const random = Math.random();
      
      for (let j = 0; j < cumulativeWeights.length; j++) {
        if (!usedIndices.has(j) && random <= cumulativeWeights[j].cumulativeWeight) {
          selectedIndex = j;
          break;
        }
      }
      attempts++;
    }

    // 重複回避に失敗した場合は、未使用のアイテムからランダム選択
    if (selectedIndex === -1) {
      const availableIndices = Array.from({ length: items.length }, (_, i) => i)
        .filter(i => !usedIndices.has(i));
      if (availableIndices.length > 0) {
        selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }
    }

    if (selectedIndex !== -1) {
      selected.push(items[selectedIndex]);
      usedIndices.add(selectedIndex);
    }
  }

  return selected;
}

/**
 * ○×クイズセットを生成（メイン関数）
 */
export function getTFQuizSet(law: LawSlug, count: number = 10): TrueFalseItem[] {
  try {
    // 入力値の検証
    if (!law || !['takkengyouhou', 'minpou', 'hourei', 'zeihou'].includes(law)) {
      console.error(`Invalid law parameter: ${law}`);
      return [];
    }

    if (count <= 0 || count > 100) {
      console.error(`Invalid count parameter: ${count}`);
      count = 10; // デフォルト値にフォールバック
    }

    // MCQと頻出問題から○×アイテムを生成
    const mcqItems = buildTFItemsFromMCQ(law);
    const frequencyItems = buildTFItemsFromFrequency(law);
    
    console.log(`Generated items for ${law}: MCQ=${mcqItems.length}, Frequency=${frequencyItems.length}`);
    
    // 全アイテムを統合
    const allItems = [...mcqItems, ...frequencyItems];
    
    // 問題データが不足している場合の処理
    if (allItems.length === 0) {
      console.error(`No items generated for law: ${law}`);
      return [];
    }

    // 要求数より少ない場合は警告
    if (allItems.length < count) {
      console.warn(`Requested ${count} items but only ${allItems.length} available for ${law}`);
    }
    
    // 重み付きサンプリングで指定数を抽出
    const selectedItems = weightedSample(allItems, count);
    
    // 最終検証
    const validItems = selectedItems.filter(item => 
      item.statement && 
      item.statement.trim() !== '' && 
      typeof item.answer === 'boolean'
    );

    if (validItems.length !== selectedItems.length) {
      console.warn(`Filtered out ${selectedItems.length - validItems.length} invalid items`);
    }
    
    // シャッフル（重み付き選択後の順序をランダム化）
    return validItems.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error(`Error generating TF quiz set for ${law}:`, error);
    return [];
  }
}

/**
 * 法令名の日本語表示を取得
 */
export function getLawDisplayName(law: LawSlug): string {
  const names = {
    'takkengyouhou': '宅建業法',
    'minpou': '民法等',
    'hourei': '法令上の制限',
    'zeihou': '税・その他'
  };
  return names[law];
}

/**
 * 利用可能な法令カテゴリ一覧を取得
 */
export function getAvailableLaws(): Array<{ id: LawSlug; name: string; description: string }> {
  return [
    {
      id: 'takkengyouhou',
      name: '宅建業法',
      description: '最も出題数が多く、満点に近い高得点を目指す分野'
    },
    {
      id: 'minpou',
      name: '民法等',
      description: '民法、借地借家法、区分所有法等の権利関係'
    },
    {
      id: 'hourei',
      name: '法令上の制限',
      description: '都市計画法、建築基準法等の法令制限'
    },
    {
      id: 'zeihou',
      name: '税・その他',
      description: '税法、不動産鑑定評価基準等の得点源分野'
    }
  ];
}
