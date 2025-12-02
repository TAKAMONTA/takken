/**
 * Firebase Admin SDK 認証ヘルパー
 *
 * Next.js API RoutesでFirebase Admin SDKを使用した認証トークン検証を行う
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { logger } from "./logger";

// Firebase Admin SDK初期化関数（遅延初期化）
function initializeAdminSDK() {
  if (getApps().length > 0) {
    return; // Already initialized
  }

  try {
    // サービスアカウントキーを使用（本番環境では環境変数から取得）
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      // デフォルト認証情報を使用（Google Cloud環境）
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      if (projectId) {
        initializeApp({
          projectId,
        });
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Firebase Admin SDK initialization error", err);
  }
}

/**
 * Firebase IDトークンを検証してユーザーIDを取得
 * @param authHeader Authorizationヘッダー（"Bearer <token>"形式）
 * @returns ユーザーID
 * @throws Error 認証に失敗した場合
 */
export async function verifyAuthToken(authHeader: string): Promise<string> {
  // 遅延初期化
  if (typeof window === "undefined") {
    initializeAdminSDK();
  }

  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    throw new Error("Invalid authorization header");
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    throw new Error("Token not found in authorization header");
  }
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Token verification error", err);
    throw new Error("Invalid token");
  }
}

/**
 * リクエストから認証トークンを検証してユーザーIDを取得
 * @param request NextRequestオブジェクト
 * @returns ユーザーID
 * @throws Error 認証に失敗した場合
 */
export async function verifyRequestAuth(request: Request): Promise<string> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("認証が必要です");
  }

  return await verifyAuthToken(authHeader);
}

/**
 * 認証エラーレスポンスを生成
 * @param message エラーメッセージ
 * @returns NextResponse
 */
export function createAuthErrorResponse(message: string = "認証が必要です") {
  return Response.json({ error: message }, { status: 401 });
}
