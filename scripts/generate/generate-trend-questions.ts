#!/usr/bin/env ts-node

/**
 * Step 3: 過去問傾向反映AI予想問題 生成スクリプト
 *
 * 使い方:
 *   npx ts-node scripts/generate/generate-trend-questions.ts
 *   npx ts-node scripts/generate/generate-trend-questions.ts --category takkengyouhou
 *   npx ts-node scripts/generate/generate-trend-questions.ts --category kenri --topic 相続
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getTrendData, getTrendDataByCategory, TrendCategory, TrendTopic } from './trend-data';
import { buildSystemPrompt, buildTopicPrompt } from './prompt-builder';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ エラー: OPENAI_API_KEY が .env.local に設定されていません');
  process.exit(1);
}

// ========================================
// 設定
// ========================================
const CONFIG = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4000,
  retryCount: 3,
  retryDelay: 5000,    // 5秒
  apiDelay: 3000,      // API間の待機時間 3秒
  idStart: 100000,     // 傾向問題のID開始値
};

// ID管理
let currentId = CONFIG.idStart;
function getNextId(): number {
  return currentId++;
}

// ========================================
// OpenAI API呼び出し（JSON出力）
// ========================================
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<any[]> {
  for (let attempt = 0; attempt < CONFIG.retryCount; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: CONFIG.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: CONFIG.temperature,
          max_tokens: CONFIG.maxTokens,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // JSONパース
      const parsed = JSON.parse(content);

      // "questions" キーがある場合はその配列を、なければ直接配列として扱う
      if (Array.isArray(parsed)) return parsed;
      if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;

      console.warn('  ⚠️ 想定外のJSON構造:', Object.keys(parsed));
      return [];
    } catch (error) {
      if (attempt === CONFIG.retryCount - 1) {
        console.error(`  ❌ API呼び出し失敗:`, error);
        return [];
      }
      console.warn(`  ⚠️ リトライ ${attempt + 1}/${CONFIG.retryCount}...`);
      await sleep(CONFIG.retryDelay);
    }
  }
  return [];
}

// ========================================
// ユーティリティ
// ========================================
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitizeName(name: string): string {
  return name.replace(/[・（）()\s／/]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

// ========================================
// Question型に変換
// ========================================
function convertToQuestion(
  raw: any,
  category: TrendCategory,
  topic: TrendTopic,
  difficulty: string
): any | null {
  // バリデーション
  if (!raw.question || !Array.isArray(raw.options) || raw.options.length !== 4) {
    console.warn('  ⚠️ 不正な問題データをスキップ');
    return null;
  }
  if (typeof raw.correctAnswer !== 'number' || raw.correctAnswer < 0 || raw.correctAnswer > 3) {
    console.warn('  ⚠️ correctAnswer が不正:', raw.correctAnswer);
    return null;
  }
  if (!raw.explanation) {
    console.warn('  ⚠️ explanation が空');
    return null;
  }

  return {
    id: getNextId(),
    question: raw.question,
    options: raw.options,
    correctAnswer: raw.correctAnswer,
    explanation: raw.explanation,
    category: category.categoryCode,
    difficulty,
    year: '2026-AI予想',
    source: '過去問傾向反映AI予想問題',
    topic: topic.name,
    frequencyCount: topic.frequencyCount,
    grade: topic.grade,
    frequency: topic.grade,
  };
}

// ========================================
// TypeScriptファイル生成
// ========================================
function writeQuestionFile(
  categoryId: string,
  topicName: string,
  questions: any[]
): string {
  const dir = path.join(__dirname, '../../lib/data/questions', categoryId, 'trend-ai');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fileName = `${sanitizeName(topicName)}.ts`;
  const filePath = path.join(dir, fileName);
  const exportName = `trendAI_${sanitizeName(topicName)}`;

  const content = `import { Question } from '@/lib/types/quiz';

export const ${exportName}: Question[] = ${JSON.stringify(questions, null, 2)};
`;

  fs.writeFileSync(filePath, content, 'utf-8');
  return exportName;
}

/**
 * カテゴリのindex.tsを生成
 */
function writeIndexFile(categoryId: string, exports: { fileName: string; exportName: string }[]): void {
  const dir = path.join(__dirname, '../../lib/data/questions', categoryId, 'trend-ai');
  const indexPath = path.join(dir, 'index.ts');

  const imports = exports.map(e =>
    `import { ${e.exportName} } from './${e.fileName.replace('.ts', '')}';`
  ).join('\n');

  const spreads = exports.map(e => `  ...${e.exportName},`).join('\n');
  const arrayName = `${categoryId}TrendAIQuestions`;

  const content = `import { Question } from '@/lib/types/quiz';
${imports}

export const ${arrayName}: Question[] = [
${spreads}
];
`;

  fs.writeFileSync(indexPath, content, 'utf-8');
}

// ========================================
// メイン処理
// ========================================
async function generateForTopic(
  category: TrendCategory,
  topic: TrendTopic
): Promise<{ fileName: string; exportName: string; count: number }> {
  console.log(`\n  📝 トピック: ${topic.name} (Grade ${topic.grade})`);
  const allQuestions: any[] = [];
  const systemPrompt = buildSystemPrompt();

  const difficulties: ('基礎' | '標準' | '応用')[] = ['基礎', '標準', '応用'];

  for (const difficulty of difficulties) {
    const count = topic.targetQuestions[difficulty];
    if (count === 0) continue;

    console.log(`    🎯 ${difficulty} × ${count}問 生成中...`);
    const userPrompt = buildTopicPrompt(category, topic, difficulty, count);

    // JSON応答のためプロンプトを調整
    const wrappedPrompt = userPrompt + '\n\n必ず {"questions": [...]} の形式でJSON出力してください。';

    const rawQuestions = await callOpenAI(systemPrompt, wrappedPrompt);

    for (const raw of rawQuestions) {
      const q = convertToQuestion(raw, category, topic, difficulty);
      if (q) allQuestions.push(q);
    }

    // API制限対策
    await sleep(CONFIG.apiDelay);
  }

  // ファイル書き出し
  const fileName = `${sanitizeName(topic.name)}.ts`;
  const exportName = writeQuestionFile(category.id, topic.name, allQuestions);

  console.log(`    ✅ ${allQuestions.length}問 生成完了 → ${fileName}`);
  return { fileName, exportName, count: allQuestions.length };
}

async function generateForCategory(category: TrendCategory): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📚 カテゴリ: ${category.name} (${category.topics.length}トピック)`);
  console.log(`${'='.repeat(60)}`);

  const exports: { fileName: string; exportName: string }[] = [];
  let totalCount = 0;

  for (const topic of category.topics) {
    const result = await generateForTopic(category, topic);
    exports.push({ fileName: result.fileName, exportName: result.exportName });
    totalCount += result.count;
  }

  // index.ts 生成
  writeIndexFile(category.id, exports);
  console.log(`\n  📦 ${category.name}: 合計 ${totalCount}問, index.ts 生成完了`);
}

async function main(): Promise<void> {
  console.log('🚀 過去問傾向反映AI予想問題 生成スクリプト');
  console.log(`   モデル: ${CONFIG.model}, Temperature: ${CONFIG.temperature}`);

  // コマンドライン引数の解析
  const args = process.argv.slice(2);
  const categoryIndex = args.indexOf('--category');
  const topicIndex = args.indexOf('--topic');

  const targetCategory = categoryIndex >= 0 ? args[categoryIndex + 1] : null;
  const targetTopic = topicIndex >= 0 ? args[topicIndex + 1] : null;

  const allData = getTrendData();

  // カテゴリフィルタ
  const categories = targetCategory
    ? allData.filter(c => c.id === targetCategory)
    : allData;

  if (categories.length === 0) {
    console.error(`❌ カテゴリ「${targetCategory}」が見つかりません`);
    console.log('  利用可能:', allData.map(c => c.id).join(', '));
    process.exit(1);
  }

  let grandTotal = 0;

  for (const category of categories) {
    // トピックフィルタ
    if (targetTopic) {
      const topic = category.topics.find(t => t.name.includes(targetTopic));
      if (!topic) {
        console.log(`  ⚠️ トピック「${targetTopic}」が見つかりません`);
        continue;
      }
      console.log(`\n📚 カテゴリ: ${category.name} > トピック: ${topic.name}`);
      const result = await generateForTopic(category, topic);
      // 単一トピックの場合もindex.tsを生成
      writeIndexFile(category.id, [{ fileName: result.fileName, exportName: result.exportName }]);
      grandTotal += result.count;
    } else {
      await generateForCategory(category);
      grandTotal += category.topics.reduce((sum, t) => {
        const q = t.targetQuestions;
        return sum + q.基礎 + q.標準 + q.応用;
      }, 0);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ 生成完了! 合計約 ${grandTotal}問（目標値）`);
  console.log(`   出力先: lib/data/questions/{category}/trend-ai/`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(err => {
  console.error('❌ 致命的エラー:', err);
  process.exit(1);
});
