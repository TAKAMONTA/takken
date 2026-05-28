#!/usr/bin/env ts-node

import * as dotenv from "dotenv";
import * as path from "path";
import { logger } from "../utils/logger";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });

type Check = {
  name: string;
  ok: boolean;
  message: string;
};

const checks: Check[] = [];

function addCheck(name: string, ok: boolean, message: string) {
  checks.push({ name, ok, message });
}

function hasValue(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

function value(key: string): string {
  return process.env[key]?.trim() || "";
}

function startsWith(key: string, prefix: string): boolean {
  return value(key).startsWith(prefix);
}

function isHttpsUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" && parsed.hostname !== "localhost";
  } catch {
    return false;
  }
}

function parseServiceAccount() {
  const raw = value("FIREBASE_SERVICE_ACCOUNT_KEY");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as {
      type?: string;
      project_id?: string;
      private_key?: string;
      client_email?: string;
    };
  } catch {
    return null;
  }
}

logger.header("Production Environment Check");

const firebasePublicKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

for (const key of firebasePublicKeys) {
  addCheck(key, hasValue(key), `${key} must be set for Firebase client auth.`);
}

const appUrl = value("NEXT_PUBLIC_APP_URL");
addCheck(
  "NEXT_PUBLIC_APP_URL",
  isHttpsUrl(appUrl),
  "NEXT_PUBLIC_APP_URL must be a production https URL, not localhost."
);

addCheck(
  "ALLOW_DEV_BYPASS_AUTH",
  value("ALLOW_DEV_BYPASS_AUTH") !== "true",
  "ALLOW_DEV_BYPASS_AUTH must not be true in production."
);

addCheck(
  "NEXT_PUBLIC_SKIP_AUTH",
  value("NEXT_PUBLIC_SKIP_AUTH") !== "true",
  "NEXT_PUBLIC_SKIP_AUTH is not used by current auth code, but must not be true in production env files."
);

const serviceAccount = parseServiceAccount();
addCheck(
  "FIREBASE_SERVICE_ACCOUNT_KEY",
  Boolean(
    serviceAccount &&
      serviceAccount.type === "service_account" &&
      serviceAccount.project_id &&
      serviceAccount.private_key?.includes("BEGIN PRIVATE KEY") &&
      serviceAccount.client_email
  ),
  "FIREBASE_SERVICE_ACCOUNT_KEY must be a valid service account JSON string."
);

if (serviceAccount?.project_id && hasValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID")) {
  addCheck(
    "Firebase project match",
    serviceAccount.project_id === value("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    "Service account project_id must match NEXT_PUBLIC_FIREBASE_PROJECT_ID."
  );
}

addCheck(
  "STRIPE_SECRET_KEY",
  startsWith("STRIPE_SECRET_KEY", "sk_live_"),
  "Production Stripe secret key must start with sk_live_."
);
addCheck(
  "STRIPE_WEBHOOK_SECRET",
  startsWith("STRIPE_WEBHOOK_SECRET", "whsec_"),
  "Stripe webhook secret must start with whsec_."
);
addCheck(
  "STRIPE_PRICE_ID_PREMIUM_MONTHLY",
  startsWith("STRIPE_PRICE_ID_PREMIUM_MONTHLY", "price_"),
  "Monthly Stripe price id must start with price_."
);
addCheck(
  "STRIPE_PRICE_ID_PREMIUM_YEARLY",
  startsWith("STRIPE_PRICE_ID_PREMIUM_YEARLY", "price_"),
  "Yearly Stripe price id must start with price_."
);

const hasAnyAIKey =
  hasValue("OPENAI_API_KEY") ||
  hasValue("ANTHROPIC_API_KEY") ||
  hasValue("GOOGLE_AI_API_KEY");
addCheck(
  "AI provider key",
  hasAnyAIKey,
  "At least one AI provider key must be configured for AI features."
);

if (hasValue("OPENAI_API_KEY")) {
  addCheck(
    "OPENAI_API_KEY",
    startsWith("OPENAI_API_KEY", "sk-"),
    "OpenAI key should start with sk-."
  );
}

// Sentry: 設定されていれば形式を検証。未設定は warn 相当（本番障害観測ゼロは将来的に直すべき）
const sentryDsn = value("NEXT_PUBLIC_SENTRY_DSN") || value("SENTRY_DSN");
if (sentryDsn) {
  addCheck(
    "SENTRY_DSN",
    /^https:\/\/[a-f0-9]+@/i.test(sentryDsn) && sentryDsn.includes(".ingest."),
    "SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN must be a valid Sentry DSN (https://<key>@<host>.ingest.sentry.io/<project>)."
  );
  if (hasValue("SENTRY_AUTH_TOKEN")) {
    addCheck(
      "SENTRY_AUTH_TOKEN",
      startsWith("SENTRY_AUTH_TOKEN", "sntrys_") ||
        startsWith("SENTRY_AUTH_TOKEN", "sntryu_"),
      "SENTRY_AUTH_TOKEN should start with sntrys_ (org) or sntryu_ (user)."
    );
  }
} else {
  logger.warn(
    "NEXT_PUBLIC_SENTRY_DSN が未設定です。本番障害が観測できません。",
    {
      recommendation:
        "https://sentry.io でプロジェクトを作成し DSN を投入してください。lib/error-reporter.ts が自動で forward します。",
    }
  );
}

const failures = checks.filter((check) => !check.ok);
const passes = checks.filter((check) => check.ok);

for (const check of passes) {
  logger.success(check.name);
}

for (const check of failures) {
  logger.error(check.name, undefined, { requirement: check.message });
}

logger.info("Summary", {
  passed: passes.length,
  failed: failures.length,
  sensitiveValuesPrinted: false,
});

if (failures.length > 0) {
  process.exit(1);
}
