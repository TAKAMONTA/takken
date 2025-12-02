/**
 * 税・その他の問題生成スクリプト
 * 基礎15問（肢別形式） + 標準25問（多肢選択） + 応用10問（多肢選択）= 50問
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { logger } from "../utils/logger";

// .env.localから環境変数を読み込む
dotenv.config({ path: path.join(__dirname, "../..", ".env.local") });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  logger.error("❌ エラー: OPENAI_API_KEY が設定されていません");
  process.exit(1);
}

// 税・その他の主要トピック（9トピック）
const ZEIHOU_TOPICS = [
  "不動産取得税",
  "固定資産税",
  "登録免許税",
  "所得税",
  "譲渡所得",
  "印紙税",
  "地価公示法",
  "不動産鑑定評価基準",
  "その他の制度"
];

// 各難易度の問題数分布
const DISTRIBUTION = {
  basic: [2, 2, 2, 2, 2, 2, 1, 1, 1], // 合計15問
  standard: [3, 3, 3, 3, 3, 3, 3, 2, 2], // 合計25問
  advanced: [2, 1, 1, 1, 1, 1, 1, 1, 1], // 合計10問
};

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "..",
  "lib",
  "data",
  "questions",
  "zeihou",
  "generated-50"
);

// 出力ディレクトリ作成
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// OpenAI API呼び出し（リトライ機能付き + 指数バックオフ）
async function callOpenAI(
  prompt: string,
  retries: number = 5
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "あなたは宅建試験の税・その他の法律問題を作成する専門家です。税率や計算方法、各種優遇措置など、正確で実務的な問題と解説を作成してください。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      logger.error(`❌ API呼び出しエラー (試行 ${i + 1}/${retries}):`, error);
      if (i === retries - 1) throw error;
      // 指数バックオフ: 10秒, 20秒, 40秒, 80秒
      const waitTime = 10000 * Math.pow(2, i);
      logger.warn(`⏳ ${waitTime / 1000}秒待機してリトライします...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  throw new Error("API呼び出しに失敗しました");
}

// 基礎レベル（肢別形式）のプロンプト生成
function createBasicPrompt(topic: string, count: number): string {
  return `税・その他の「${topic}」に関する基礎レベルの肢別問題（○×問題）を${count}問作成してください。

【出力形式】
以下のTypeScript形式で、コメントなしで直接コードのみを出力:

\`\`\`typescript
export const zeihouBasicQuestions_${topic.replace(/[・（）\s]/g, "_")}: TrueFalseItem[] = [
  {
    id: "zeihou_basic_${topic}_1",
    law: "zeihou" as const,
    statement: "明確で簡潔な命題文（○か×かを判断）",
    answer: true,
    source: {
      type: "frequency-blank" as const,
      topic: "${topic}",
      year: "2024"
    },
    explanation: "この命題が正しい（または誤っている）理由を初学者にも分かりやすく説明",
    reference: {
      law: "租税法等",
      article: "第○条"
    },
    topicWeight: 1
  },
  // ${count}問すべて
];
\`\`\`

【重要な要件】
1. statementは明確で簡潔な命題文にする
2. 正誤が明確に判断できる内容にする
3. explanationは初学者にも分かりやすく、税率や計算方法を明示
4. referenceには該当する法令の条文を記載
5. 実務的に重要な税率や控除額などの数値を含める`;
}

// 標準・応用レベル（多肢選択）のプロンプト生成
function createMultipleChoicePrompt(
  topic: string,
  count: number,
  level: "標準" | "応用"
): string {
  const levelDesc = level === "標準" ? "標準的な理解" : "応用的な思考力";
  const prefix = level === "標準" ? "Standard" : "Advanced";

  return `税・その他の「${topic}」に関する${level}レベルの4択問題を${count}問作成してください。

【出力形式】
以下のTypeScript形式で、コメントなしで直接コードのみを出力:

\`\`\`typescript
export const zeihou${prefix}Questions_${topic.replace(/[・（）\s]/g, "_")}: Question[] = [
  {
    id: ${Math.floor(Math.random() * 90000) + 10000},
    question: "具体的な計算例や金額を含む問題文",
    options: [
      "選択肢1",
      "選択肢2",
      "選択肢3",
      "選択肢4"
    ],
    correctAnswer: 0,
    explanation: \`【正解】選択肢1が正しい

【各選択肢の解説】
1. 選択肢1: 正しい理由を詳しく説明（税率や計算根拠を明示）
2. 選択肢2: 誤っている理由を説明
3. 選択肢3: 誤っている理由を説明
4. 選択肢4: 誤っている理由を説明

【重要ポイント】
- 実務上の注意点や優遇措置\`,
    category: "zeihou",
    difficulty: "${level}",
    year: "2024",
    topic: "${topic}"
  },
  // ${count}問すべて
];
\`\`\`

【重要な要件】
1. ${levelDesc}を問う問題にする
2. 具体的な金額や税率を含めた計算問題にする
3. 4つの選択肢すべてが妥当性のある内容にする
4. explanationで全選択肢の正誤理由を明確に説明
5. 各種控除や特例措置を含める`;
}

// TypeScriptコードを抽出
function extractTypeScriptCode(content: string): string {
  const codeBlockMatch = content.match(/```typescript\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }
  return content;
}

// メイン処理
async function main() {
  logger.start("税・その他問題生成を開始します...");

  let fileIndex = 1;

  // 基礎レベル（15問）
  logger.info("📝 基礎レベル（肢別形式）を生成中...");
  for (let i = 0; i < ZEIHOU_TOPICS.length; i++) {
    const topic = ZEIHOU_TOPICS[i];
    const count = DISTRIBUTION.basic[i];
    if (count === 0) continue;

    logger.info(`  ${fileIndex}. ${topic}: ${count}問`);

    const prompt = createBasicPrompt(topic, count);
    const response = await callOpenAI(prompt);
    const code = extractTypeScriptCode(response);

    const fileName = `basic-${fileIndex}.ts`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    const fullCode = `import { TrueFalseItem } from '@/lib/types/quiz';\n\n${code}`;
    fs.writeFileSync(filePath, fullCode, "utf-8");

    logger.success(`  作成完了: ${fileName}`);
    fileIndex++;

    // APIレート制限対策（5秒待機）
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  fileIndex = 1;

  // 標準レベル（25問）
  logger.info("\n📝 標準レベル（多肢選択）を生成中...");
  for (let i = 0; i < ZEIHOU_TOPICS.length; i++) {
    const topic = ZEIHOU_TOPICS[i];
    const count = DISTRIBUTION.standard[i];
    if (count === 0) continue;

    logger.info(`  ${fileIndex}. ${topic}: ${count}問`);

    const prompt = createMultipleChoicePrompt(topic, count, "標準");
    const response = await callOpenAI(prompt);
    const code = extractTypeScriptCode(response);

    const fileName = `standard-${fileIndex}.ts`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    const fullCode = `import { Question } from '@/lib/types/quiz';\n\n${code}`;
    fs.writeFileSync(filePath, fullCode, "utf-8");

    logger.success(`  作成完了: ${fileName}`);
    fileIndex++;

    // APIレート制限対策（5秒待機）
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  fileIndex = 1;

  // 応用レベル（10問）
  logger.info("\n📝 応用レベル（多肢選択）を生成中...");
  for (let i = 0; i < ZEIHOU_TOPICS.length; i++) {
    const topic = ZEIHOU_TOPICS[i];
    const count = DISTRIBUTION.advanced[i];
    if (count === 0) continue;

    logger.info(`  ${fileIndex}. ${topic}: ${count}問`);

    const prompt = createMultipleChoicePrompt(topic, count, "応用");
    const response = await callOpenAI(prompt);
    const code = extractTypeScriptCode(response);

    const fileName = `advanced-${fileIndex}.ts`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    const fullCode = `import { Question } from '@/lib/types/quiz';\n\n${code}`;
    fs.writeFileSync(filePath, fullCode, "utf-8");

    logger.success(`  作成完了: ${fileName}`);
    fileIndex++;

    // APIレート制限対策（5秒待機）
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  logger.success("税・その他50問の生成が完了しました！");
  logger.info(`📁 出力先: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  logger.error("❌ エラーが発生しました:", error);
  process.exit(1);
});
