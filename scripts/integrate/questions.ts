#!/usr/bin/env ts-node
/**
 * 追加生成された問題をindex.tsに自動統合するスクリプト（改善版）
 * 
 * 改善点:
 * - 複数のフォールバック戦略を実装
 * - 詳細なエラーメッセージ
 * - ロールバック機能（バックアップ作成）
 * - 構文チェック機能
 */

import * as fs from 'fs';
import * as path from 'path';
const logger = require('../utils/logger');

interface CategoryConfig {
  name: string;
  path: string;
  indexFile: string;
}

const categories: Record<string, CategoryConfig> = {
  takkengyouhou: {
    name: '宅建業法',
    path: 'lib/data/questions/takkengyouhou',
    indexFile: 'lib/data/questions/takkengyouhou/index.ts',
  },
  minpou: {
    name: '民法等',
    path: 'lib/data/questions/minpou',
    indexFile: 'lib/data/questions/minpou/index.ts',
  },
  hourei: {
    name: '法令上の制限',
    path: 'lib/data/questions/hourei',
    indexFile: 'lib/data/questions/hourei/index.ts',
  },
  zeihou: {
    name: '税・その他',
    path: 'lib/data/questions/zeihou',
    indexFile: 'lib/data/questions/zeihou/index.ts',
  },
};

function findAdditionalFiles(categoryPath: string): string[] {
  const fullPath = path.join(process.cwd(), categoryPath);
  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const files = fs.readdirSync(fullPath)
    .filter(file => file.startsWith('additional-') && file.endsWith('.ts'))
    .filter(file => file.includes('2025')) // 2025年のファイルのみ
    .sort();

  return files;
}

/**
 * エクスポート名を抽出（複数のパターンを試行）
 */
function extractExportName(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return '';
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  
  // パターン1: export const Name:
  let match = content.match(/export\s+const\s+(\w+)\s*:/);
  if (match) return match[1];
  
  // パターン2: export const Name =
  match = content.match(/export\s+const\s+(\w+)\s*=/);
  if (match) return match[1];
  
  // パターン3: export { Name }
  match = content.match(/export\s*\{\s*(\w+)\s*\}/);
  if (match) return match[1];
  
  return '';
}

/**
 * バックアップファイルを作成
 */
function createBackup(filePath: string): { content: string; path: string } {
  const backupPath = `${filePath}.backup.${Date.now()}`;
  const content = fs.readFileSync(filePath, 'utf-8');
  fs.writeFileSync(backupPath, content, 'utf-8');
  logger.debug(`バックアップを作成しました`, { backupPath });
  return { content, path: backupPath };
}

/**
 * バックアップから復元
 */
function restoreBackup(backup: { content: string; path: string }, filePath: string): void {
  fs.writeFileSync(filePath, backup.content, 'utf-8');
  logger.info(`バックアップから復元しました`, { filePath, backupPath: backup.path });
}

/**
 * バックアップファイルを削除
 */
function cleanupBackup(backup: { content: string; path: string }): void {
  try {
    if (fs.existsSync(backup.path)) {
      fs.unlinkSync(backup.path);
      logger.debug(`バックアップファイルを削除しました`, { backupPath: backup.path });
    }
  } catch (error) {
    logger.warn(`バックアップファイルの削除に失敗しました`, {
      backupPath: backup.path,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * インポート文が既に存在するか確認（複数のパターンをチェック）
 */
function isImportAlreadyExists(content: string, exportName: string, fileName: string): boolean {
  const baseName = fileName.replace('.ts', '');
  
  // パターン1: import { Name } from "./file"
  const pattern1 = new RegExp(`import\\s*\\{\\s*${exportName}\\s*\\}\\s*from\\s*["']\\.?/\\s*${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
  if (pattern1.test(content)) return true;
  
  // パターン2: エクスポート名が含まれているか（緩いチェック）
  const loosePattern = new RegExp(`import.*${exportName}.*from.*${baseName}`, 'm');
  if (loosePattern.test(content)) return true;
  
  return false;
}

/**
 * スプレッド演算子が既に存在するか確認
 */
function isSpreadAlreadyExists(content: string, exportName: string): boolean {
  // パターン1: ...Name,
  const pattern1 = new RegExp(`\\.\\.\\.\\s*${exportName}\\s*,`, 'm');
  if (pattern1.test(content)) return true;
  
  // パターン2: ...Name
  const pattern2 = new RegExp(`\\.\\.\\.\\s*${exportName}(\\s*,|\\s*$)`, 'm');
  if (pattern2.test(content)) return true;
  
  return false;
}

/**
 * 簡易構文チェック
 */
function validateSyntax(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 括弧のバランスチェック
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`括弧のバランスが取れていません（{${openBraces} vs }${closeBraces}）`);
  }

  // 配列の括弧チェック
  const openBrackets = (content.match(/\[/g) || []).length;
  const closeBrackets = (content.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push(`配列の括弧のバランスが取れていません（[${openBrackets} vs ]${closeBrackets}）`);
  }

  // export constが存在するかチェック
  if (!content.match(/export\s+const\s+\w+Questions/)) {
    errors.push('export const Questions が見つかりません');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function integrateCategory(category: string) {
  const config = categories[category];
  if (!config) {
    logger.error(`不明なカテゴリ: ${category}`, undefined, { category });
    return false;
  }

  logger.header(`${config.name}の統合を開始`);

  const indexFilePath = path.join(process.cwd(), config.indexFile);
  if (!fs.existsSync(indexFilePath)) {
    logger.error(`インデックスファイルが見つかりません`, undefined, {
      indexFile: config.indexFile,
      path: indexFilePath,
    });
    return false;
  }

  // バックアップを作成
  const backup = createBackup(indexFilePath);

  try {
    const additionalFiles = findAdditionalFiles(config.path);
    if (additionalFiles.length === 0) {
      logger.info(`追加ファイルが見つかりませんでした`, { category: config.name });
      cleanupBackup(backup);
      return true;
    }

    logger.info(`${additionalFiles.length}個の追加ファイルを発見`, { 
      count: additionalFiles.length,
      files: additionalFiles,
    });

    let indexContent = fs.readFileSync(indexFilePath, 'utf-8');
    const importLines: string[] = [];
    const exportNames: string[] = [];

    // 各追加ファイルの処理
    for (const file of additionalFiles) {
      const filePath = path.join(process.cwd(), config.path, file);
      const exportName = extractExportName(filePath);

      if (!exportName) {
        logger.warn(`エクスポート名を抽出できませんでした`, { file });
        continue;
      }

      // 既にインポートされているか確認（改善版）
      if (isImportAlreadyExists(indexContent, exportName, file)) {
        logger.debug(`${exportName} は既にインポートされています`, { exportName, file });
        // インポートは既にあるが、スプレッドが欠けている可能性がある
        if (!isSpreadAlreadyExists(indexContent, exportName)) {
          exportNames.push(exportName);
        }
        continue;
      }

      const relativePath = `./${file.replace('.ts', '')}`;
      importLines.push(`import { ${exportName} } from "${relativePath}";`);
      exportNames.push(exportName);
    }

    // スプレッド演算子が必要なエクスポート名を抽出
    const spreadLines = exportNames
      .filter(name => !isSpreadAlreadyExists(indexContent, name))
      .map(name => `  ...${name},`);

    if (importLines.length === 0 && spreadLines.length === 0) {
      logger.info(`新しいインポートやスプレッドはありません`, { category: config.name });
      cleanupBackup(backup);
      return true;
    }

  // インポート文を追加（追加問題セクションを見つける）
  const additionalSection = /\/\/ 追加問題[\s\S]*?(?=\/\/|$)/m;
  const additionalMatch = indexContent.match(additionalSection);

  if (additionalMatch) {
    // 追加問題セクションの前にインポートを追加
    const sectionIndex = indexContent.indexOf(additionalMatch[0]);
    const beforeSection = indexContent.substring(0, sectionIndex);
    const afterSection = indexContent.substring(sectionIndex);
    
    const newImports = importLines.join('\n') + '\n';
    indexContent = beforeSection + newImports + afterSection;
  } else {
    // 追加問題セクションがない場合は、export constの前に追加
    const exportMatch = indexContent.match(/export\s+const\s+\w+Questions/);
    if (exportMatch) {
      const exportIndex = indexContent.indexOf(exportMatch[0]);
      const newImports = '\n// 追加問題\n' + importLines.join('\n') + '\n';
      indexContent = indexContent.substring(0, exportIndex) + newImports + indexContent.substring(exportIndex);
    }
  }

    // export配列に追加（既に含まれているか確認 - 改善版）
    const arrayMatch = indexContent.match(/export\s+const\s+(\w+Questions):\s*Question\[\]\s*=\s*\[([\s\S]*?)\];/);
    if (arrayMatch) {
      // 既存のスプレッドを確認（改善版）
      const missingExports = exportNames.filter(name => !isSpreadAlreadyExists(indexContent, name));

      if (missingExports.length > 0) {
        // 追加問題セクションを探す（改善版）
        const additionalSpread = /(\/\/\s*追加問題[\s\S]*?)(\];)/m;
        const additionalMatch = indexContent.match(additionalSpread);
        
        if (additionalMatch) {
          // 既存の追加問題セクションの後に追加
          const newSpreads = missingExports.map(name => `  ...${name},`).join('\n');
          indexContent = indexContent.replace(
            additionalSpread,
            `$1\n${newSpreads}\n$2`
          );
        } else {
          // 追加問題セクションがない場合は、配列の最後に追加
          const newSpreads = missingExports.map(name => `  ...${name},`).join('\n');
          indexContent = indexContent.replace(
            /(\];)/,
            `  // 追加問題\n${newSpreads}\n$1`
          );
        }
      }
    }

    // 構文チェック（改善版）
    const syntaxCheck = validateSyntax(indexContent);
    if (!syntaxCheck.valid) {
      logger.error(`構文エラーが検出されました`, undefined, {
        indexFile: config.indexFile,
        errors: syntaxCheck.errors,
      });
      restoreBackup(backup, indexFilePath);
      cleanupBackup(backup);
      return false;
    }

    // ファイルに書き戻し
    fs.writeFileSync(indexFilePath, indexContent, 'utf-8');
    logger.success(`${config.name}の統合が完了しました`, {
      category: config.name,
      integratedFiles: importLines.length,
      spreadsAdded: exportNames.filter(name => !isSpreadAlreadyExists(fs.readFileSync(indexFilePath, 'utf-8'), name)).length,
      exportNames,
    });
    
    cleanupBackup(backup);
    return true;

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`統合中にエラーが発生しました`, err, {
      category: config.name,
    });
    restoreBackup(backup, indexFilePath);
    cleanupBackup(backup);
    return false;
  }
}

// コマンドライン引数の解析
const args = process.argv.slice(2);
const categoryIndex = args.indexOf('--category');
const category = categoryIndex !== -1 && args[categoryIndex + 1] 
  ? args[categoryIndex + 1] 
  : null;

if (!category) {
  logger.error('カテゴリが指定されていません', undefined, {
    availableCategories: Object.keys(categories),
  });
  process.exit(1);
}

integrateCategory(category);

