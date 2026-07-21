#!/usr/bin/env ts-node

/**
 * AI予想問題生成スクリプト（大量生成版）
 * 各カテゴリ200-300問を生成
 * 
 * 特徴:
 * - 最新法改正対応
 * - 頻出トピック徹底演習
 * - 実務的な事例問題
 * - 応用力を試す複合問題
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ エラー: OPENAI_API_KEY が設定されていません');
  process.exit(1);
}

// ========================================
// 宅建業法トピック（予想問題特化）
// ========================================
const TAKKENGYOUHOU_TOPICS = [
  { name: '宅建業の免許制度', count: 25, type: 'fundamental' },
  { name: '宅地建物取引士', count: 30, type: 'frequent' },
  { name: '営業保証金・保証協会', count: 20, type: 'fundamental' },
  { name: '広告・契約の規制', count: 25, type: 'practical' },
  { name: '重要事項説明・37条書面', count: 35, type: 'frequent' },
  { name: '業務上の規制', count: 30, type: 'practical' },
  { name: '監督・罰則', count: 20, type: 'fundamental' },
  { name: '報酬の制限', count: 25, type: 'frequent' },
  { name: '自ら売主制限（8種制限）', count: 35, type: 'frequent' },
  { name: '2024年法改正対応問題', count: 15, type: 'latest' },
];

// ========================================
// 民法トピック（予想問題特化）
// ========================================
const MINPOU_TOPICS = [
  { name: '制限行為能力者', count: 25, type: 'fundamental' },
  { name: '意思表示（詐欺・強迫等）', count: 30, type: 'frequent' },
  { name: '代理', count: 30, type: 'frequent' },
  { name: '時効', count: 25, type: 'practical' },
  { name: '物権変動・対抗問題', count: 35, type: 'frequent' },
  { name: '共有', count: 20, type: 'fundamental' },
  { name: '抵当権', count: 35, type: 'frequent' },
  { name: '債務不履行・損害賠償', count: 30, type: 'practical' },
  { name: '契約の解除', count: 25, type: 'practical' },
  { name: '相続', count: 25, type: 'fundamental' },
  { name: '2020年民法改正対応問題', count: 20, type: 'latest' },
];

// ========================================
// 法令上の制限トピック
// ========================================
const HOUREI_TOPICS = [
  { name: '都市計画法', count: 50, type: 'frequent' },
  { name: '建築基準法（基本編）', count: 45, type: 'frequent' },
  { name: '建築基準法（集団規定）', count: 40, type: 'practical' },
  { name: '国土利用計画法', count: 25, type: 'fundamental' },
  { name: '農地法', count: 25, type: 'fundamental' },
  { name: '土地区画整理法', count: 20, type: 'practical' },
  { name: '宅地造成等規制法', count: 15, type: 'fundamental' },
];

// ========================================
// 税・その他トピック
// ========================================
const ZEIHOU_TOPICS = [
  { name: '不動産取得税', count: 30, type: 'frequent' },
  { name: '固定資産税', count: 35, type: 'frequent' },
  { name: '所得税（譲渡所得）', count: 30, type: 'frequent' },
  { name: '印紙税', count: 25, type: 'practical' },
  { name: '登録免許税', count: 20, type: 'fundamental' },
  { name: '不動産登記法', count: 30, type: 'practical' },
  { name: '地価公示法', count: 15, type: 'fundamental' },
  { name: '不動産鑑定評価基準', count: 15, type: 'fundamental' },
];

const CATEGORY_ID_START: Record<string, number> = {
  takkengyouhou: 102000,
  minpou: 202000,
  hourei: 302000,
  zeihou: 403000,
};
const idCounters: Record<string, number> = { ...CATEGORY_ID_START };
function allocId(category: string): number {
  const id = idCounters[category] ?? 901000;
  idCounters[category] = id + 1;
  return id;
}

// ========================================
// プロンプト生成関数
// ========================================
function createPredictionPrompt(
  category: string,
  topic: { name: string; count: number; type: string },
  difficulty: '基礎' | '標準' | '応用'
): string {
  const topicType = {
    'latest': '最新の法改正や制度変更を反映した',
    'frequent': '試験で頻出する重要な',
    'practical': '実務的な事例を含む',
    'fundamental': '基本的な知識を確認する'
  }[topic.type];

  const difficultyDesc = {
    '基礎': '基礎的な理解を確認する問題。初学者でも取り組みやすい明確な設問',
    '標準': '過去の試験問題レベルの標準的な難易度。実際の試験を想定した出題',
    '応用': '複数の知識を統合して解く応用問題。より深い理解が必要'
  }[difficulty];

  return `宅地建物取引士試験（宅建試験）の${category}分野における「${topic.name}」についての${topicType}AI予想問題を作成してください。

【問題のコンセプト】
このアプリは「AI予想問題」に特化しており、過去問ではなく、AIが試験傾向を分析して作成した予想問題です。
実際の試験で出題されそうなテーマ、最新の法改正、実務で重要なポイントを重点的に出題します。

【難易度】${difficulty}
${difficultyDesc}

【問題数】${Math.min(5, Math.ceil(topic.count / 3))}問

【出力形式】
以下のTypeScript形式で、コメントなしで直接コードのみを出力してください:

\`\`\`typescript
import { Question } from '@/lib/types/quiz';

export const ${category}PredictionQuestions_${topic.name.replace(/[・（）\s]/g, '_')}_${difficulty}: Question[] = [
  {
    id: ${10000 + Math.floor(Math.random() * 90000)},
    question: "【AI予想問題】具体的で実践的な事例を含む問題文。\\n\\nAがBに対して〜の場合における次の記述のうち、正しいものはどれか。",
    options: [
      "選択肢1: 具体的で明確な記述",
      "選択肢2: 具体的で明確な記述",
      "選択肢3: 具体的で明確な記述",
      "選択肢4: 具体的で明確な記述"
    ],
    correctAnswer: 0,
    explanation: \`【正解】選択肢1

【各選択肢の詳細解説】
1. ✅ 正しい - ○○という規定により、△△となる（${category}第○条）
2. ❌ 誤り - ××のため誤り。正しくは△△である
3. ❌ 誤り - □□のため誤り。実務上は◇◇となる
4. ❌ 誤り - ▽▽のため誤り。正しくは▼▼である

【重要ポイント】
- この問題のキーワード・概念
- 実務での注意点や頻出論点
- 関連する条文や制度

【AI予想問題のポイント】
この問題は、試験で出題される可能性が高いテーマです。\`,
    category: "${category}",
    difficulty: "${difficulty}",
    year: "2025-AI予想",
    topic: "${topic.name}",
    tags: ["AI予想問題", "${topic.type}"]
  },
  // 以下同様に指定数の問すべて出力
];
\`\`\`

【重要な要件】
1. 問題文は必ず「【AI予想問題】」で始めること
2. yearは「2025-AI予想」とすること
3. tagsに["AI予想問題", "${topic.type}"]を含めること
4. 解説は詳しく、初学者にも理解できるように
5. 実際の試験で出そうなリアルな問題を作成
6. ${topic.type === 'latest' ? '最新の法改正や制度変更を反映' : ''}
7. 引っかけ問題ではなく、正統的な良問を作成
9. 実際の過去問の文言を複製・ほぼ同一の言い換えをしないこと（オリジナルの事例で出題）
10. 各問題の事例・数値・登場人物を変え、問題文が互いに重複しないこと`;
}

// ========================================
// OpenAI API呼び出し
// ========================================
async function generateWithOpenAI(prompt: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`  🤖 API呼び出し中... (${i + 1}/${retries})`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: '宅地建物取引士試験の問題作成専門家として、試験傾向を分析した高品質なAI予想問題を作成します。TypeScriptコードのみを出力し、説明文は含めません。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 6000
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // TypeScriptコードブロックを抽出
      const match = content.match(/```typescript\n([\s\S]*?)\n```/);
      if (match) {
        return match[1];
      }

      return content;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`  ⚠️  リトライ ${i + 1}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Max retries reached');
}

// ========================================
// ファイル保存
// ========================================
function saveToFile(
  category: string,
  topic: string,
  difficulty: string,
  content: string
): void {
  const baseDir = path.join(__dirname, '../../lib', 'data', 'questions', category, 'prediction');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const sanitizedTopic = topic.replace(/[・（）\s]/g, '_');
  const fileName = `${sanitizedTopic}_${difficulty}.ts`;
  const filePath = path.join(baseDir, fileName);
  const outPath = fs.existsSync(filePath)
    ? path.join(baseDir, fileName.replace(/\.ts$/, '_b2.ts'))
    : filePath;

  // 生成文中の id をカテゴリ名前空間の連番に振り直す
  const remapped = content.replace(/"?id"?\s*:\s*\d+/g, () => `id: ${allocId(category)}`);
  fs.writeFileSync(outPath, remapped + '\n', 'utf-8');
  console.log(`    ✅ 保存: ${path.basename(outPath)}`);
}

// ========================================
// メイン生成ロジック
// ========================================
async function generateCategoryQuestions(
  categoryName: string,
  categoryKey: string,
  topics: { name: string; count: number; type: string }[]
) {
  console.log('\n' + '='.repeat(60));
  console.log(`📚 ${categoryName}の予想問題生成開始`);
  console.log('='.repeat(60));

  let totalGenerated = 0;
  const totalTarget = topics.reduce((sum, t) => sum + t.count, 0);

  for (const topic of topics) {
    console.log(`\n📝 トピック: ${topic.name} (目標: ${topic.count}問)`);

    // 基礎・標準・応用を均等に分配
    const difficulties: ('基礎' | '標準' | '応用')[] = ['基礎', '標準', '応用'];
    
    for (const difficulty of difficulties) {
      try {
        console.log(`  ${difficulty}レベル生成中...`);
        const prompt = createPredictionPrompt(categoryKey, topic, difficulty);
        const content = await generateWithOpenAI(prompt);
        saveToFile(categoryKey, topic.name, difficulty, content);
        
        const questionsInBatch = Math.ceil(topic.count / 3);
        totalGenerated += questionsInBatch;
        
        console.log(`  ✅ ${difficulty}レベル完了 (約${questionsInBatch}問)`);
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`  ❌ エラー: ${error}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ ${categoryName}完了`);
  console.log(`📊 生成問題数: 約${totalGenerated}問 / 目標: ${totalTarget}問`);
  console.log('='.repeat(60));
}

// ========================================
// メイン実行
// ========================================
async function main() {
  const args = process.argv.slice(2);
  const targetCategory = args[0];

  console.log('\n🚀 AI予想問題生成スクリプト');
  console.log('━'.repeat(60));
  console.log('【特徴】');
  console.log('  ✅ 最新法改正対応');
  console.log('  ✅ 頻出トピック徹底演習');
  console.log('  ✅ 実務的な事例問題');
  console.log('  ✅ 応用力を試す複合問題');
  console.log('━'.repeat(60));

  const startTime = Date.now();

  try {
    if (!targetCategory || targetCategory === 'all') {
      // 全カテゴリ生成
      await generateCategoryQuestions('宅建業法', 'takkengyouhou', TAKKENGYOUHOU_TOPICS);
      await generateCategoryQuestions('民法等', 'minpou', MINPOU_TOPICS);
      await generateCategoryQuestions('法令上の制限', 'hourei', HOUREI_TOPICS);
      await generateCategoryQuestions('税・その他', 'zeihou', ZEIHOU_TOPICS);
    } else {
      // 個別カテゴリ生成
      const categoryMap = {
        'takkengyouhou': { name: '宅建業法', topics: TAKKENGYOUHOU_TOPICS },
        'minpou': { name: '民法等', topics: MINPOU_TOPICS },
        'hourei': { name: '法令上の制限', topics: HOUREI_TOPICS },
        'zeihou': { name: '税・その他', topics: ZEIHOU_TOPICS }
      };

      const category = categoryMap[targetCategory as keyof typeof categoryMap];
      if (category) {
        await generateCategoryQuestions(category.name, targetCategory, category.topics);
      } else {
        console.error('❌ エラー: 無効なカテゴリ');
        console.log('使用方法: npm run generate:prediction [takkengyouhou|minpou|hourei|zeihou|all]');
        process.exit(1);
      }
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log('\n' + '='.repeat(60));
    console.log('🎉 すべての生成完了！');
    console.log(`⏱  所要時間: ${elapsed}秒`);
    console.log('='.repeat(60));
    console.log('\n📁 生成ファイル格納先:');
    console.log('  lib/data/questions/*/prediction/');
    console.log('\n次のステップ:');
    console.log('  1. 各カテゴリのindex.tsを更新');
    console.log('  2. npm run build でビルド確認');
    console.log('  3. npm run dev で動作確認');
    console.log('  4. vercel --prod でデプロイ');

  } catch (error) {
    console.error('\n❌ 予期せぬエラーが発生しました:', error);
    process.exit(1);
  }
}

main();


