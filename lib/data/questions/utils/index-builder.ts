/**
 * 問題データインデックスの自動生成ツール
 * 
 * 各カテゴリのindex.tsファイルから動的に問題ファイルを収集し、
 * 最適化された構造を生成するためのユーティリティ
 */

import { Question } from '@/lib/types/quiz';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@/lib/logger';

/**
 * 問題ファイルのメタデータ
 */
interface QuestionFileMetadata {
  filePath: string;
  exportName: string;
  questionCount?: number;
  difficulty?: string;
  topic?: string;
}

/**
 * カテゴリディレクトリから問題ファイルを収集
 */
export function collectQuestionFiles(categoryPath: string): QuestionFileMetadata[] {
  const files: QuestionFileMetadata[] = [];
  const generatedDir = path.join(categoryPath, 'generated-50');
  const additionalDir = categoryPath;

  // generated-50ディレクトリから収集
  if (fs.existsSync(generatedDir)) {
    const generatedFiles = fs.readdirSync(generatedDir)
      .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
      .map(file => ({
        filePath: path.join('generated-50', file),
        exportName: extractExportName(path.join(generatedDir, file)),
      }));
    
    files.push(...generatedFiles);
  }

  // additionalディレクトリから収集
  const additionalFiles = fs.readdirSync(additionalDir)
    .filter(file => file.startsWith('additional-') && file.endsWith('.ts'))
    .map(file => ({
      filePath: file,
      exportName: extractExportName(path.join(additionalDir, file)),
    }));
  
  files.push(...additionalFiles);

  return files;
}

/**
 * TypeScriptファイルからエクスポート名を抽出
 */
function extractExportName(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // export const または export { のパターンを検索
    const exportMatch = content.match(/export\s+(?:const|)\s*(\w+)\s*=/);
    if (exportMatch) {
      return exportMatch[1];
    }
    // named export の場合
    const namedExportMatch = content.match(/export\s*{\s*(\w+)/);
    if (namedExportMatch) {
      return namedExportMatch[1];
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error extracting export name from ${filePath}`, err);
  }
  return '';
}

/**
 * 最適化されたindex.tsファイルを生成
 */
export function generateOptimizedIndex(
  category: string,
  questionFiles: QuestionFileMetadata[]
): string {
  const imports = questionFiles
    .map(file => {
      const importPath = file.filePath.replace(/\.ts$/, '');
      return `import { ${file.exportName} } from "./${importPath}";`;
    })
    .join('\n');

  const spreads = questionFiles
    .map(file => `  ...${file.exportName},`)
    .join('\n');

  return `/**
 * ${category} - 最適化された問題データ
 * 自動生成されたインデックスファイル
 */

import { Question } from "@/lib/types/quiz";

${imports}

// 全問題を統合
export const ${category}Questions: Question[] = [
${spreads}
];

// 統計情報
export const ${category}Stats = {
  total: ${category}Questions.length,
  basic: ${category}Questions.filter(q => q.difficulty === "基礎").length,
  standard: ${category}Questions.filter(q => q.difficulty === "標準").length,
  advanced: ${category}Questions.filter(q => q.difficulty === "応用").length,
};
`;
}

