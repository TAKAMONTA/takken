#!/usr/bin/env ts-node

/**
 * 宅建業法50問生成スクリプト
 * 基礎15問（肢別） + 標準25問（多肢選択） + 応用10問（多肢選択）
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  logger.error('❌ エラー: OPENAI_API_KEY が設定されていません');
  process.exit(1);
}

const TOPICS = [
  '宅建業の免許制度',
  '宅地建物取引士',
  '営業保証金・保証協会',
  '広告・契約の規制',
  '重要事項説明・37条書面',
  '業務上の規制',
  '監督・罰則',
  '報酬の制限',
  '自ら売主制限'
];

// 基礎問題プロンプト（肢別形式）
function createBasicPrompt(topic: string, count: number): string {
  return `宅建業法の「${topic}」に関する基礎レベルの肢別問題（○×問題）を${count}問作成してください。

【出力形式】
以下のTypeScript形式で、コメントなしで直接コードのみを出力:

\`\`\`typescript
export const takkengyouhouBasicQuestions_${topic.replace(/[・（）\s]/g, '_')}: TrueFalseItem[] = [
  {
    id: "takken_basic_${topic}_1",
    law: "takkengyouhou" as const,
    statement: "明確で簡潔な命題文（○か×かを判断）",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "${topic}",
      year: "2024"
    },
    explanation: "この命題が正しい（または誤っている）理由を初学者にも分かりやすく説明",
    reference: {
      law: "宅建業法",
      article: "第○条"
    },
    topicWeight: 1
  },
  // ${count}問すべて
];
\`\`\`

【要件】
- 初学者向けの明確な基本知識
- 引っ掛けなし
- 各問題は独立`;
}

// 標準・応用問題プロンプト
function createMCQPrompt(topic: string, difficulty: '標準' | '応用', count: number): string {
  return `宅建業法の「${topic}」に関する${difficulty}レベルの4肢択一問題を${count}問作成してください。

【出力形式】
以下のTypeScript形式で、コメントなしで直接コードのみを出力:

\`\`\`typescript
export const takkengyouhou${difficulty}Questions_${topic.replace(/[・（）\s]/g, '_')}: Question[] = [
  {
    id: ${Math.floor(Math.random() * 100000) + 10000},
    question: "具体的な事例を含む問題文。AがBに対して〜の場合における次の記述のうち、宅建業法の規定によれば、正しいものはどれか。",
    options: [
      "選択肢1の具体的な内容",
      "選択肢2の具体的な内容",
      "選択肢3の具体的な内容",
      "選択肢4の具体的な内容"
    ],
    correctAnswer: 0,
    explanation: \`【正解】選択肢1が正しい

【各選択肢の解説】
1. 選択肢1: ○○のため正しい（宅建業法第○条）
2. 選択肢2: ××のため誤り。正しくは△△である
3. 選択肢3: □□のため誤り。正しくは◇◇である
4. 選択肢4: ▽▽のため誤り。正しくは▼▼である

【重要ポイント】
- 条文の正確な理解
- 実務での適用場面\`,
    category: "takkengyouhou",
    difficulty: "${difficulty}",
    year: "2024",
    topic: "${topic}"
  },
  // ${count}問すべて
];
\`\`\`

【${difficulty}レベルの特徴】
${difficulty === '標準' ? '過去問相当の標準的な難易度' : '複数知識の統合が必要な応用レベル'}`;
}

async function generateWithOpenAI(prompt: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '宅地建物取引士試験の問題作成専門家として、高品質な試験問題を作成します。TypeScriptコードのみを出力し、説明文は含めません。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 4000
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
      logger.warn(`  ⚠️  リトライ ${i + 1}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  throw new Error('Max retries reached');
}

function saveToFile(level: string, index: number, content: string): void {
  const baseDir = path.join(__dirname, '../../lib', 'data', 'questions', 'takkengyouhou', 'generated-50');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const fileName = `${level}-${index}.ts`;
  const filePath = path.join(baseDir, fileName);

  const imports = level === 'basic'
    ? "import { TrueFalseItem } from '@/lib/types/quiz';"
    : "import { Question } from '@/lib/types/quiz';";

  fs.writeFileSync(filePath, `${imports}\n\n${content}\n`, 'utf-8');
  logger.success(`    保存: ${fileName}`);
}

async function main() {
  logger.start('宅建業法 50問生成開始');
  logger.info('目標: 基礎15問（肢別） + 標準25問（多肢選択） + 応用10問（多肢選択）');

  let totalGenerated = 0;

  // 基礎15問（肢別形式） - トピックあたり1-2問
  logger.info('📝 基礎レベル（肢別形式） - 15問');
  const basicPerTopic = [2, 2, 2, 2, 2, 2, 1, 1, 1]; // 合計15問

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    const count = basicPerTopic[i];
    logger.info(`  [${i + 1}/9] ${topic} (${count}問)`);

    try {
      const prompt = createBasicPrompt(topic, count);
      const content = await generateWithOpenAI(prompt);
      saveToFile('basic', i + 1, content);
      totalGenerated += count;
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      logger.error(`    ❌ エラー:`, error);
    }
  }

  logger.success(`基礎レベル完了: ${totalGenerated}問`);

  // 標準25問（多肢選択） - トピックあたり2-3問
  logger.info('📝 標準レベル（多肢選択） - 25問');
  const standardPerTopic = [3, 3, 3, 3, 3, 3, 3, 2, 2]; // 合計25問

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    const count = standardPerTopic[i];
    logger.info(`  [${i + 1}/9] ${topic} (${count}問)`);

    try {
      const prompt = createMCQPrompt(topic, '標準', count);
      const content = await generateWithOpenAI(prompt);
      saveToFile('standard', i + 1, content);
      totalGenerated += count;
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      logger.error(`    ❌ エラー:`, error);
    }
  }

  logger.success(`標準レベル完了: 25問`);

  // 応用10問（多肢選択） - トピックあたり1問（主要トピックのみ）
  logger.info('📝 応用レベル（多肢選択） - 10問');
  const advancedTopics = TOPICS.slice(0, 9); // 全トピック
  const advancedPerTopic = [1, 1, 1, 2, 2, 1, 1, 1, 0]; // 合計10問

  for (let i = 0; i < advancedTopics.length; i++) {
    const topic = advancedTopics[i];
    const count = advancedPerTopic[i];
    if (count === 0) continue;

    logger.info(`  [${i + 1}/9] ${topic} (${count}問)`);

    try {
      const prompt = createMCQPrompt(topic, '応用', count);
      const content = await generateWithOpenAI(prompt);
      saveToFile('advanced', i + 1, content);
      totalGenerated += count;
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`    ❌ エラー: ${error}`);
    }
  }

  logger.success(`応用レベル完了: 10問`);
  logger.header(`🎉 宅建業法50問の生成完了！`);
  logger.info(`📊 生成問題数: ${totalGenerated}問`);
  logger.info(`   - 基礎（肢別）: 15問`);
  logger.info(`   - 標準（多肢選択）: 25問`);
  logger.info(`   - 応用（多肢選択）: 10問`);
  logger.info('生成ファイル: lib/data/questions/takkengyouhou/generated-50/');
}

main().catch(error => logger.error('予期せぬエラーが発生しました', error));
