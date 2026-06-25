/**
 * Apple App Store Server API による IAP トランザクション検証と
 * Firestore subscriptions 更新（Admin SDK 経由）
 */

import crypto from "crypto";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getApps } from "firebase-admin/app";
import { initializeAdminSDK } from "@/lib/firebase-admin-auth";
import { logger } from "@/lib/server-logger";
import {
  PLAN_CONFIGS,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/lib/types/subscription";

export interface ApplePurchasePayload {
  transactionId: string;
  productId: string;
  purchaseDate?: string;
  signedTransactionInfo?: string;
}

export interface AppleVerificationResult {
  userId: string;
  plan: SubscriptionPlan;
  productId: string;
  transactionId: string;
  expiresAt: Date | null;
}

const PRODUCTION_API = "https://api.storekit.itunes.apple.com";
const SANDBOX_API = "https://api.storekit-sandbox.itunes.apple.com";

function getAppleBundleId(): string {
  return (
    process.env.APPLE_BUNDLE_ID ||
    process.env.NEXT_PUBLIC_APPLE_BUNDLE_ID ||
    "com.takkenroad.app"
  );
}

function hasAppStoreServerCredentials(): boolean {
  return Boolean(
    process.env.APPLE_ISSUER_ID &&
      process.env.APPLE_KEY_ID &&
      process.env.APPLE_PRIVATE_KEY
  );
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}

/**
 * App Store Server API 用 JWT を生成（ES256）
 */
export function generateAppStoreJwt(): string {
  const issuerId = process.env.APPLE_ISSUER_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKeyRaw = process.env.APPLE_PRIVATE_KEY;

  if (!issuerId || !keyId || !privateKeyRaw) {
    throw new Error(
      "Apple App Store Server API の認証情報が未設定です（APPLE_ISSUER_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY）"
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(
    JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" })
  );
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: issuerId,
      iat: now,
      exp: now + 3600,
      aud: "appstoreconnect-v1",
      bid: getAppleBundleId(),
    })
  );
  const signingInput = `${header}.${payload}`;
  const signature = crypto
    .sign("sha256", Buffer.from(signingInput), {
      key: privateKey,
      dsaEncoding: "ieee-p1363",
    })
    .toString("base64url");

  return `${signingInput}.${signature}`;
}

function decodeJwsPayload(jws: string): Record<string, unknown> {
  const parts = jws.split(".");
  if (parts.length !== 3 || !parts[1]) {
    throw new Error("無効な JWS 形式です");
  }
  return JSON.parse(
    Buffer.from(parts[1], "base64url").toString("utf8")
  ) as Record<string, unknown>;
}

function parseAppleTimestamp(value: unknown): Date | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const asNum = Number(value);
    if (Number.isFinite(asNum)) {
      return new Date(asNum);
    }
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }
  return null;
}

function mapProductIdToPlan(productId: string): SubscriptionPlan | null {
  for (const config of Object.values(PLAN_CONFIGS)) {
    if (
      config.applePriceId === productId ||
      config.appleYearlyPriceId === productId
    ) {
      return config.id;
    }
  }
  return null;
}

function getAdminFirestore() {
  if (getApps().length === 0) {
    initializeAdminSDK();
  }
  return getFirestore();
}

async function fetchTransactionFromApple(
  transactionId: string,
  useSandbox: boolean
): Promise<Record<string, unknown>> {
  const baseUrl = useSandbox ? SANDBOX_API : PRODUCTION_API;
  const token = generateAppStoreJwt();
  const url = `${baseUrl}/inApps/v1/transactions/${encodeURIComponent(transactionId)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Apple API エラー (${response.status}): ${body.slice(0, 200)}`
    );
  }

  return (await response.json()) as Record<string, unknown>;
}

/**
 * トランザクションを Apple に問い合わせて検証する
 */
export async function verifyApplePurchase(
  userId: string,
  payload: ApplePurchasePayload
): Promise<AppleVerificationResult> {
  const { transactionId, productId, signedTransactionInfo } = payload;

  if (!transactionId || !productId) {
    throw new Error("transactionId と productId は必須です");
  }

  const plan = mapProductIdToPlan(productId);
  if (!plan || plan === SubscriptionPlan.FREE) {
    throw new Error(`未対応の商品IDです: ${productId}`);
  }

  let expiresAt: Date | null = null;
  let verifiedProductId = productId;
  let verifiedTransactionId = transactionId;

  if (hasAppStoreServerCredentials()) {
    const environments = [
      process.env.APPLE_IAP_USE_SANDBOX === "true",
      process.env.APPLE_IAP_USE_SANDBOX !== "true",
    ];

    let lastError: Error | null = null;
    let appleResponse: Record<string, unknown> | null = null;

    for (const useSandbox of environments) {
      try {
        appleResponse = await fetchTransactionFromApple(transactionId, useSandbox);
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (!appleResponse) {
      throw lastError ?? new Error("Apple トランザクションの検証に失敗しました");
    }

    const signedInfo =
      (appleResponse.signedTransactionInfo as string | undefined) ||
      signedTransactionInfo;

    if (!signedInfo) {
      throw new Error("Apple から signedTransactionInfo を取得できませんでした");
    }

    const decoded = decodeJwsPayload(signedInfo);
    verifiedProductId = String(decoded.productId ?? productId);
    verifiedTransactionId = String(decoded.transactionId ?? transactionId);

    if (decoded.bundleId && decoded.bundleId !== getAppleBundleId()) {
      throw new Error("バンドルIDが一致しません");
    }

    const mappedPlan = mapProductIdToPlan(verifiedProductId);
    if (!mappedPlan || mappedPlan === SubscriptionPlan.FREE) {
      throw new Error(`検証後の商品IDが未対応です: ${verifiedProductId}`);
    }

    expiresAt =
      parseAppleTimestamp(decoded.expiresDate) ||
      parseAppleTimestamp(decoded.expirationDate);

    if (expiresAt && expiresAt <= new Date()) {
      throw new Error("サブスクリプションの有効期限が切れています");
    }
  } else if (signedTransactionInfo) {
    const decoded = decodeJwsPayload(signedTransactionInfo);
    verifiedProductId = String(decoded.productId ?? productId);
    verifiedTransactionId = String(decoded.transactionId ?? transactionId);

    if (decoded.bundleId && decoded.bundleId !== getAppleBundleId()) {
      throw new Error("バンドルIDが一致しません");
    }

    expiresAt =
      parseAppleTimestamp(decoded.expiresDate) ||
      parseAppleTimestamp(decoded.expirationDate);

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "本番環境では Apple App Store Server API の認証情報が必要です"
      );
    }

    logger.warn(
      "Apple API 認証情報なし — 開発環境で JWS ペイロードのみ検証しました",
      { userId, transactionId }
    );
  } else {
    throw new Error(
      "Apple 課金検証の設定が不足しています（App Store Server API 認証情報または signedTransactionInfo）"
    );
  }

  return {
    userId,
    plan: mapProductIdToPlan(verifiedProductId) ?? plan,
    productId: verifiedProductId,
    transactionId: verifiedTransactionId,
    expiresAt,
  };
}

/**
 * 検証済み Apple 購入を Firestore subscriptions に保存（Admin SDK）
 */
export async function persistVerifiedAppleSubscription(
  result: AppleVerificationResult
): Promise<void> {
  const db = getAdminFirestore();
  const { userId, plan, productId, transactionId, expiresAt } = result;

  const idempotencyRef = db.collection("apple_iap_transactions").doc(transactionId);
  const subscriptionRef = db.collection("subscriptions").doc(userId);

  await db.runTransaction(async (tx) => {
    const existing = await tx.get(idempotencyRef);
    if (existing.exists) {
      const data = existing.data();
      if (data?.userId && data.userId !== userId) {
        throw new Error("このトランザクションは別のユーザーに紐づいています");
      }
      return;
    }

    const now = new Date();
    const periodEnd =
      expiresAt ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    tx.set(
      subscriptionRef,
      {
        userId,
        plan,
        planId: plan,
        status: SubscriptionStatus.ACTIVE,
        provider: "apple",
        appleTransactionId: transactionId,
        appleProductId: productId,
        appleBundleId: getAppleBundleId(),
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        startDate: now,
        endDate: periodEnd,
        cancelAtPeriodEnd: false,
        autoRenew: true,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    tx.set(idempotencyRef, {
      userId,
      productId,
      processedAt: FieldValue.serverTimestamp(),
    });
  });

  logger.info("Apple IAP サブスクリプションを保存しました", {
    userId,
    plan,
    transactionId,
  });
}
