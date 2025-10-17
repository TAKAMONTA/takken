/**
 * AI問題生成バッチスクリプト
 * 著作権問題を解決するため、すべての問題をAI生成に置き換える
 */

import { aiQuestionGenerator, GeneratedQuestion } from '../lib/ai-question-generator';
import { Question } from '../lib/types/quiz';
import * as fs from 'fs';
import * as path from 'path';

// カテゴリ定義
const CATEGORIES = {
  takkengyouhou: {
    name: '宅建業法',
    subcategories: [
      '免許制度',
      '宅地建物取引士',
      '営業保証金',
      '重要事項説明（35条書面）',
      '契約書面（37条書面）',
      '業務規制',
      '報酬額の制限',
      '監督処分・罰則'
    ],
    questionsPerSubcategory: 15
  },
  minpou: {
    name: '権利関係（民法等）',
    subcategories: [
      '制限行為能力者',
      '意思表示',
      '代理',
      '時効',
      '物権変動',
      '抵当権',
      '債務不履行',
      '売買契約',
      '賃貸借',
      '相続'
    ],
    questionsPerSubcategory: 12
  },
  hourei: {
    name: '法令上の制限',
    subcategories: [
      '都市計画法',
      '建築基準法',
      '国土利用計画法',
      '農地法',
      '土地区画整理法',
      '宅地造成等規制法'
    ],
    questionsPerSubcategory: 15
  },
  zeihou: {
    name: '税・その他',
    subcategories: [
      '不動産取得税',
      '固定資産税',
      '所得税（譲渡所得）',
      '登録免許税',
      '印紙税',
      '地価公示法',
      '不動産鑑定評価'
    ],
    questionsPerSubcategory: 12
  }
};

// 難易度分布
const DIFFICULTY_DISTRIBUTION = {
  basic: 0.3,      // 30% - 基礎問題
  standard: 0.5,   // 50% - 標準問題
  advanced: 0.2    // 20% - 応用問題
};

interface BatchGenerationResult {
  category: string;
  subcategory: string;
  generated: number;
  failed: number;
  questions: GeneratedQuestion[];
}

/**
 * カテゴリごとに問題を生成
 */
async function generateQuestionsForCategory(
  categoryKey: string,
  categoryConfig: typeof CATEGORIES.takkengyouhou
): Promise<BatchGenerationResult[]> {
  const results: BatchGenerationResult[] = [];

  console.log(`\n📚 ${categoryConfig.name}の問題生成を開始...`);

  for (const subcategory of categoryConfig.subcategories) {
    console.log(`  ⏳ ${subcategory}: ${categoryConfig.questionsPerSubcategory}問生成中...`);

    const result: BatchGenerationResult = {
      category: categoryKey,
      subcategory,
      generated: 0,
      failed: 0,
      questions: []
    };

    // 難易度ごとに問題を生成
    const difficulties = {
      basic: Math.floor(categoryConfig.questionsPerSubcategory * DIFFICULTY_DISTRIBUTION.basic),
      standard: Math.floor(categoryConfig.questionsPerSubcategory * DIFFICULTY_DISTRIBUTION.standard),
      advanced: Math.floor(categoryConfig.questionsPerSubcategory * DIFFICULTY_DISTRIBUTION.advanced)
    };

    // 端数調整
    const remaining = categoryConfig.questionsPerSubcategory -
      (difficulties.basic + difficulties.standard + difficulties.advanced);
    difficulties.standard += remaining;

    // 各難易度で生成
    for (const [level, count] of Object.entries(difficulties)) {
      if (count === 0) continue;

      const difficultyLevel = level === 'basic' ? 2 : level === 'standard' ? 3 : 4;

      try {
        const questions = await generateQuestionsWithRetry(
          categoryKey,
          subcategory,
          difficultyLevel,
          count
        );

        result.questions.push(...questions);
        result.generated += questions.length;
        console.log(`    ✅ ${level}: ${questions.length}問生成成功`);
      } catch (error) {
        console.error(`    ❌ ${level}: 生成失敗 -`, error);
        result.failed += count;
      }

      // API制限対策: 少し待機
      await sleep(2000);
    }

    results.push(result);
    console.log(`  ✨ ${subcategory}: 完了 (成功: ${result.generated}, 失敗: ${result.failed})`);
  }

  return results;
}

/**
 * リトライ機能付き問題生成
 */
async function generateQuestionsWithRetry(
  category: string,
  subcategory: string,
  difficulty: number,
  count: number,
  maxRetries: number = 3
): Promise<GeneratedQuestion[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const prompt = buildGenerationPrompt(category, subcategory, difficulty, count);

      // AI問題生成を実行
      const questions = await aiQuestionGenerator.generatePersonalizedQuestions({
        weaknesses: [{
          category,
          subcategory,
          errorRate: 0.5,
          commonMistakes: [],
          conceptGaps: [],
          priority: 'high',
          improvementPlan: []
        }],
        userLevel: difficulty,
        questionCount: count
      });

      if (questions.length > 0) {
        return questions;
      }
    } catch (error) {
      console.warn(`    ⚠️  試行 ${attempt}/${maxRetries} 失敗:`, error);

      if (attempt < maxRetries) {
        await sleep(5000 * attempt); // 指数バックオフ
      }
    }
  }

  throw new Error(`${count}問の生成に${maxRetries}回失敗しました`);
}

/**
 * 問題生成プロンプトを構築
 */
function buildGenerationPrompt(
  category: string,
  subcategory: string,
  difficulty: number,
  count: number
): string {
  const categoryNames: Record<string, string> = {
    takkengyouhou: '宅建業法',
    minpou: '権利関係（民法等）',
    hourei: '法令上の制限',
    zeihou: '税・その他'
  };

  return `
カテゴリ: ${categoryNames[category]}
サブカテゴリ: ${subcategory}
難易度: ${difficulty}/5
問題数: ${count}

${subcategory}に関する宅建試験レベルの問題を${count}問生成してください。

要件:
1. 実際の宅建試験の出題傾向に準拠
2. 法的根拠を明確にした解説
3. 紛らわしい選択肢で思考力を要求
4. 難易度${difficulty}に適した内容
5. 著作権を侵害しないオリジナル問題
`;
}

/**
 * 生成した問題をTypeScriptファイルとして保存
 */
async function saveQuestionsToFile(
  categoryKey: string,
  results: BatchGenerationResult[]
): Promise<void> {
  const outputDir = path.join(__dirname, '..', 'lib', 'data', 'questions', categoryKey);

  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // すべての問題を1つのファイルにまとめる
  const allQuestions = results.flatMap(r => r.questions);

  const fileContent = `/**
 * AI生成問題 - ${CATEGORIES[categoryKey as keyof typeof CATEGORIES].name}
 * 生成日時: ${new Date().toISOString()}
 * 総問題数: ${allQuestions.length}
 *
 * 注意: この問題はAIにより自動生成されたものです
 * 著作権: オリジナル生成問題のため著作権問題なし
 */

import { Question } from '@/lib/types/quiz';

export const aiGeneratedQuestions: Question[] = ${JSON.stringify(
    allQuestions.map(q => ({
      id: q.id,
      category: CATEGORIES[categoryKey as keyof typeof CATEGORIES].name,
      subcategory: q.subcategory,
      question: q.question,
      options: q.choices,
      correctAnswer: q.correctAnswer - 1, // 0-indexed に変換
      explanation: q.explanation,
      difficulty: getDifficultyLabel(q.difficulty),
      year: new Date().getFullYear().toString(),
      keyTerms: q.concepts,
      relatedArticles: []
    })),
    null,
    2
  )};

function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return '基礎';
  if (difficulty <= 3) return '標準';
  return '応用';
}
`;

  const outputPath = path.join(outputDir, `ai-generated-full.ts`);
  fs.writeFileSync(outputPath, fileContent, 'utf-8');

  console.log(`\n💾 保存完了: ${outputPath}`);
  console.log(`   問題数: ${allQuestions.length}問`);
}

/**
 * スリープ関数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 AI問題生成バッチ処理を開始します\n');
  console.log('目標: 各カテゴリ100問以上のAI生成問題\n');

  const totalResults: Record<string, BatchGenerationResult[]> = {};

  // 各カテゴリで問題を生成
  for (const [categoryKey, categoryConfig] of Object.entries(CATEGORIES)) {
    try {
      const results = await generateQuestionsForCategory(categoryKey, categoryConfig);
      totalResults[categoryKey] = results;

      // ファイルに保存
      await saveQuestionsToFile(categoryKey, results);

      console.log(`\n✅ ${categoryConfig.name}: 完了\n`);
    } catch (error) {
      console.error(`\n❌ ${categoryConfig.name}: エラー -`, error);
    }
  }

  // 最終レポート
  console.log('\n' + '='.repeat(60));
  console.log('📊 生成レポート');
  console.log('='.repeat(60));

  let totalGenerated = 0;
  let totalFailed = 0;

  for (const [categoryKey, results] of Object.entries(totalResults)) {
    const generated = results.reduce((sum, r) => sum + r.generated, 0);
    const failed = results.reduce((sum, r) => sum + r.failed, 0);

    totalGenerated += generated;
    totalFailed += failed;

    console.log(`\n${CATEGORIES[categoryKey as keyof typeof CATEGORIES].name}:`);
    console.log(`  生成成功: ${generated}問`);
    console.log(`  生成失敗: ${failed}問`);
    console.log(`  成功率: ${((generated / (generated + failed)) * 100).toFixed(1)}%`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`総計: ${totalGenerated}問生成成功 / ${totalFailed}問失敗`);
  console.log('='.repeat(60) + '\n');

  if (totalGenerated >= 400) {
    console.log('✅ 目標達成！著作権問題のある過去問ファイルを削除できます。');
  } else {
    console.log(`⚠️  目標未達成。あと${400 - totalGenerated}問必要です。`);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 致命的エラー:', error);
    process.exit(1);
  });
}

export { main as generateAllQuestions };
