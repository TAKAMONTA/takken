/**
 * 環境変数読み込みユーティリティ
 * すべてのスクリプトで統一して使用する環境変数読み込み機能
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * .env.localファイルから環境変数を読み込む
 * dotenvパッケージが利用できない場合でも動作する純粋な実装
 * 
 * @param {string} envPath - .env.localのパス（省略時は自動検出）
 * @returns {boolean} 読み込みに成功したかどうか
 */
function loadEnvLocal(envPath = null) {
  try {
    const targetPath = envPath || path.resolve(process.cwd(), '.env.local');
    
    if (!fs.existsSync(targetPath)) {
      logger.warn('.env.localが見つかりません', { path: targetPath });
      return false;
    }

    const envContent = fs.readFileSync(targetPath, 'utf-8');
    let loadedCount = 0;

    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      
      // コメント行と空行をスキップ
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }

      // KEY=VALUE形式をパース
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) {
        return;
      }

      const key = trimmed.substring(0, equalIndex).trim();
      let value = trimmed.substring(equalIndex + 1).trim();

      // 引用符を削除
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (key && value) {
        process.env[key] = value;
        loadedCount++;
      }
    });

    logger.debug(`環境変数を読み込みました`, { 
      path: targetPath,
      count: loadedCount,
    });

    return true;
  } catch (error) {
    logger.error('環境変数の読み込みに失敗しました', error);
    return false;
  }
}

/**
 * dotenvを使用して環境変数を読み込む（推奨）
 * dotenvパッケージが利用可能な場合に使用
 * 
 * @param {string} envPath - .env.localのパス（省略時は自動検出）
 * @returns {boolean} 読み込みに成功したかどうか
 */
function loadEnvWithDotenv(envPath = null) {
  try {
    const dotenv = require('dotenv');
    const targetPath = envPath || path.resolve(process.cwd(), '.env.local');
    
    const result = dotenv.config({ path: targetPath });
    
    if (result.error) {
      logger.warn('dotenvでの環境変数読み込みに失敗しました', { 
        error: result.error.message,
        path: targetPath,
      });
      return false;
    }

    logger.debug('dotenvで環境変数を読み込みました', { 
      path: targetPath,
    });

    return true;
  } catch (error) {
    // dotenvが利用できない場合はfalseを返す（フォールバック可能）
    logger.debug('dotenvが利用できません。手動読み込みを使用します', { error: error.message });
    return false;
  }
}

/**
 * 環境変数を読み込む（自動的に最適な方法を選択）
 * 
 * @param {object} options - オプション
 * @param {string} options.path - 環境変数ファイルのパス
 * @param {boolean} options.requireDotenv - dotenvの使用を強制（利用できない場合はエラー）
 * @returns {boolean} 読み込みに成功したかどうか
 */
function loadEnv(options = {}) {
  const { path: envPath, requireDotenv = false } = options;

  // dotenvの使用を強制する場合
  if (requireDotenv) {
    return loadEnvWithDotenv(envPath);
  }

  // dotenvを試行、失敗した場合は手動読み込み
  const dotenvResult = loadEnvWithDotenv(envPath);
  if (dotenvResult) {
    return true;
  }

  // フォールバック: 手動読み込み
  return loadEnvLocal(envPath);
}

/**
 * 必須の環境変数が設定されているかチェック
 * 
 * @param {string[]} requiredVars - 必須の環境変数名の配列
 * @returns {object} { allSet: boolean, missing: string[] }
 */
function checkRequiredEnv(requiredVars) {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    allSet: missing.length === 0,
    missing,
  };
}

module.exports = {
  loadEnv,
  loadEnvLocal,
  loadEnvWithDotenv,
  checkRequiredEnv,
};

