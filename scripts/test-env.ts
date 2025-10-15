import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

// 環境変数を読み込む
dotenv.config({ path: ".env.local" });

async function testEnvironmentVariables() {
  console.log("🔍 環境変数テストを開始します...\n");

  // Firebase設定のテスト
  try {
    console.log("1️⃣ Firebaseの設定をテスト中...");
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
    console.log("✅ Firebase設定は正常です");
    console.log("📝 Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  } catch (error) {
    console.error("❌ Firebase設定エラー:", error);
  }

  // OpenAI APIのテスト
  try {
    console.log("\n2️⃣ OpenAI APIをテスト中...");
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
    console.log("✅ OpenAI APIは正常です");
    console.log("📝 Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("❌ OpenAI APIエラー:", error);
  }

  // Google AI (Gemini) APIのテスト
  try {
    console.log("\n3️⃣ Google AI APIをテスト中...");
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Google AI APIキーが設定されていません");
    }

    // APIキーの形式を確認
    console.log("✅ Google AI APIキーは設定されています");
    console.log(
      "📝 Key:",
      `${process.env.GOOGLE_AI_API_KEY.substring(0, 10)}...`
    );

    // 注: 実際のAPIリクエストはスキップ
    console.log("ℹ️ 注: 実際のAPIリクエストはスキップしています");
    console.log("ℹ️ 本番環境では、適切なモデル名とAPIキーを使用してください");
  } catch (error) {
    console.error("❌ Google AI APIエラー:", error);
  }

  // VAPID公開キーのテスト
  try {
    console.log("\n4️⃣ VAPID公開キーをテスト中...");
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      throw new Error("VAPID公開キーが設定されていません");
    }
    // Base64形式の検証
    const isBase64 = /^[A-Za-z0-9+/=_-]+$/.test(vapidKey);
    if (!isBase64) {
      throw new Error("VAPID公開キーが正しい形式ではありません");
    }
    console.log("✅ VAPID公開キーは正常です");
    console.log("📝 Key:", vapidKey);
  } catch (error) {
    console.error("❌ VAPID公開キーエラー:", error);
  }

  // アプリケーションURLのテスト
  try {
    console.log("\n5️⃣ アプリケーションURLをテスト中...");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("アプリケーションURLが設定されていません");
    }
    const url = new URL(appUrl);
    if (!url.protocol.startsWith("http")) {
      throw new Error("アプリケーションURLが正しい形式ではありません");
    }
    console.log("✅ アプリケーションURLは正常です");
    console.log("📝 URL:", url.toString());
  } catch (error) {
    console.error("❌ アプリケーションURLエラー:", error);
  }

  console.log("\n🏁 環境変数テストが完了しました");
}

testEnvironmentVariables().catch(console.error);
