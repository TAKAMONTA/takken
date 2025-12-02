// Firebase設定のデバッグ用ユーティリティ

import { logger } from './logger';

export const debugFirebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    useEmulators: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS
  };

  logger.debug('Firebase設定のデバッグ情報', { config });
  
  const missingVars = Object.entries(config)
    .filter(([key, value]) => !value && key !== 'useEmulators')
    .map(([key]) => key);

  if (missingVars.length > 0) {
    logger.warn('不足している環境変数', { missingVars });
    logger.info('.env.localファイルを作成して、Firebaseプロジェクトの設定を追加してください');
  } else {
    logger.info('すべての環境変数が設定されています');
  }

  return config;
};

export const validateFirebaseConfig = () => {
  const config = debugFirebaseConfig();
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Firebase設定が不完全です。不足している環境変数: ${missingVars.join(', ')}`);
  }

  return true;
};
