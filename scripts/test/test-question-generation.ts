#!/usr/bin/env ts-node

/**
 * 問題生成のテストスクリプト
 * 各カテゴリで少数の問題を生成して動作確認
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error('❌ エラー: NEXT_PUBLIC_GOOGLE_API_KEY が設定されていません');
  process.exit(1);
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// 基礎問題（肢別形式）生成プロンプト
function createBasicPrompt(category: string, topic: string): string {
  return `宅建試験の${category}「${topic}」に関する基礎レベルの肢別問題（○×問題）を3問作成してください。

以下のTypeScript形式で出力:

export const testBasicQuestions: TrueFalseItem[] = [
  {
    id: "test_basic_1",
    law: "takkengyouhou",
    statement: "具体的な命題文（○か×かを判断する文章）",
    answer: true,
    source: {
      type: "frequency-blank",
      topic: "${topic}",
      year: "2024"
    },
    explanation: "この命題が正しい（または誤っている）理由の詳細な説明",
    reference: {
      law: "法律名",
      article: "条文番号"
    },
    topicWeight: 1
  }
  // 3問分生成
];

命題文の例:
- "宅地建物取引業の免許は、国土交通大臣または都道府県知事が与える。"
- "宅地建物取引士証の有効期間は5年である。"

初学者向けの明確で分かりやすい問題を作成してください。`;
}

// 標準問題（多肢選択）生成プロンプト
function createStandardPrompt(category: string, topic: string): string {
  return `宅建試験の${category}「${topic}」に関する標準レベルの4肢択一問題を2問作成してください。

以下のTypeScript形式で出力:

export const testStandardQuestions: Question[] = [
  {
    id: 1001,
    question: "具体的な事例を含む問題文",
    options: [
      "選択肢1",
      "選択肢2",
      "選択肢3",
      "選択肢4"
    ],
    correctAnswer: 0,
    explanation: "【正解】選択肢1が正しい\\n\\n【各選択肢の解説】\\n1. 選択肢1: 理由\\n2. 選択肢2: 理由\\n3. 選択肢3: 理由\\n4. 選択肢4: 理由",
    category: "takkengyouhou",
    difficulty: "標準",
    year: "2024",
    topic: "${topic}"
  }
  // 2問分生成
];

過去問レベルの実践的な問題を作成してください。`;
}

async function testGeneration() {
  console.log('🧪 問題生成テスト開始\n');

  // テスト1: 基礎問題（肢別形式）
  console.log('📝 テスト1: 基礎問題（肢別形式）生成');
  try {
    const basicPrompt = createBasicPrompt('宅建業法', '宅建業の免許制度');
    const basicResponse = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: basicPrompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 4096,
        }
      })
    });

    const basicData = await basicResponse.json();
    const basicText = basicData.candidates[0].content.parts[0].text;
    console.log('\n生成結果（基礎）:');
    console.log(basicText.substring(0, 500) + '...\n');

    // ファイルに保存
    const testDir = path.join(__dirname, '../../lib', 'data', 'questions', 'test-generated');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(testDir, 'basic-test.ts'),
      `import { TrueFalseItem } from '@/lib/types/quiz';\n\n${basicText}`,
      'utf-8'
    );
    console.log('✅ 基礎問題の生成に成功しました');
  } catch (error) {
    console.error('❌ 基礎問題の生成に失敗:', error);
  }

  // 少し待機
  await new Promise(resolve => setTimeout(resolve, 2000));

  // テスト2: 標準問題（多肢選択）
  console.log('\n📝 テスト2: 標準問題（多肢選択）生成');
  try {
    const standardPrompt = createStandardPrompt('宅建業法', '重要事項説明');
    const standardResponse = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: standardPrompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 4096,
        }
      })
    });

    const standardData = await standardResponse.json();
    const standardText = standardData.candidates[0].content.parts[0].text;
    console.log('\n生成結果（標準）:');
    console.log(standardText.substring(0, 500) + '...\n');

    const testDir = path.join(__dirname, '../../lib', 'data', 'questions', 'test-generated');
    fs.writeFileSync(
      path.join(testDir, 'standard-test.ts'),
      `import { Question } from '@/lib/types/quiz';\n\n${standardText}`,
      'utf-8'
    );
    console.log('✅ 標準問題の生成に成功しました');
  } catch (error) {
    console.error('❌ 標準問題の生成に失敗:', error);
  }

  console.log('\n🎉 テスト完了！');
  console.log('生成されたファイルを lib/data/questions/test-generated/ で確認してください');
}

testGeneration().catch(console.error);
