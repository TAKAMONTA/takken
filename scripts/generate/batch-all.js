// 問題生成と統合を自動化するスクリプト（JavaScript版）
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const batches = [
  { category: 'takkengyouhou', name: '宅建業法', totalBatches: 3, countPerBatch: 5 },
  { category: 'minpou', name: '民法等', totalBatches: 3, countPerBatch: 5 },
  { category: 'hourei', name: '法令上の制限', totalBatches: 2, countPerBatch: 5 },
  { category: 'zeihou', name: '税・その他', totalBatches: 2, countPerBatch: 5 },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    logger.info(`実行: ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, {
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit',
    });

    proc.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function generateQuestions(category, count) {
  logger.header(`📝 ${category}カテゴリの問題生成を開始`);
  
  const scriptPath = path.join(__dirname, 'questions.js');
  const success = await runCommand('node', [
    scriptPath,
    `--category=${category}`,
    `--count=${count}`,
  ]);
  
  if (!success) {
    logger.error(`問題生成に失敗しました: ${category}`, undefined);
    return false;
  }
  
  logger.success(`${category}カテゴリの問題生成が完了しました`);
  await sleep(2000); // レート制限回避
  return true;
}

async function integrateCategory(category) {
  logger.header(`🔗 ${category}カテゴリの問題統合を開始`);
  
  const scriptPath = path.join(__dirname, '../integrate/questions.ts');
  const success = await runCommand('ts-node', [
    scriptPath,
    '--category',
    category,
  ]);
  
  if (!success) {
    logger.error(`問題統合に失敗しました: ${category}`, undefined);
    return false;
  }
  
  logger.success(`${category}カテゴリの問題統合が完了しました`);
  return true;
}

async function main() {
  logger.header('🚀 問題生成と統合作業を開始します');
  
  for (const config of batches) {
    logger.info(`${config.name}（${config.category}）の処理を開始`, {
      totalBatches: config.totalBatches,
      countPerBatch: config.countPerBatch,
    });
    
    // 各バッチで問題生成
    for (let batch = 1; batch <= config.totalBatches; batch++) {
      logger.info(`バッチ ${batch}/${config.totalBatches} を生成中...`);
      
      const success = await generateQuestions(config.category, config.countPerBatch);
      if (!success) {
        logger.warn(`バッチ ${batch} の生成に失敗しましたが、続行します`);
      }
      
      // バッチごとに統合（最後のバッチでまとめて統合する場合は、この部分を調整）
      if (batch === config.totalBatches) {
        await integrateCategory(config.category);
      }
      
      await sleep(3000); // レート制限回避
    }
    
    logger.success(`${config.name}の処理が完了しました`);
    await sleep(5000); // カテゴリ間の待機時間
  }
  
  logger.header('✅ すべての処理が完了しました');
}

main().catch(error => {
  logger.error('エラーが発生しました', error);
  process.exit(1);
});

