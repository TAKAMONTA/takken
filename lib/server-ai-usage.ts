import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { initializeAdminSDK } from "@/lib/firebase-admin-auth";
import { logger } from "@/lib/server-logger";
import { PLAN_CONFIGS, SubscriptionPlan, SubscriptionStatus } from "@/lib/types/subscription";

export interface AIUsageDecision {
  allowed: boolean;
  isPremium: boolean;
  limit: number;
  used: number;
  remaining: number;
  resetAt: Date;
}

function getUsageDocId(userId: string, date: Date): string {
  return `${userId}_${date.getFullYear()}_${date.getMonth()}`;
}

function getNextMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const maybeTimestamp = value as { toDate?: () => Date };
    return typeof maybeTimestamp.toDate === "function" ? maybeTimestamp.toDate() : null;
  }
  return null;
}

async function hasPremiumAccess(userId: string): Promise<boolean> {
  initializeAdminSDK();
  const db = getFirestore();
  const subscriptionSnap = await db.collection("subscriptions").doc(userId).get();

  if (!subscriptionSnap.exists) {
    return false;
  }

  const data = subscriptionSnap.data() || {};
  const status = data.status;
  const isActiveStatus =
    status === SubscriptionStatus.ACTIVE ||
    status === SubscriptionStatus.TRIALING ||
    status === "active" ||
    status === "trialing";

  if (!isActiveStatus) {
    return false;
  }

  const endDate = toDate(data.currentPeriodEnd) || toDate(data.endDate);
  return !endDate || endDate > new Date();
}

export async function checkAIUsage(userId: string): Promise<AIUsageDecision> {
  const limit = PLAN_CONFIGS[SubscriptionPlan.FREE].features.aiExplanationLimit;
  const now = new Date();
  const resetAt = getNextMonthStart(now);

  if (await hasPremiumAccess(userId)) {
    return {
      allowed: true,
      isPremium: true,
      limit: -1,
      used: 0,
      remaining: -1,
      resetAt,
    };
  }

  initializeAdminSDK();
  const db = getFirestore();
  const usageRef = db.collection("ai_usage").doc(getUsageDocId(userId, now));

  const usageSnap = await usageRef.get();
  const currentCount = usageSnap.exists ? Number(usageSnap.data()?.count || 0) : 0;

  if (currentCount >= limit) {
    return {
      allowed: false,
      isPremium: false,
      limit,
      used: currentCount,
      remaining: 0,
      resetAt,
    };
  }

  return {
    allowed: true,
    isPremium: false,
    limit,
    used: currentCount,
    remaining: Math.max(0, limit - currentCount),
    resetAt,
  };
}

export async function consumeAIUsage(userId: string): Promise<AIUsageDecision> {
  const limit = PLAN_CONFIGS[SubscriptionPlan.FREE].features.aiExplanationLimit;
  const now = new Date();
  const resetAt = getNextMonthStart(now);

  if (await hasPremiumAccess(userId)) {
    return {
      allowed: true,
      isPremium: true,
      limit: -1,
      used: 0,
      remaining: -1,
      resetAt,
    };
  }

  initializeAdminSDK();
  const db = getFirestore();
  const usageRef = db.collection("ai_usage").doc(getUsageDocId(userId, now));

  return await db.runTransaction(async (transaction) => {
    const usageSnap = await transaction.get(usageRef);
    const currentCount = usageSnap.exists ? Number(usageSnap.data()?.count || 0) : 0;

    if (currentCount >= limit) {
      return {
        allowed: false,
        isPremium: false,
        limit,
        used: currentCount,
        remaining: 0,
        resetAt,
      };
    }

    const nextCount = currentCount + 1;
    transaction.set(
      usageRef,
      {
        userId,
        year: now.getFullYear(),
        month: now.getMonth(),
        count: FieldValue.increment(1),
        lastUsed: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      allowed: true,
      isPremium: false,
      limit,
      used: nextCount,
      remaining: Math.max(0, limit - nextCount),
      resetAt,
    };
  });
}

/**
 * 予約した利用枠を 1 つ戻す。AI 呼び出しが失敗した時のみ呼ぶこと。
 *
 * 設計: consumeAIUsage を AI 呼び出しの「前」に行うことで TOCTOU バイパスを防ぐが、
 * AI 呼び出しが失敗した場合は枠を消費したままにしないよう refund する。
 * Premium ユーザーは常に枠が無限なので no-op。count が 0 未満になることはない。
 */
export async function refundAIUsage(userId: string): Promise<void> {
  if (await hasPremiumAccess(userId)) return;

  initializeAdminSDK();
  const db = getFirestore();
  const now = new Date();
  const usageRef = db.collection("ai_usage").doc(getUsageDocId(userId, now));

  try {
    await db.runTransaction(async (transaction) => {
      const usageSnap = await transaction.get(usageRef);
      if (!usageSnap.exists) return;
      const currentCount = Number(usageSnap.data()?.count || 0);
      if (currentCount <= 0) return;
      transaction.update(usageRef, {
        count: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
  } catch (err) {
    // refund 失敗は loud にログするが、本流は止めない（呼び元の AI 失敗エラーが優先）
    logger.error(
      "AI usage refund failed",
      err instanceof Error ? err : new Error(String(err)),
      { userId },
    );
  }
}

export function aiUsageHeaders(decision: AIUsageDecision): Record<string, string> {
  return {
    "X-AIUsage-Limit": String(decision.limit),
    "X-AIUsage-Used": String(decision.used),
    "X-AIUsage-Remaining": String(decision.remaining),
    "X-AIUsage-Reset": String(Math.floor(decision.resetAt.getTime() / 1000)),
    "X-AIUsage-Premium": decision.isPremium ? "true" : "false",
  };
}

export function createAIUsageLimitResponse(decision: AIUsageDecision) {
  logger.info("AI usage limit reached", {
    limit: decision.limit,
    used: decision.used,
    remaining: decision.remaining,
  });

  return Response.json(
    {
      error: "今月のAI機能使用回数に達しました。プレミアムプランにアップグレードすると無制限で利用できます。",
      usage: {
        limit: decision.limit,
        used: decision.used,
        remaining: decision.remaining,
        resetAt: decision.resetAt.toISOString(),
      },
    },
    {
      status: 402,
      headers: aiUsageHeaders(decision),
    }
  );
}
