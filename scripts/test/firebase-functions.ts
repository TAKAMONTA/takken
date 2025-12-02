// Firebase Functions テストスクリプト
// 開発環境と本番環境の両方でテスト可能

import * as dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
const logger = require('../utils/logger');

// 環境変数を明示的に読み込み
dotenv.config({ path: ".env.local" });

// 環境変数の確認
logger.info("環境変数チェック", {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "設定済み" : "未設定",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "設定済み" : "未設定",
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

async function testFirebaseFunctions() {
  try {
    logger.start("Firebase初期化中");
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    logger.success("Firebase初期化成功");

    logger.start("匿名認証をテスト中");
    const userCredential = await signInAnonymously(auth);
    logger.success("匿名認証成功", {
      userId: userCredential.user.uid,
    });

    // 他のFirebase Functionsのテストをここに追加可能
    logger.success("すべてのテストが完了しました");
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("エラーが発生しました", err);
    process.exit(1);
  }
}

testFirebaseFunctions();

