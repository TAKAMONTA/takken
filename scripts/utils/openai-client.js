/**
 * OpenAI APIクライアントユーティリティ
 * すべてのスクリプトで統一して使用するOpenAI API呼び出し機能
 */

const logger = require('./logger');

let OpenAI = null;
let openaiClient = null;

/**
 * OpenAIパッケージを読み込む
 * 
 * @returns {typeof OpenAI} OpenAIクラス
 */
function loadOpenAI() {
  if (OpenAI) {
    return OpenAI;
  }

  try {
    OpenAI = require('openai').OpenAI;
    logger.debug('OpenAIパッケージを読み込みました');
    return OpenAI;
  } catch (error) {
    logger.error('OpenAIパッケージの読み込みに失敗しました', error);
    throw new Error('OpenAIパッケージがインストールされていません。npm install openai を実行してください。');
  }
}

/**
 * OpenAIクライアントを初期化する
 * 
 * @param {object} options - オプション
 * @param {string} options.apiKey - APIキー（省略時は環境変数から取得）
 * @returns {object} OpenAIクライアントインスタンス
 */
function createOpenAIClient(options = {}) {
  const OpenAI = loadOpenAI();
  
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEYが設定されていません。環境変数またはオプションで指定してください。');
  }

  const client = new OpenAI({ apiKey });
  logger.debug('OpenAIクライアントを初期化しました');
  
  return client;
}

/**
 * OpenAIクライアントを取得（シングルトン）
 * 
 * @returns {object} OpenAIクライアントインスタンス
 */
function getOpenAIClient() {
  if (openaiClient) {
    return openaiClient;
  }

  openaiClient = createOpenAIClient();
  return openaiClient;
}

/**
 * OpenAI APIを呼び出して問題を生成する
 * 
 * @param {object} options - オプション
 * @param {string} options.systemPrompt - システムプロンプト
 * @param {string} options.userPrompt - ユーザープロンプト
 * @param {object} options.modelOptions - モデルオプション
 * @param {number} options.maxRetries - 最大リトライ回数（デフォルト: 3）
 * @returns {Promise<object>} API応答
 */
async function generateWithOpenAI(options = {}) {
  const {
    systemPrompt,
    userPrompt,
    modelOptions = {},
    maxRetries = 3,
  } = options;

  if (!systemPrompt || !userPrompt) {
    throw new Error('systemPromptとuserPromptは必須です');
  }

  const client = getOpenAIClient();
  
  const defaultModelOptions = {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 8000,
  };

  const finalModelOptions = {
    ...defaultModelOptions,
    ...modelOptions,
  };

  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      logger.debug('OpenAI APIを呼び出しています', {
        model: finalModelOptions.model,
        attempt: retryCount + 1,
      });

      const completion = await client.chat.completions.create({
        ...finalModelOptions,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('AIからの応答が空です');
      }

      logger.debug('OpenAI API呼び出しに成功しました', {
        usage: completion.usage,
      });

      return {
        content: content.trim(),
        usage: completion.usage,
        model: completion.model,
      };
    } catch (error) {
      retryCount++;
      
      const isRateLimitError = 
        error.message?.includes('Too Many Requests') ||
        error.message?.includes('rate limit') ||
        error.status === 429 ||
        error.statusCode === 429;

      if (isRateLimitError && retryCount < maxRetries) {
        const waitSeconds = Math.pow(2, retryCount) * 5;
        logger.warn(`レート制限エラー（${retryCount}/${maxRetries}回目）`, {
          waitSeconds,
          nextRetry: retryCount + 1,
        });
        
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
        continue;
      }

      logger.error('OpenAI API呼び出しエラー', error, {
        retryCount,
        maxRetries,
        isFinalAttempt: retryCount >= maxRetries,
      });

      if (retryCount >= maxRetries) {
        throw new Error(`OpenAI API呼び出しが${maxRetries}回失敗しました。最後のエラー: ${error.message}`);
      }
    }
  }
}

/**
 * JSON形式の応答をパースする
 * 
 * @param {string} content - API応答のコンテンツ
 * @returns {object} パースされたJSONオブジェクト
 */
function parseJSONResponse(content) {
  // コードブロックを除去
  let cleaned = content.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error('JSONパースエラー', error, { content: cleaned.substring(0, 200) });
    throw new Error(`JSONのパースに失敗しました: ${error.message}`);
  }
}

module.exports = {
  loadOpenAI,
  createOpenAIClient,
  getOpenAIClient,
  generateWithOpenAI,
  parseJSONResponse,
};

