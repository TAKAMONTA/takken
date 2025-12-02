/**
 * デバッグファイル管理ユーティリティ
 * デバッグファイルの生成、管理、クリーンアップを統一的に処理
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// デバッグファイルの保存先ディレクトリ
const DEBUG_DIR = path.join(process.cwd(), 'tmp', 'debug');

/**
 * デバッグディレクトリを初期化する
 */
function ensureDebugDir() {
  if (!fs.existsSync(DEBUG_DIR)) {
    fs.mkdirSync(DEBUG_DIR, { recursive: true });
    logger.debug(`デバッグディレクトリを作成しました`, { path: DEBUG_DIR });
  }
}

/**
 * デバッグファイルを保存する
 * 
 * @param {string} filename - ファイル名（拡張子なしでも可）
 * @param {string} content - 保存する内容
 * @param {object} options - オプション
 * @param {boolean} options.enabled - デバッグファイルを保存するかどうか（デフォルト: DEBUG環境変数または開発環境）
 * @returns {string|null} 保存したファイルのパス、保存しなかった場合はnull
 */
function saveDebugFile(filename, content, options = {}) {
  const { enabled = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development' } = options;
  
  if (!enabled) {
    return null;
  }

  ensureDebugDir();

  // 拡張子がない場合は.jsonを追加
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
 * 
 * @param {string} prefix - ファイル名のプレフィックス
 * @param {string} content - 保存する内容
 * @param {object} options - オプション
 * @returns {string|null} 保存したファイルのパス
 */
function saveDebugFileWithTimestamp(prefix, content, options = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${prefix}-${timestamp}.json`;
  return saveDebugFile(filename, content, options);
}

/**
 * 古いデバッグファイルをクリーンアップする
 * 
 * @param {object} options - オプション
 * @param {number} options.maxAge - 最大保持期間（ミリ秒、デフォルト: 7日）
 * @param {number} options.maxFiles - 最大保持ファイル数（デフォルト: 10）
 * @returns {number} 削除したファイル数
 */
function cleanupDebugFiles(options = {}) {
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
      .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime()); // 新しい順

    const now = Date.now();
    let deletedCount = 0;

    // 古いファイルを削除（maxAgeを超えたもの）
    files.forEach(file => {
      const age = now - file.stat.mtime.getTime();
      if (age > maxAge) {
        try {
          fs.unlinkSync(file.path);
          deletedCount++;
          logger.debug(`古いデバッグファイルを削除しました`, { file: file.name, age: `${Math.floor(age / (24 * 60 * 60 * 1000))}日` });
        } catch (error) {
          logger.warn(`デバッグファイルの削除に失敗しました`, { file: file.name, error: error.message });
        }
      }
    });

    // ファイル数が多い場合は古いものから削除（maxFilesを超えた分）
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
          logger.warn(`デバッグファイルの削除に失敗しました`, { file: file.name, error: error.message });
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
 * 
 * @returns {number} 削除したファイル数
 */
function clearAllDebugFiles() {
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
        logger.warn(`デバッグファイルの削除に失敗しました`, { file, error: error.message });
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

module.exports = {
  DEBUG_DIR,
  ensureDebugDir,
  saveDebugFile,
  saveDebugFileWithTimestamp,
  cleanupDebugFiles,
  clearAllDebugFiles,
};

