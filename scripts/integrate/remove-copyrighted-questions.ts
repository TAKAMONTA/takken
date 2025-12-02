/**
 * 著作権問題のある過去問ファイルを削除するスクリプト
 *
 * 注意: このスクリプトを実行する前に、AI生成問題が十分に用意されていることを確認してください
 */

import * as fs from 'fs';
import * as path from 'path';

// 削除対象のファイルパターン
const COPYRIGHTED_FILE_PATTERNS = [
  // 過去問ファイル (r3.ts, r4.ts, r5.ts, r6.ts, r7.ts, r8.ts)
  /^r\d+\.ts$/,
  // 特定年度問題 (r3-10.ts, r3-12.ts)
  /^r\d+-\d+\.ts$/,
  // その他の過去問ベースファイル
  'new.ts',
  'new2.ts',
  '35-37-articles.ts',
  'mortgage.ts',
  'fixed-asset-tax.ts'
];

// 保持するファイル (AI生成問題)
const PRESERVE_PATTERNS = [
  /^ai-generated.*\.ts$/,
  'index.ts'
];

interface DeletionResult {
  category: string;
  deleted: string[];
  preserved: string[];
  errors: Array<{ file: string; error: string }>;
}

/**
 * カテゴリディレクトリ内の著作権ファイルを削除
 */
function removeCoprightedFilesInCategory(categoryPath: string, categoryName: string): DeletionResult {
  const result: DeletionResult = {
    category: categoryName,
    deleted: [],
    preserved: [],
    errors: []
  };

  try {
    const files = fs.readdirSync(categoryPath);

    for (const file of files) {
      const filePath = path.join(categoryPath, file);

      // ディレクトリはスキップ
      if (fs.statSync(filePath).isDirectory()) {
        continue;
      }

      // 保持パターンに一致するファイルは保持
      if (shouldPreserveFile(file)) {
        result.preserved.push(file);
        console.log(`  ✅ 保持: ${file}`);
        continue;
      }

      // 削除対象かチェック
      if (shouldDeleteFile(file)) {
        try {
          // バックアップを作成
          const backupDir = path.join(categoryPath, '_backup_copyrighted');
          if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
          }

          const backupPath = path.join(backupDir, file);
          fs.copyFileSync(filePath, backupPath);

          // ファイルを削除
          fs.unlinkSync(filePath);

          result.deleted.push(file);
          console.log(`  🗑️  削除: ${file} (バックアップ済み)`);
        } catch (error) {
          result.errors.push({
            file,
            error: error instanceof Error ? error.message : String(error)
          });
          console.error(`  ❌ エラー: ${file} - ${error}`);
        }
      } else {
        result.preserved.push(file);
        console.log(`  ⚪ スキップ: ${file}`);
      }
    }
  } catch (error) {
    console.error(`❌ カテゴリ処理エラー: ${categoryName}`, error);
  }

  return result;
}

/**
 * ファイルを保持すべきか判定
 */
function shouldPreserveFile(filename: string): boolean {
  return PRESERVE_PATTERNS.some(pattern => {
    if (typeof pattern === 'string') {
      return filename === pattern;
    }
    return pattern.test(filename);
  });
}

/**
 * ファイルを削除すべきか判定
 */
function shouldDeleteFile(filename: string): boolean {
  return COPYRIGHTED_FILE_PATTERNS.some(pattern => {
    if (typeof pattern === 'string') {
      return filename === pattern;
    }
    return pattern.test(filename);
  });
}

/**
 * index.ts を更新してAI生成問題のみを参照
 */
function updateIndexFile(categoryPath: string, categoryName: string): void {
  const indexPath = path.join(categoryPath, 'index.ts');

  const newIndexContent = `/**
 * ${categoryName} - 問題インデックス
 * AI生成問題のみを使用（著作権問題を解決）
 */

import { Question } from '@/lib/types/quiz';

// AI生成問題をインポート
import { aiGeneratedQuestions as aiQuestions1 } from './ai-generated-1';
import { aiGeneratedQuestions as aiQuestions2 } from './ai-generated-2';
import { aiGeneratedQuestions as aiQuestionsFull } from './ai-generated-full';

// すべてのAI生成問題を統合
export const questions: Question[] = [
  ...aiQuestions1,
  ...aiQuestions2,
  ...aiQuestionsFull
];

// デフォルトエクスポート
export default questions;
`;

  try {
    // 既存のindex.tsをバックアップ
    if (fs.existsSync(indexPath)) {
      const backupPath = indexPath.replace('.ts', '.backup.ts');
      fs.copyFileSync(indexPath, backupPath);
    }

    // 新しいindex.tsを作成
    fs.writeFileSync(indexPath, newIndexContent, 'utf-8');
    console.log(`  📝 index.ts を更新しました`);
  } catch (error) {
    console.error(`  ❌ index.ts更新エラー:`, error);
  }
}

/**
 * メイン削除処理
 */
async function main() {
  console.log('🚨 著作権問題ファイル削除スクリプト\n');
  console.log('⚠️  注意: このスクリプトは著作権の可能性のあるファイルを削除します');
  console.log('⚠️  バックアップが作成されますが、実行前にgit commitを推奨します\n');

  // 確認プロンプト
  console.log('続行しますか? (この処理をスキップするにはCtrl+Cを押してください)');
  console.log('実際の削除を行うには、コード内のconfirmFlagをtrueに設定してください\n');

  const confirmFlag = false; // 安全のため、デフォルトはfalse

  if (!confirmFlag) {
    console.log('🛑 確認フラグがfalseのため、ドライラン（模擬実行）モードで実行します\n');
  }

  const questionsDir = path.join(__dirname, '../..', 'lib', 'data', 'questions');
  const categories = ['takkengyouhou', 'minpou', 'hourei', 'zeihou'];

  const allResults: DeletionResult[] = [];

  for (const category of categories) {
    const categoryPath = path.join(questionsDir, category);

    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️  カテゴリが存在しません: ${category}`);
      continue;
    }

    console.log(`\n📂 処理中: ${category}`);
    console.log('─'.repeat(60));

    if (confirmFlag) {
      const result = removeCoprightedFilesInCategory(categoryPath, category);
      allResults.push(result);

      // index.tsを更新
      updateIndexFile(categoryPath, category);
    } else {
      // ドライランモード
      const files = fs.readdirSync(categoryPath);
      const wouldDelete = files.filter(f =>
        !shouldPreserveFile(f) && shouldDeleteFile(f) && !fs.statSync(path.join(categoryPath, f)).isDirectory()
      );

      console.log(`  削除予定: ${wouldDelete.length}ファイル`);
      wouldDelete.forEach(f => console.log(`    - ${f}`));
    }
  }

  // レポート出力
  if (confirmFlag && allResults.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 削除レポート');
    console.log('='.repeat(60));

    let totalDeleted = 0;
    let totalPreserved = 0;
    let totalErrors = 0;

    for (const result of allResults) {
      totalDeleted += result.deleted.length;
      totalPreserved += result.preserved.length;
      totalErrors += result.errors.length;

      console.log(`\n${result.category}:`);
      console.log(`  削除: ${result.deleted.length}ファイル`);
      console.log(`  保持: ${result.preserved.length}ファイル`);
      if (result.errors.length > 0) {
        console.log(`  エラー: ${result.errors.length}件`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`総計: ${totalDeleted}ファイル削除 / ${totalPreserved}ファイル保持`);
    if (totalErrors > 0) {
      console.log(`エラー: ${totalErrors}件`);
    }
    console.log('='.repeat(60) + '\n');

    console.log('✅ 削除完了！バックアップは _backup_copyrighted/ に保存されています');
    console.log('💡 次のステップ: git commit でこの変更をコミットしてください\n');
  } else {
    console.log('\n✅ ドライラン完了（ファイルは削除されていません）');
    console.log('💡 実際に削除するには、スクリプト内のconfirmFlagをtrueに設定してください\n');
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 致命的エラー:', error);
    process.exit(1);
  });
}

export { main as removeCoprightedQuestions };
