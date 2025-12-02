import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
const logger = require('../utils/logger');

// 環境変数を読み込む
dotenv.config({ path: ".env.local" });

async function testEnvironmentVariables() {
  logger.header("環境変数テストを開始します");

  // Firebase設定のテスト
  try {
    logger.start("Firebaseの設定をテスト中");
    type FirebaseConfig = {
      [key: string]: string | undefined;
      apiKey: string | undefined;
      authDomain: string | undefined;
      projectId: string | undefined;
      storageBucket: string | undefined;
      messagingSenderId: string | undefined;
      appId: string | undefined;
      measurementId: string | undefined;
    };

    const firebaseConfig: FirebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    // 必須項目の検証
    const requiredFields = ["apiKey", "projectId", "appId"] as const;
    const missingFields = requiredFields.filter(
      (field) => !firebaseConfig[field]
    );
    if (missingFields.length > 0) {
      throw new Error(
        `Missing required Firebase config: ${missingFields.join(", ")}`
      );
    }

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    logger.success("Firebase設定は正常です", {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Firebase設定エラー", err);
  }

  // OpenAI APIのテスト
  try {
    logger.start("OpenAI APIをテスト中");
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI APIキーが設定されていません");
    }
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // 最新モデルに変更
      messages: [{ role: "user", content: "テストメッセージです" }],
      max_tokens: 10,
    });
    logger.success("OpenAI APIは正常です", {
      response: response.choices[0].message.content,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("OpenAI APIエラー", err);
  }

  // Google AI (Gemini) APIのテスト
  try {
    logger.start("Google AI APIをテスト中");
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Google AI APIキーが設定されていません");
    }

    // APIキーの形式を確認（セキュアに表示）
    const { formatApiKeyStatus } = await import("../utils/security");
    const keyStatus = formatApiKeyStatus(process.env.GOOGLE_AI_API_KEY, {
      showPartial: true, // 開発環境のみ末尾4文字を表示
    });
    
    logger.success("Google AI APIキーは設定されています", {
      keyStatus,
    });

    // 注: 実際のAPIリクエストはスキップ
    logger.info("注: 実際のAPIリクエストはスキップしています", {
      note: "本番環境では、適切なモデル名とAPIキーを使用してください",
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Google AI APIエラー", err);
  }

  // アプリケーションURLの検証
  try {
    logger.start("アプリケーションURLをテスト中");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!appUrl) {
      throw new Error("アプリケーションURLが設定されていません");
    }

    const url = new URL(appUrl);
    if (!url.protocol.startsWith("http")) {
      throw new Error("アプリケーションURLが正しい形式ではありません");
    }
    logger.success("アプリケーションURLは正常です", {
      url: appUrl,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("アプリケーションURLエラー", err);
  }

  logger.success("環境変数テストが完了しました");
}

testEnvironmentVariables();

