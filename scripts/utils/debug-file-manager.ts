/**
 * デバッグファイル管理ユーティリティ（TypeScript版）
 * デバッグファイルの生成、管理、クリーンアップを統一的に処理
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

// デバッグファイルの保存先ディレクトリ
const DEBUG_DIR = path.join(process.cwd(), 'tmp', 'debug');

/**
 * デバッグディレクトリを初期化する
 */
export function ensureDebugDir(): void {
  if (!fs.existsSync(DEBUG_DIR)) {
    fs.mkdirSync(DEBUG_DIR, { recursive: true });
    logger.debug(`デバッグディレクトリを作成しました`, { path: DEBUG_DIR });
  }
}

/**
 * デバッグファイルを保存する
 */
export function saveDebugFile(
  filename: string,
  content: string,
  options: { enabled?: boolean } = {}
): string | null {
  const enabled = options.enabled ?? 
    (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development');
  
  if (!enabled) {
    return null;
  }

  ensureDebugDir();

  const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  const filePath = path.join(DEBUG_DIR, finalFilename);

  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    logger.debug(`デバッグファイルを保存しました`, { path: filePath });
    return filePath;
  } catch (error) {
    logger.error('デバッグファイルの保存に失敗しました', error, { path: filePath });
    return null;
  }
}

/**
 * デバッグファイルを保存する（タイムスタンプ付き）
 */
export function saveDebugFileWithTimestamp(
  prefix: string,
  content: string,
  options: { enabled?: boolean } = {}
): string | null {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${prefix}-${timestamp}.json`;
  return saveDebugFile(filename, content, options);
}

/**
 * 古いデバッグファイルをクリーンアップする
 */
export function cleanupDebugFiles(options: {
  maxAge?: number;
  maxFiles?: number;
} = {}): number {
  const { 
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7日
    maxFiles = 10,
  } = options;

  if (!fs.existsSync(DEBUG_DIR)) {
    return 0;
  }

  try {
    const files = fs.readdirSync(DEBUG_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(DEBUG_DIR, file),
        stat: fs.statSync(path.join(DEBUG_DIR, file)),
      }))
      .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

    const now = Date.now();
    let deletedCount = 0;

    files.forEach(file => {
      const age = now - file.stat.mtime.getTime();
      if (age > maxAge) {
        try {
          fs.unlinkSync(file.path);
          deletedCount++;
          logger.debug(`古いデバッグファイルを削除しました`, { 
            file: file.name, 
            age: `${Math.floor(age / (24 * 60 * 60 * 1000))}日` 
          });
        } catch (error) {
          logger.warn(`デバッグファイルの削除に失敗しました`, { 
            file: file.name, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
    });

    const remainingFiles = files.filter(file => {
      const age = now - file.stat.mtime.getTime();
      return age <= maxAge;
    });

    if (remainingFiles.length > maxFiles) {
      const toDelete = remainingFiles.slice(maxFiles);
      toDelete.forEach(file => {
        try {
          fs.unlinkSync(file.path);
          deletedCount++;
          logger.debug(`最大保持数を超えたデバッグファイルを削除しました`, { file: file.name });
        } catch (error) {
          logger.warn(`デバッグファイルの削除に失敗しました`, { 
            file: file.name, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      });
    }

    if (deletedCount > 0) {
      logger.info(`デバッグファイルをクリーンアップしました`, { deletedCount });
    }

    return deletedCount;
  } catch (error) {
    logger.error('デバッグファイルのクリーンアップに失敗しました', error);
    return 0;
  }
}

/**
 * すべてのデバッグファイルを削除する
 */
export function clearAllDebugFiles(): number {
  if (!fs.existsSync(DEBUG_DIR)) {
    return 0;
  }

  try {
    const files = fs.readdirSync(DEBUG_DIR).filter(file => file.endsWith('.json'));
    let deletedCount = 0;

    files.forEach(file => {
      try {
        fs.unlinkSync(path.join(DEBUG_DIR, file));
        deletedCount++;
      } catch (error) {
        logger.warn(`デバッグファイルの削除に失敗しました`, { 
          file, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    if (deletedCount > 0) {
      logger.info(`すべてのデバッグファイルを削除しました`, { deletedCount });
    }

    return deletedCount;
  } catch (error) {
    logger.error('デバッグファイルの削除に失敗しました', error);
    return 0;
  }
}

