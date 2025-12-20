/**
 * Firebase Admin SDK 認証ヘルパー
 *
 * Next.js API RoutesでFirebase Admin SDKを使用した認証トークン検証を行う
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { logger } from "./logger";

/**
 * サービスアカウントキーを安全にパース
 * - JSON文字列としてパース
 * - BASE64エンコードされた文字列をデコードしてからパース
 * - 改行や余計なクォートを除去
 */
function parseServiceAccountKey(key: string): any | null {
  if (!key || typeof key !== "string") {
    return null;
  }

  // トリムして空文字列チェック
  const trimmed = key.trim();
  if (!trimmed) {
    return null;
  }

  // BASE64エンコードされた文字列の可能性をチェック
  // BASE64文字列は通常、長く、特定の文字のみを含む
  if (trimmed.length > 100 && /^[A-Za-z0-9+/=]+$/.test(trimmed) && !trimmed.includes('{')) {
    try {
      // Node.js環境でのみBufferが利用可能
      if (typeof Buffer !== "undefined") {
        const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
        return JSON.parse(decoded);
      }
    } catch (base64Error) {
      logger.debug("BASE64デコードに失敗、JSON文字列として処理を試行", {
        error: base64Error instanceof Error ? base64Error.message : String(base64Error),
      });
    }
  }

  // JSON文字列としてパースを試行
  try {
    // 改行や余計なクォートを除去
    const cleaned = trimmed
      .replace(/^["']|["']$/g, "") // 先頭・末尾のクォートを除去
      .replace(/\\n/g, "\n") // エスケープされた改行を実際の改行に変換
      .replace(/\\"/g, '"'); // エスケープされたダブルクォートを実際のクォートに変換

    const parsed = JSON.parse(cleaned);
    
    // サービスアカウントキーの形式を検証
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.private_key === "string" &&
      typeof parsed.project_id === "string"
    ) {
      return parsed;
    }
    
    logger.warn("サービスアカウントキーの形式が不正です", {
      hasPrivateKey: !!parsed.private_key,
      hasProjectId: !!parsed.project_id,
    });
    return null;
  } catch (parseError) {
    logger.warn("FIREBASE_SERVICE_ACCOUNT_KEYのパースに失敗しました", {
      error: parseError instanceof Error ? parseError.message : String(parseError),
      keyLength: trimmed.length,
      keyPreview: trimmed.substring(0, 50) + "...",
    });
    return null;
  }
}

/**
 * サービスアカウントキーをパース（共通関数としてエクスポート）
 */
export function parseServiceAccountKeyFromEnv(): any | null {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  return serviceAccountKey ? parseServiceAccountKey(serviceAccountKey) : null;
}

/**
 * Firebase Admin SDK初期化関数（遅延初期化）
 * - サービスアカウントキーを使用（推奨）
 * - プロジェクトIDの一致を検証
 * - 本番環境では認証情報が必須
 */
export function initializeAdminSDK(): void {
  if (getApps().length > 0) {
    return; // Already initialized
  }

  const isProduction = process.env.NODE_ENV === "production";
  const expectedProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // サービスアカウントキーを取得・パース
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const serviceAccount = serviceAccountKey ? parseServiceAccountKey(serviceAccountKey) : null;

  // サービスアカウントキーが存在する場合
  if (serviceAccount && typeof serviceAccount === "object" && serviceAccount.private_key) {
    // プロジェクトIDの一致を検証
    const serviceAccountProjectId = serviceAccount.project_id;
    
    if (expectedProjectId && serviceAccountProjectId !== expectedProjectId) {
      const errorMsg = `FirebaseプロジェクトIDが不一致です。サービスアカウント: ${serviceAccountProjectId}, 環境変数: ${expectedProjectId}`;
      logger.error(errorMsg);
      
      if (isProduction) {
        throw new Error(errorMsg);
      } else {
        logger.warn("開発環境のため続行しますが、認証エラーが発生する可能性があります", {
          serviceAccountProjectId,
          expectedProjectId,
        });
      }
    }

    try {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: expectedProjectId || serviceAccountProjectId,
      });
      logger.info("Firebase Admin SDK初期化成功（サービスアカウントキー使用）", {
        projectId: expectedProjectId || serviceAccountProjectId,
      });
      return;
    } catch (initError) {
      const err = initError instanceof Error ? initError : new Error(String(initError));
      logger.error("Firebase Admin SDK初期化エラー（サービスアカウントキー使用）", err);
      
      if (isProduction) {
        throw err;
      }
      // 開発環境ではフォールバックを試行
    }
  }

  // サービスアカウントキーが無い場合、または初期化に失敗した場合
  if (!expectedProjectId) {
    const errorMsg = "Firebase Admin SDK初期化: プロジェクトIDが設定されていません。NEXT_PUBLIC_FIREBASE_PROJECT_IDを設定してください。";
    logger.error(errorMsg);
    
    if (isProduction) {
      throw new Error(errorMsg);
    } else {
      logger.warn("開発環境のため、デフォルト認証情報の使用を試行します");
    }
  }

  // デフォルト認証情報を使用（Google Cloud環境、または開発環境のフォールバック）
  try {
    if (expectedProjectId) {
      initializeApp({
        projectId: expectedProjectId,
      });
      logger.warn("Firebase Admin SDK初期化（デフォルト認証情報使用）", {
        projectId: expectedProjectId,
        note: isProduction 
          ? "本番環境ではサービスアカウントキーの使用を推奨します" 
          : "開発環境: デフォルト認証情報を使用しています",
      });
    } else {
      throw new Error("プロジェクトIDが設定されていません");
    }
  } catch (fallbackError) {
    const err = fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError));
    logger.error("Firebase Admin SDK初期化エラー（フォールバック）", err);
    
    if (isProduction) {
      throw new Error(
        "Firebase Admin SDKの初期化に失敗しました。FIREBASE_SERVICE_ACCOUNT_KEYまたはNEXT_PUBLIC_FIREBASE_PROJECT_IDを正しく設定してください。"
      );
    } else {
      logger.warn("開発環境: Firebase Admin SDKの初期化に失敗しましたが、続行します", {
        error: err.message,
      });
    }
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
    
    // audience claim不一致の場合は詳細なエラーメッセージ
    if (err.message.includes("aud") || err.message.includes("audience")) {
      const expectedProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      logger.error("Firebase IDトークンのaudience claim不一致", {
        error: err.message,
        expectedProjectId,
        hint: "サービスアカウントキーのproject_idとNEXT_PUBLIC_FIREBASE_PROJECT_IDが一致しているか確認してください",
      });
      throw new Error(
        `FirebaseプロジェクトIDが不一致です。サービスアカウントキーとクライアント設定を確認してください。詳細: ${err.message}`
      );
    }
    
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
  const isProduction = process.env.NODE_ENV === "production";
  const allowDevBypass = process.env.ALLOW_DEV_BYPASS_AUTH === "true";
  
  const authHeader = request.headers.get("authorization");

  // Firebase IDトークンでの認証を試行
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      return await verifyAuthToken(authHeader);
    } catch (error) {
      // Firebase IDトークンが無効な場合、ローカルストレージ認証を試行
      const err = error instanceof Error ? error : new Error(String(error));
      logger.debug("Firebase IDトークン認証失敗、ローカルストレージ認証を試行", {
        error: err.message,
      });
    }
  }

  // ローカルストレージ認証（FirestoreでuserIdの存在を確認）
  const userIdHeader = request.headers.get("x-user-id") || request.headers.get("X-User-Id");
  
  // デバッグログ
  logger.debug("認証ヘッダー確認", {
    hasAuthHeader: !!authHeader,
    hasUserIdHeader: !!userIdHeader,
    userIdHeader: userIdHeader ? `${userIdHeader.substring(0, 8)}...` : "なし",
    nodeEnv: process.env.NODE_ENV,
    allowDevBypass,
  });
  
  // 開発環境での認証バイパス（明示的なフラグがある場合のみ）
  if (!userIdHeader && !isProduction && allowDevBypass) {
    logger.warn("開発環境: 認証バイパスが有効です（ALLOW_DEV_BYPASS_AUTH=true）", {
      warning: "本番環境では使用しないでください",
    });
    // リクエストボディからuserIdを取得する方法を試行
    try {
      const clonedRequest = request.clone();
      const body = await clonedRequest.json().catch(() => ({}));
      
      if (body.userId) {
        logger.debug("開発環境: リクエストボディからuserIdを取得", { 
          userId: `${body.userId.substring(0, 8)}...` 
        });
        return body.userId;
      }
    } catch (bodyError) {
      logger.debug("開発環境: リクエストボディの読み取りに失敗", {
        error: bodyError instanceof Error ? bodyError.message : String(bodyError),
      });
    }
    
    // 認証バイパスが有効でも、userIdが取得できない場合はエラー
    throw new Error("認証が必要です（開発環境でもuserIdが必要です）");
  }
  
  if (userIdHeader) {
    // FirestoreでuserIdの存在を確認（セキュリティのため）
    try {
      // Firebase Admin SDKを初期化
      initializeAdminSDK();
      
      const { getFirestore } = await import("firebase-admin/firestore");
      const db = getFirestore();
      
      // Firestoreが初期化されているか確認
      if (!db) {
        if (isProduction) {
          throw new Error("Firestoreが初期化されていません");
        }
        logger.warn("Firestoreが初期化されていません。ローカルストレージ認証を許可します（開発環境）", { 
          userId: `${userIdHeader.substring(0, 8)}...` 
        });
        return userIdHeader;
      }
      
      const userDoc = await db.collection("users").doc(userIdHeader).get();
      
      if (userDoc.exists) {
        logger.debug("ローカルストレージ認証を使用（Firestoreで確認済み）", { 
          userId: `${userIdHeader.substring(0, 8)}...` 
        });
        return userIdHeader;
      } else {
        // 開発環境、またはバイパスが有効な場合は、Firestoreにユーザーが存在しない場合でも許可（初回ユーザーの可能性）
        if (!isProduction || allowDevBypass) {
          logger.debug("ローカルストレージ認証を使用（Firestoreにユーザーが存在しませんが許可）", { 
            userId: `${userIdHeader.substring(0, 8)}...`,
            reason: !isProduction ? "開発環境" : "ALLOW_DEV_BYPASS_AUTH有効",
          });
          return userIdHeader;
        }
        logger.warn("ローカルストレージ認証: Firestoreにユーザーが存在しません", { 
          userId: `${userIdHeader.substring(0, 8)}...` 
        });
        throw new Error("認証が必要です");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // 開発環境では、エラーが発生しても許可（ただし、明示的なフラグがある場合のみ）
      if (!isProduction && allowDevBypass) {
        logger.debug("ローカルストレージ認証を使用（開発環境: エラーが発生しましたが許可）", { 
          userId: `${userIdHeader.substring(0, 8)}...`,
          error: err.message,
        });
        return userIdHeader;
      }
      
      logger.error("ローカルストレージ認証の検証エラー", err);
      throw new Error("認証が必要です");
    }
  }

  // どちらの認証も失敗した場合
  throw new Error("認証が必要です");
}

/**
 * 認証エラーレスポンスを生成
 * @param message エラーメッセージ
 * @returns NextResponse
 */
export function createAuthErrorResponse(message: string = "認証が必要です") {
  return Response.json({ error: message }, { status: 401 });
}
