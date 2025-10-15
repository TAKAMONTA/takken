#!/usr/bin/env ts-node
/**
 * AI問題生成スクリプト
 * 宅建試験の過去問形式でAIに問題を生成させるツール
 *
 * 使用方法:
 * npx ts-node scripts/generate-questions-with-ai.ts --category takkengyouhou --count 10 --year r8
 */

// 環境変数を明示的に読み込み
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { aiClient } from "../lib/ai-client";
import { Question } from "../lib/types/quiz";
import * as fs from "fs";

interface GenerationOptions {
  category: "takkengyouhou" | "minpou" | "hourei" | "zeihou";
  count: number;
  difficulty?: "基礎" | "標準" | "応用";
  startId?: number;
  outputFile?: string;
}

// カテゴリ名の日本語マッピング
const categoryNames: Record<string, string> = {
  takkengyouhou: "宅建業法",
  minpou: "民法等",
  hourei: "法令上の制限",
  zeihou: "税・その他",
};

// カテゴリ別のID範囲
const categoryIdRanges: Record<string, { start: number; end: number }> = {
  takkengyouhou: { start: 500, end: 599 },
  minpou: { start: 600, end: 699 },
  hourei: { start: 700, end: 799 },
  zeihou: { start: 800, end: 899 },
};

/**
 * AI に問題を生成させる
 */
async function generateQuestions(
  options: GenerationOptions
): Promise<Question[]> {
  const { category, count, difficulty = "標準", startId } = options;
  const categoryJp = categoryNames[category];

  // IDの開始値を決定
  const idStart = startId || categoryIdRanges[category].start;

  console.log(`\n🤖 AI問題生成を開始します...`);
  console.log(`分野: ${categoryJp}`);
  console.log(`問題数: ${count}問`);
  console.log(`難易度: ${difficulty}`);
  console.log(`開始ID: ${idStart}\n`);

  const systemPrompt = `あなたは宅地建物取引士試験の問題作成専門家です。

【重要な要件】
1. 実際の宅建試験の過去問レベルに準拠した問題を作成
2. 選択肢は紛らわしく、法的知識と思考力を要求する内容
3. 解説は法的根拠を明確に示し、各選択肢の正誤理由を説明
4. 最新の法改正を反映（令和6-7年度の改正を考慮）
5. 典型的な引っかけパターンを含める

【回答形式】
必ずJSON形式で返してください。他の文章は一切含めないでください。`;

  const userPrompt = `${categoryJp}の${difficulty}レベルの宅建試験問題を${count}問生成してください。

【要件】
- 分野: ${categoryJp}
- 難易度: ${difficulty}
- 問題数: ${count}問

【各問題の形式】
- 問題文: 「〜に関する次の記述のうち、正しいものはどれか」形式
- 選択肢: 4つ
- 解説: 各選択肢の正誤理由を含む簡潔な解説（各選択肢50文字程度）

【重要】
- 解説は簡潔に（冗長にしない）
- JSONの文字列内で改行は使わない（\\nを使用）
- 引用符は必ずエスケープする

【${difficulty}レベルの特徴】
${
  difficulty === "基礎"
    ? "- 条文の基本的な理解を問う\n- 用語の定義や基本原則を確認"
    : difficulty === "標準"
    ? "- 過去問の典型的なパターン\n- 複数の条文知識を組み合わせる\n- 実務的な事例を含む"
    : "- 複雑な事例や複数知識の統合\n- 法改正や最新判例を反映\n- 思考力と応用力を試す"
}

以下のJSON形式で返してください（他の文章は不要）:
{
  "questions": [
    {
      "id": ${idStart},
      "question": "問題文",
      "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctAnswer": 0,
      "explanation": "詳細な解説（各選択肢の正誤理由を含む）",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "year": "2024"${
        difficulty === "基礎"
          ? `,
      "keyTerms": [
        { "term": "重要用語1", "explanation": "用語の説明" }
      ],
      "relatedArticles": [
        { "title": "関連条文名", "content": "条文の内容・要点" }
      ],
      "hints": ["ヒント1", "ヒント2"],
      "studyTips": ["学習のコツ1", "学習のコツ2"]`
          : ""
      }
    }
  ]
}`;

  try {
    const response = await aiClient.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        temperature: 0.7,
        maxTokens: 8000, // トークン数を増やす
      }
    );

    // JSONのみを抽出（コードブロックを除去）
    let content = response.content.trim();

    // コードブロックを除去
    if (content.startsWith("```")) {
      content = content
        .replace(/^```json?\s*\n?/, "")
        .replace(/\n?```\s*$/, "");
    }

    // デバッグ用：生成されたJSONを一時保存
    const debugPath = path.join(process.cwd(), "debug-ai-response.json");
    fs.writeFileSync(debugPath, content, "utf-8");
    console.log(`📝 デバッグ用: AI応答を ${debugPath} に保存しました`);

    // JSONパースを試行（エラーハンドリング強化）
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError: any) {
      console.error("❌ JSONパースエラー:");
      console.error("エラー位置:", parseError.message);
      console.error("生成されたコンテンツの最初の500文字:");
      console.error(content.substring(0, 500));
      console.error("\n生成されたコンテンツの最後の500文字:");
      console.error(content.substring(Math.max(0, content.length - 500)));
      throw new Error(
        `JSONパースに失敗しました: ${parseError.message}\nデバッグファイルを確認してください: ${debugPath}`
      );
    }

    const questions: Question[] = parsed.questions;

    console.log(`✅ ${questions.length}問の生成に成功しました！\n`);

    // 生成された問題のプレビュー
    questions.forEach((q, index) => {
      console.log(`問題${index + 1}: ${q.question.substring(0, 50)}...`);
    });

    return questions;
  } catch (error: any) {
    console.error("❌ AI問題生成エラー:", error.message);

    if (error.message?.includes("API key")) {
      console.error("\n⚠️ AIのAPIキーが設定されていません。");
      console.error(".env.local ファイルに以下を設定してください:");
      console.error("OPENAI_API_KEY=your_api_key");
    }

    throw error;
  }
}

/**
 * TypeScriptファイルとして出力
 */
function outputToFile(questions: Question[], options: GenerationOptions): void {
  const { category, outputFile } = options;
  const categoryJp = categoryNames[category];

  // デフォルトの出力先
  const defaultOutput = `lib/data/questions/${category}/new.ts`;
  const filePath = outputFile || defaultOutput;

  // ファイル内容を生成
  const fileContent = `// ${categoryJp}の問題データ
import { Question } from '@/lib/types/quiz';

export const ${category}NewQuestions: Question[] = ${JSON.stringify(
    questions,
    null,
    2
  )};
`;

  // ディレクトリが存在しない場合は作成
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // ファイルに書き込み
  fs.writeFileSync(filePath, fileContent, "utf-8");

  console.log(`\n📝 問題データを出力しました: ${filePath}`);
  console.log(`\n次のステップ:`);
  console.log(`1. ${category}/index.ts に以下を追加:`);
  console.log(`   import { ${category}NewQuestions } from "./new";`);
  console.log(`   ...${category}NewQuestions,`);
  console.log(`\n2. 動作確認:`);
  console.log(`   npm run dev`);
  console.log(`   http://localhost:3000/practice にアクセス\n`);
}

/**
 * コマンドライン引数の解析
 */
function parseArgs(): GenerationOptions {
  const args = process.argv.slice(2);
  const options: any = {
    category: "takkengyouhou",
    count: 10,
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace("--", "");
    const value = args[i + 1];

    if (key === "category") options.category = value;
    else if (key === "count") options.count = parseInt(value);
    else if (key === "difficulty") options.difficulty = value;
    else if (key === "startId") options.startId = parseInt(value);
    else if (key === "output") options.outputFile = value;
  }

  return options as GenerationOptions;
}

/**
 * メイン処理
 */
async function main() {
  console.log("🚀 AI問題生成ツール\n");

  try {
    const options = parseArgs();

    // 問題を生成
    const questions = await generateQuestions(options);

    // ファイルに出力
    outputToFile(questions, options);

    console.log("✅ 問題生成が完了しました！\n");
  } catch (error: any) {
    console.error("\n❌ エラーが発生しました:", error.message);
    process.exit(1);
  }
}

// スクリプトとして直接実行された場合のみ main を実行
if (require.main === module) {
  main();
}

export { generateQuestions, outputToFile };
