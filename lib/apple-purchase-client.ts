/**
 * クライアント側: Apple IAP 購入をサーバー API で検証する
 */

import type { Transaction } from "@/src/plugins/InAppPurchase";
import { logger } from "@/lib/logger";
import { getAppPublicBaseUrl } from "@/lib/app-public-base-url";

function getVerifyApplePurchaseUrl(): string {
  const base = getAppPublicBaseUrl();
  return `${base}/api/subscription/verify-apple-purchase`;
}

export async function verifyApplePurchaseOnServer(
  transaction: Transaction,
  idToken: string
): Promise<{ success: boolean; plan?: string }> {
  const response = await fetch(getVerifyApplePurchaseUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      transactionId: transaction.transactionId,
      productId: transaction.productId,
      purchaseDate: transaction.purchaseDate,
      signedTransactionInfo: transaction.signedTransactionInfo,
    }),
  });

  if (!response.ok) {
    let message = "購入の検証に失敗しました";
    try {
      const data = await response.json();
      if (data.error) message = data.error;
    } catch {
      // ignore
    }
    logger.error("Apple purchase verification failed", new Error(message), {
      status: response.status,
      transactionId: transaction.transactionId,
    });
    throw new Error(message);
  }

  return response.json();
}
