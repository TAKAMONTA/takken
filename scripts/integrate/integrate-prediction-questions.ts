#!/usr/bin/env ts-node

/**
 * AI予想問題統合スクリプト
 * 生成されたpredictionフォルダの問題を各カテゴリのindex.tsに統合
 */

import * as fs from 'fs';
import * as path from 'path';

interface CategoryConfig {
  key: string;
  name: string;
  idOffset: number;
}

const categories: CategoryConfig[] = [
  { key: 'takkengyouhou', name: '宅建業法', idOffset: 1000 },
  { key: 'minpou', name: '民法等', idOffset: 2000 },
  { key: 'hourei', name: '法令上の制限', idOffset: 3000 },
  { key: 'zeihou', name: '税・その他', idOffset: 4000 },
];

function integrateCategory(category: CategoryConfig): void {
  console.log(`\n📚 ${category.name}の統合開始...`);

  const predictionDir = path.join(
    __dirname,
    '../../lib/data/questions',
    category.key,
    'prediction'
  );

  // predictionフォルダが存在するか確認
  if (!fs.existsSync(predictionDir)) {
    console.log(`  ⚠️  predictionフォルダが存在しません: ${predictionDir}`);
    return;
  }

  // predictionフォルダ内のファイル一覧を取得
  const files = fs.readdirSync(predictionDir).filter(f => f.endsWith('.ts'));
  
  if (files.length === 0) {
    console.log(`  ⚠️  予想問題ファイルが見つかりません`);
    return;
  }

  console.log(`  ✅ ${files.length}個のファイルを発見`);

  // index.tsを生成
  const indexPath = path.join(
    __dirname,
    '../../lib/data/questions',
    category.key,
    'index.ts'
  );

  let indexContent = `/**
 * ${category.name} - AI予想問題
 * AIが試験傾向を分析して生成した高品質な予想問題
 */
import { Question } from "@/lib/types/quiz";

`;

  // インポート文を生成
  const imports: string[] = [];
  const exports: string[] = [];

  files.forEach((file, index) => {
    const fileName = file.replace('.ts', '');
    const varName = `${category.key}PredictionQuestions_${index + 1}`;
    
    imports.push(`import { ${category.key}PredictionQuestions_${fileName} } from "./prediction/${fileName}";`);
    exports.push(`  ...${category.key}PredictionQuestions_${fileName},`);
  });

  indexContent += imports.join('\n');
  indexContent += '\n\n';
  indexContent += `// 全予想問題を統合\n`;
  indexContent += `export const ${category.key}Questions: Question[] = [\n`;
  indexContent += exports.join('\n');
  indexContent += '\n];\n\n';

  // 統計情報を追加
  indexContent += `// 難易度別の問題数統計\n`;
  indexContent += `export const ${category.key}Stats = {\n`;
  indexContent += `  total: ${category.key}Questions.length,\n`;
  indexContent += `  basic: ${category.key}Questions.filter(q => q.difficulty === "基礎").length,\n`;
  indexContent += `  standard: ${category.key}Questions.filter(q => q.difficulty === "標準").length,\n`;
  indexContent += `  advanced: ${category.key}Questions.filter(q => q.difficulty === "応用").length,\n`;
  indexContent += `};\n\n`;

  indexContent += `// 年度別の問題数統計\n`;
  indexContent += `export const ${category.key}ByYear = ${category.key}Questions.reduce(\n`;
  indexContent += `  (acc, question) => {\n`;
  indexContent += `    const year = question.year || "2025-AI予想";\n`;
  indexContent += `    acc[year] = (acc[year] || 0) + 1;\n`;
  indexContent += `    return acc;\n`;
  indexContent += `  },\n`;
  indexContent += `  {} as Record<string, number>\n`;
  indexContent += `);\n`;

  // index.tsを書き込み
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log(`  ✅ index.ts を更新しました`);
}

function main() {
  console.log('🚀 AI予想問題統合スクリプト');
  console.log('━'.repeat(60));

  categories.forEach(category => {
    try {
      integrateCategory(category);
    } catch (error) {
      console.error(`  ❌ エラー: ${error}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ 統合完了！');
  console.log('='.repeat(60));
  console.log('\n次のステップ:');
  console.log('  1. npm run build でビルド確認');
  console.log('  2. npm run dev で動作確認');
  console.log('  3. vercel --prod でデプロイ');
}

main();


