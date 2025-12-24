#!/usr/bin/env node

/**
 * AI予想問題生成スクリプト（JavaScript版・シンプル）
 * まず少数の問題で動作確認
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env.local') });
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🚀 AI予想問題生成スクリプト（テスト版）');
console.log('━'.repeat(60));

if (!OPENAI_API_KEY) {
  console.error('❌ エラー: OPENAI_API_KEY が設定されていません');
  console.log('\n.env.localファイルに以下を追加してください:');
  console.log('OPENAI_API_KEY=sk-proj-...');
  process.exit(1);
}

console.log('✅ OPENAI_API_KEY が設定されています');
console.log(`🔑 キー: ${OPENAI_API_KEY.substring(0, 20)}...`);

// テスト用の問題生成プロンプト
function createPrompt(topic) {
  return `宅建業法の「${topic}」に関するAI予想問題を3問作成してください。

【問題のコンセプト】
このアプリは「AI予想問題」に特化しており、過去問ではなく、AIが試験傾向を分析して作成した予想問題です。

【出力形式】
以下のTypeScript形式で、コメントなしで直接コードのみを出力してください:

\`\`\`typescript
import { Question } from '@/lib/types/quiz';

export const takkengyouhouPredictionQuestions_${topic.replace(/[・（）\s]/g, '_')}: Question[] = [
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
1. ✅ 正しい - ○○という規定により、△△となる
2. ❌ 誤り - ××のため誤り。正しくは△△である
3. ❌ 誤り - □□のため誤り
4. ❌ 誤り - ▽▽のため誤り

【重要ポイント】
- この問題のキーワード・概念
- 実務での注意点\`,
    category: "takkengyouhou",
    difficulty: "標準",
    year: "2025-AI予想",
    topic: "${topic}",
    tags: ["AI予想問題", "frequent"]
  },
  // 残り2問も同様の形式で
];
\`\`\`

【重要な要件】
1. 問題文は必ず「【AI予想問題】」で始めること
2. yearは「2025-AI予想」とすること
3. 解説は詳しく、初学者にも理解できるように
4. 実際の試験で出そうなリアルな問題を作成`;
}

// OpenAI API呼び出し
async function generateWithOpenAI(prompt) {
  console.log('  🤖 API呼び出し中...');
  
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
}

// ファイル保存
function saveToFile(topic, content) {
  const baseDir = path.join(__dirname, '../../lib/data/questions/takkengyouhou/prediction');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const sanitizedTopic = topic.replace(/[・（）\s]/g, '_');
  const fileName = `${sanitizedTopic}.ts`;
  const filePath = path.join(baseDir, fileName);

  fs.writeFileSync(filePath, content + '\n', 'utf-8');
  console.log(`    ✅ 保存: ${fileName}`);
}

// メイン処理
async function main() {
  const testTopics = [
    '宅建業の免許制度',
    '宅地建物取引士',
    '重要事項説明・37条書面'
  ];

  console.log('\n📝 テスト問題生成開始（3トピック × 3問 = 9問）\n');

  for (const topic of testTopics) {
    try {
      console.log(`📚 トピック: ${topic}`);
      const prompt = createPrompt(topic);
      const content = await generateWithOpenAI(prompt);
      saveToFile(topic, content);
      console.log(`  ✅ ${topic} 完了\n`);
      
      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`  ❌ エラー: ${error.message}\n`);
    }
  }

  console.log('='.repeat(60));
  console.log('✅ テスト生成完了！');
  console.log('='.repeat(60));
  console.log('\n📁 生成ファイル: lib/data/questions/takkengyouhou/prediction/');
  console.log('\n次のステップ:');
  console.log('  1. 生成された問題を確認');
  console.log('  2. 問題なければ本番生成を実行');
}

main().catch(error => {
  console.error('\n❌ 予期せぬエラー:', error);
  process.exit(1);
});


