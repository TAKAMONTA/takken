#!/usr/bin/env ts-node

/**
 * 商品化レベルの問題生成スクリプト
 *
 * 目標問題数:
 * - 宅建業法: 100問（基礎30 + 標準50 + 応用20）
 * - 民法: 100問（基礎30 + 標準50 + 応用20）
 * - 法令上の制限: 80問（基礎25 + 標準40 + 応用15）
 * - 税・その他: 80問（基礎25 + 標準40 + 応用15）
 * 合計: 360問
 *
 * 形式:
 * - 基礎問題: 肢別形式（○×問題）
 * - 標準・応用問題: 多肢選択形式（4肢択一）
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadEnv } from '../utils/env-loader';
import { logger } from '../utils/logger';

// 環境変数を読み込み
loadEnv();

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  logger.error('❌ エラー: NEXT_PUBLIC_GOOGLE_API_KEY が設定されていません');
  logger.error('.env.local ファイルを確認してください');
  process.exit(1);
}

// Gemini API設定
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// カテゴリ設定
interface CategoryConfig {
  name: string;
  displayName: string;
  basic: number;      // 基礎問題数（肢別形式）
  standard: number;   // 標準問題数（多肢選択）
  advanced: number;   // 応用問題数（多肢選択）
  topics: string[];
}

const CATEGORIES: Record<string, CategoryConfig> = {
  takkengyouhou: {
    name: 'takkengyouhou',
    displayName: '宅建業法',
    basic: 50,
    standard: 80,
    advanced: 20,
    topics: [
      '宅建業の免許制度',
      '宅地建物取引士',
      '営業保証金・保証協会',
      '広告・契約の規制',
      '重要事項説明・37条書面',
      '業務上の規制',
      '監督・罰則',
      '報酬の制限',
      '自ら売主制限'
    ]
  },
  minpou: {
    name: 'minpou',
    displayName: '権利関係（民法等）',
    basic: 50,
    standard: 80,
    advanced: 20,
    topics: [
      '意思表示（錯誤・詐欺・強迫）',
      '代理',
      '時効',
      '物権変動',
      '抵当権',
      '債権譲渡',
      '相続',
      '賃貸借',
      '連帯債務・保証',
      '売買契約',
      '不法行為',
      '委任・請負'
    ]
  },
  hourei: {
    name: 'hourei',
    displayName: '法令上の制限',
    basic: 40,
    standard: 60,
    advanced: 20,
    topics: [
      '都市計画法',
      '建築基準法',
      '国土利用計画法',
      '農地法',
      '土地区画整理法',
      '宅地造成等規制法',
      'その他の法令'
    ]
  },
  zeihou: {
    name: 'zeihou',
    displayName: '税・その他',
    basic: 40,
    standard: 60,
    advanced: 20,
    topics: [
      '不動産取得税',
      '固定資産税',
      '登録免許税',
      '所得税',
      '印紙税',
      '地価公示法',
      '不動産鑑定評価基準',
      '宅地建物の統計'
    ]
  }
};

// 基礎問題（肢別形式）生成用プロンプト
function createBasicQuestionPrompt(category: CategoryConfig, topic: string, count: number): string {
  return `あなたは宅建試験の問題作成の専門家です。${category.displayName}の「${topic}」に関する基礎レベルの肢別問題を${count}問作成してください。

【重要な要件】
1. 形式: ○×問題（肢別形式）
2. 難易度: 基礎レベル（初学者向け）
3. 内容: 基本的な定義、原則、手続きなど
4. 解説: 正誤の理由を明確に説明
5. 学習支援: 重要用語の定義も含める

【出力形式】
以下のTypeScript形式で出力してください:

export const ${category.name}BasicQuestions_${topic.replace(/[・\s]/g, '_')}: TrueFalseItem[] = [
  {
    id: "${category.name}_basic_${topic}_1",
    law: "${category.name}",
    statement: "具体的な命題文",
    answer: true, // または false
    source: {
      type: "frequency-blank",
      topic: "${topic}",
      year: "2024"
    },
    explanation: "この命題が正しい（または誤っている）理由は...",
    reference: {
      law: "法律名",
      article: "条文番号",
      url: ""
    },
    topicWeight: 1
  },
  // ... ${count}問分
];

【注意事項】
- 命題文は明確で簡潔に
- 初学者でも理解できる表現
- 実務でよく問われる基本事項を優先
- 引っ掛け問題は避ける
- 各問題は独立している（他の問題を見なくても解ける）

それでは、${count}問の肢別問題を生成してください。`;
}

// 標準・応用問題（多肢選択）生成用プロンプト
function createMultipleChoicePrompt(category: CategoryConfig, topic: string, difficulty: '標準' | '応用', count: number): string {
  const difficultyDesc = difficulty === '標準'
    ? '標準レベル（過去問相当の難易度）'
    : '応用レベル（複数知識の統合が必要）';

  return `あなたは宅建試験の問題作成の専門家です。${category.displayName}の「${topic}」に関する${difficulty}レベルの4肢択一問題を${count}問作成してください。

【重要な要件】
1. 形式: 4肢択一（多肢選択）
2. 難易度: ${difficultyDesc}
3. 選択肢: 各選択肢が独立した知識を問う良問
4. 解説: 全選択肢について正誤の理由を説明
5. 実践的: 実務や過去問傾向を反映

【出力形式】
以下のTypeScript形式で出力してください:

export const ${category.name}${difficulty}Questions_${topic.replace(/[・\s]/g, '_')}: Question[] = [
  {
    id: ${Math.floor(Math.random() * 10000)},
    question: "問題文（具体的な事例設定を含む）",
    options: [
      "選択肢1の内容",
      "選択肢2の内容",
      "選択肢3の内容",
      "選択肢4の内容"
    ],
    correctAnswer: 0, // 正解の選択肢のインデックス（0-3）
    explanation: \`【正解】選択肢○が正しい

【各選択肢の解説】
1. 選択肢1: ○○のため正しい/誤り
2. 選択肢2: △△のため正しい/誤り
3. 選択肢3: □□のため正しい/誤り
4. 選択肢4: ××のため正しい/誤り

【重要ポイント】
- 本問で問われている核心的な知識
- 関連する条文や判例
- 実務での重要性\`,
    category: "${category.name}",
    difficulty: "${difficulty}",
    year: "2024",
    topic: "${topic}"
  },
  // ... ${count}問分
];

【${difficulty}レベルの特徴】
${difficulty === '標準' ? `
- 過去問で頻出のテーマ
- 条文や判例の基本的な理解を問う
- 実務で遭遇する典型的な事例
- 各選択肢は明確に正誤判定可能
` : `
- 複数の知識を統合して解く必要がある
- 判例や実務の深い理解が必要
- 例外規定や特殊ケースも含む
- 紛らわしい選択肢で思考力を問う
`}

それでは、${count}問の${difficulty}レベル問題を生成してください。`;
}

// Gemini APIで問題生成
async function generateWithGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText = data.candidates[0].content.parts[0].text;

  // コードブロックを抽出
  const codeMatch = generatedText.match(/```typescript\n([\s\S]*?)\n```/);
  if (codeMatch) {
    return codeMatch[1];
  }

  return generatedText;
}

// ファイルに保存
function saveToFile(category: string, difficulty: string, topic: string, content: string): void {
  const baseDir = path.join(__dirname, '../../lib', 'data', 'questions', category);
  const fileName = `${difficulty}-${topic.replace(/[・\s]/g, '-')}.ts`;
  const filePath = path.join(baseDir, fileName);

  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // TypeScriptファイルとして保存
  const fileContent = `// ${category} - ${difficulty} - ${topic}
// AI生成問題（商品化版）

${difficulty === 'basic' ? "import { TrueFalseItem } from '@/lib/types/quiz';" : "import { Question } from '@/lib/types/quiz';"}

${content}
`;

  fs.writeFileSync(filePath, fileContent, 'utf-8');
  logger.success(`保存完了: ${fileName}`);
}

// メイン処理
async function main() {
  logger.start('商品化レベルの問題生成を開始します');

  let totalGenerated = 0;
  const targetTotal = Object.values(CATEGORIES).reduce((sum, cat) =>
    sum + cat.basic + cat.standard + cat.advanced, 0
  );

  logger.info(`📊 目標問題数: ${targetTotal}問`);

  for (const [categoryKey, category] of Object.entries(CATEGORIES)) {
    logger.header(`${category.displayName} - 問題生成開始`);

    const topicsCount = category.topics.length;

    // 基礎問題（肢別形式）
    logger.info(`📝 基礎レベル（肢別形式） - 目標: ${category.basic}問`);
    const basicPerTopic = Math.ceil(category.basic / topicsCount);

    for (const topic of category.topics) {
      logger.info(`  ⏳ 生成中: ${topic} (${basicPerTopic}問)`);
      try {
        const prompt = createBasicQuestionPrompt(category, topic, basicPerTopic);
        const content = await generateWithGemini(prompt);
        saveToFile(categoryKey, 'basic', topic, content);
        totalGenerated += basicPerTopic;
        logger.success(`  完了: ${topic}`);

        // API制限対策（1秒待機）
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`  ❌ エラー: ${topic}`, error);
      }
    }

    // 標準問題（多肢選択）
    logger.info(`📝 標準レベル（多肢選択） - 目標: ${category.standard}問`);
    const standardPerTopic = Math.ceil(category.standard / topicsCount);

    for (const topic of category.topics) {
      logger.info(`  ⏳ 生成中: ${topic} (${standardPerTopic}問)`);
      try {
        const prompt = createMultipleChoicePrompt(category, topic, '標準', standardPerTopic);
        const content = await generateWithGemini(prompt);
        saveToFile(categoryKey, 'standard', topic, content);
        totalGenerated += standardPerTopic;
        logger.success(`  完了: ${topic}`);

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`  ❌ エラー: ${topic}`, error);
      }
    }

    // 応用問題（多肢選択）
    logger.info(`📝 応用レベル（多肢選択） - 目標: ${category.advanced}問`);
    const advancedPerTopic = Math.ceil(category.advanced / topicsCount);

    for (const topic of category.topics) {
      logger.info(`  ⏳ 生成中: ${topic} (${advancedPerTopic}問)`);
      try {
        const prompt = createMultipleChoicePrompt(category, topic, '応用', advancedPerTopic);
        const content = await generateWithGemini(prompt);
        saveToFile(categoryKey, 'advanced', topic, content);
        totalGenerated += advancedPerTopic;
        logger.success(`  完了: ${topic}`);

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`  ❌ エラー: ${topic}`, error);
      }
    }

    logger.success(`${category.displayName} 完了`, {
      count: category.basic + category.standard + category.advanced
    });
  }

  logger.header('🎉 問題生成完了！');
  logger.info(`📊 生成問題数: ${totalGenerated}問 / ${targetTotal}問`);
  logger.info(`次のステップ:`);
  logger.info(`1. 生成された問題ファイルを確認`);
  logger.info(`2. index.tsファイルを更新して問題をインポート`);
  logger.info(`3. アプリケーションのビルドテスト`);
}

// 実行
main().catch(error => logger.error('予期せぬエラーが発生しました', error));
