#!/usr/bin/env ts-node

/**
 * AI予想問題生成テストスクリプト
 * 少量の問題で動作確認
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env.localを読み込む
const envPath = path.join(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔍 環境変数の確認...');
console.log(`📁 .env.local パス: ${envPath}`);
console.log(`📄 ファイル存在: ${fs.existsSync(envPath) ? 'はい' : 'いいえ'}`);

if (!OPENAI_API_KEY) {
  console.error('❌ エラー: OPENAI_API_KEY が設定されていません');
  console.log('\n.env.localファイルに以下を追加してください:');
  console.log('OPENAI_API_KEY=sk-proj-...');
  process.exit(1);
}

console.log('✅ OPENAI_API_KEY が設定されています');
console.log(`🔑 キー: ${OPENAI_API_KEY.substring(0, 15)}...`);

// テスト用の簡単なプロンプト
async function testAPICall() {
  console.log('\n🧪 OpenAI API接続テスト中...');
  
  try {
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
            role: 'user',
            content: 'こんにちは！'
          }
        ],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API呼び出し失敗:', response.status, error);
      return false;
    }

    const data = await response.json();
    console.log('✅ API接続成功！');
    console.log('📝 レスポンス:', data.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ エラー:', error);
    return false;
  }
}

// テスト用の問題生成
async function generateTestQuestion() {
  console.log('\n📝 テスト問題生成中...');
  
  const prompt = `宅建業法に関するAI予想問題を1問作成してください。

【出力形式】
以下のTypeScript形式で出力:

\`\`\`typescript
import { Question } from '@/lib/types/quiz';

export const testQuestion: Question = {
  id: 10001,
  question: "【AI予想問題】問題文をここに記載",
  options: [
    "選択肢1",
    "選択肢2",
    "選択肢3",
    "選択肢4"
  ],
  correctAnswer: 0,
  explanation: "詳しい解説",
  category: "takkengyouhou",
  difficulty: "標準",
  year: "2025-AI予想",
  topic: "宅建業の免許制度",
  tags: ["AI予想問題", "fundamental"]
};
\`\`\``;

  try {
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
            content: '宅建試験の問題作成専門家として、TypeScriptコードのみを出力します。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API呼び出し失敗:', response.status, error);
      return;
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ 問題生成成功！');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('生成された問題:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(content);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // テストファイルとして保存
    const testDir = path.join(__dirname, '../../lib/data/questions/takkengyouhou/prediction');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // コードブロックを抽出
    const match = content.match(/```typescript\n([\s\S]*?)\n```/);
    const code = match ? match[1] : content;

    fs.writeFileSync(
      path.join(testDir, 'test-question.ts'),
      code + '\n',
      'utf-8'
    );
    console.log('📁 テストファイルを保存しました: lib/data/questions/takkengyouhou/prediction/test-question.ts');

  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

async function main() {
  console.log('🚀 AI予想問題生成テスト');
  console.log('━'.repeat(60));

  // Step 1: API接続テスト
  const apiOk = await testAPICall();
  
  if (!apiOk) {
    console.log('\n❌ API接続に失敗しました。環境変数を確認してください。');
    return;
  }

  // Step 2: 問題生成テスト
  await generateTestQuestion();

  console.log('\n' + '='.repeat(60));
  console.log('✅ テスト完了！');
  console.log('='.repeat(60));
  console.log('\n次のステップ:');
  console.log('  1. 生成されたテスト問題を確認');
  console.log('  2. 問題がない場合は本番生成を実行:');
  console.log('     npm run generate:prediction:takkengyouhou');
}

main();

