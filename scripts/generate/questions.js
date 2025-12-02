// シンプルなJavaScript版の問題生成スクリプト
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { loadEnv, checkRequiredEnv } = require('../utils/env-loader');
const { generateWithOpenAI, parseJSONResponse } = require('../utils/openai-client');
const { saveDebugFileWithTimestamp } = require('../utils/debug-file-manager');

// 環境変数検証（lib/env-validator.tsを使用する場合は、TypeScript環境が必要）
// JavaScriptスクリプトでは、checkRequiredEnvで簡易検証

// 環境変数の読み込み
logger.info("環境変数読み込み中...");
if (!loadEnv()) {
  logger.warn("環境変数の読み込みに失敗しましたが、続行します");
}

// 必須環境変数の確認
const envCheck = checkRequiredEnv(['OPENAI_API_KEY']);
if (!envCheck.allSet) {
  logger.error("必須の環境変数が設定されていません", undefined, {
    missing: envCheck.missing,
  });
  process.exit(1);
}

logger.success("環境変数の準備完了");

const categoryNames = {
  takkengyouhou: "宅建業法",
  minpou: "民法等",
  hourei: "法令上の制限",
  zeihou: "税・その他",
};

async function generateQuestions(category, count, difficulty = "標準", startId = null) {
  const categoryJp = categoryNames[category] || category;
  const idStart = startId || (category === 'takkengyouhou' ? 500 : category === 'minpou' ? 600 : category === 'hourei' ? 700 : 800);

  logger.start(`AI問題生成を開始します`, {
    category: categoryJp,
    count,
    difficulty,
    startId: idStart,
  });

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
      "year": "2024",
      "source": "追加生成",
      "topic": "トピック名"
    }
  ]
}`;

  try {
    // 共通ユーティリティを使用してAPI呼び出し
    const response = await generateWithOpenAI({
      systemPrompt,
      userPrompt,
      modelOptions: {
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 8000,
      },
      maxRetries: 3,
    });

    // デバッグファイルに保存（開発環境またはDEBUG=trueの場合のみ）
    const debugPath = saveDebugFileWithTimestamp('ai-response', response.content);
    if (debugPath) {
      logger.debug(`デバッグ用: AI応答を保存しました`, { 
        path: debugPath,
        usage: response.usage,
      });
    }

    // JSONパース
    const parsed = parseJSONResponse(response.content);
    const questions = parsed.questions || [];

    logger.success(`${questions.length}問の生成に成功しました`, {
      usage: response.usage,
    });

    questions.forEach((q, index) => {
      logger.debug(`問題${index + 1}: ${q.question.substring(0, 50)}...`);
    });

    return questions;
  } catch (error) {
    logger.error("AI問題生成エラー", error);
    throw error;
  }
}

// コマンドライン引数の解析
const args = process.argv.slice(2);
const options = {
  category: "takkengyouhou",
  count: 5,
  difficulty: "標準",
};

args.forEach(arg => {
  if (arg.startsWith("--category=")) {
    options.category = arg.split("=")[1];
  } else if (arg.startsWith("--count=")) {
    options.count = parseInt(arg.split("=")[1]);
  } else if (arg.startsWith("--difficulty=")) {
    options.difficulty = arg.split("=")[1];
  }
});

// 実行
logger.start("問題生成を開始します", options);
generateQuestions(options.category, options.count, options.difficulty)
  .then(questions => {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0];
    const dir = path.join(process.cwd(), `lib/data/questions/${options.category}`);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 既存のファイルを確認して、連番を付ける
    let batchNum = 1;
    let filename = path.join(dir, `additional-${dateStr}-batch${batchNum}.ts`);
    while (fs.existsSync(filename)) {
      batchNum++;
      filename = path.join(dir, `additional-${dateStr}-batch${batchNum}.ts`);
    }

    const exportName = `${options.category}AdditionalQuestions_${dateStr.replace(/-/g, '')}_batch${batchNum}`;
    const fileContent = `// ${categoryNames[options.category]}の問題データ（追加生成）
// 生成日: ${dateStr}
// バッチ: ${batchNum}

import { Question } from "@/lib/types/quiz";

export const ${exportName}: Question[] = ${JSON.stringify(questions, null, 2)};
`;

    fs.writeFileSync(filename, fileContent, "utf-8");
    logger.success("問題データを出力しました", {
      filename,
      exportName,
      questionCount: questions.length,
    });
  })
  .catch(error => {
    logger.error("エラーが発生しました", error);
    process.exit(1);
  });

