import assert from "node:assert/strict";

import { APIError, APIErrorType } from "../../lib/api-error-handler";
import { classifyError, withAIFallback } from "../../lib/ai-fallback";
import {
  ExternalReporter,
  registerExternalReporter,
} from "../../lib/error-reporter";

interface RecordedException {
  error: Error;
  context: unknown;
}

function makeRecordingReporter() {
  const exceptions: RecordedException[] = [];
  const reporter: ExternalReporter = {
    captureException: (error, context) => exceptions.push({ error, context }),
    captureMessage: () => {},
    setUser: () => {},
  };
  return { reporter, exceptions };
}

function silenceConsole<T>(fn: () => T): T {
  const origError = console.error;
  const origWarn = console.warn;
  const origInfo = console.info;
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  try {
    return fn();
  } finally {
    console.error = origError;
    console.warn = origWarn;
    console.info = origInfo;
  }
}

async function main() {
  // 1. classifyError: APIError 各種別が正しく reason にマップされる
  {
    assert.equal(
      classifyError(new APIError("limit", APIErrorType.AI_USAGE_LIMIT, 402)),
      "rate_limit",
    );
    assert.equal(
      classifyError(new APIError("net", APIErrorType.NETWORK)),
      "network",
    );
    assert.equal(
      classifyError(new APIError("tm", APIErrorType.TIMEOUT, 408)),
      "timeout",
    );
    assert.equal(
      classifyError(new APIError("au", APIErrorType.AUTHENTICATION, 401)),
      "auth",
    );
    assert.equal(
      classifyError(new APIError("az", APIErrorType.AUTHORIZATION, 403)),
      "auth",
    );
    assert.equal(
      classifyError(new APIError("sv", APIErrorType.SERVER, 502)),
      "server",
    );
    assert.equal(
      classifyError(new APIError("vd", APIErrorType.VALIDATION, 400)),
      "unknown",
    );
    assert.equal(
      classifyError(new APIError("un", APIErrorType.UNKNOWN, 0)),
      "unknown",
    );
  }

  // 2. classifyError: 通常 Error はメッセージから推定
  {
    assert.equal(classifyError(new Error("fetch failed")), "network");
    assert.equal(classifyError(new Error("Request timeout")), "timeout");
    assert.equal(classifyError(new Error("認証が必要です")), "auth");
    assert.equal(classifyError(new Error("unauthorized")), "auth");
    assert.equal(classifyError(new Error("何か変なエラー")), "unknown");
  }

  // 3. withAIFallback: 成功時は value を返し reporter を呼ばない
  {
    const { reporter, exceptions } = makeRecordingReporter();
    registerExternalReporter(reporter);
    const result = await withAIFallback(async () => "ai response");
    assert.equal(result.success, true);
    assert.equal(result.value, "ai response");
    assert.equal(result.retryable, false);
    assert.equal(exceptions.length, 0);
    registerExternalReporter(null);
  }

  // 4. withAIFallback: 失敗時に reason / userMessage / fallback を返す
  {
    const { reporter, exceptions } = makeRecordingReporter();
    registerExternalReporter(reporter);
    const result = await silenceConsole(() =>
      withAIFallback(
        async () => {
          throw new APIError("Server 500", APIErrorType.SERVER, 502);
        },
        { fallback: "static explanation", tags: { route: "/practice" } },
      ),
    );
    assert.equal(result.success, false);
    assert.equal(result.reason, "server");
    assert.equal(result.fallback, "static explanation");
    assert.equal(result.retryable, true);
    assert.ok(result.userMessage && result.userMessage.length > 0);
    assert.equal(exceptions.length, 1);
    assert.equal(exceptions[0].error.message, "Server 500");
    // tags が forward されている
    const ctx = exceptions[0].context as {
      tags?: Record<string, string>;
      severity?: string;
    };
    assert.equal(ctx?.tags?.route, "/practice");
    assert.equal(ctx?.tags?.ai_fallback, "true");
    assert.equal(ctx?.tags?.reason, "server");
    assert.equal(ctx?.severity, "error");
    registerExternalReporter(null);
  }

  // 5. withAIFallback: rate_limit は severity=warning
  {
    const { reporter, exceptions } = makeRecordingReporter();
    registerExternalReporter(reporter);
    await silenceConsole(() =>
      withAIFallback(async () => {
        throw new APIError("limit", APIErrorType.AI_USAGE_LIMIT, 402);
      }),
    );
    const ctx = exceptions[0].context as { severity?: string };
    assert.equal(ctx?.severity, "warning", "rate_limit は warning");
    registerExternalReporter(null);
  }

  // 6. withAIFallback: retryable フラグの正確性
  {
    const reasonRetryable: Array<[APIErrorType, boolean]> = [
      [APIErrorType.NETWORK, true],
      [APIErrorType.TIMEOUT, true],
      [APIErrorType.SERVER, true],
      [APIErrorType.AI_USAGE_LIMIT, false],
      [APIErrorType.AUTHENTICATION, false],
      [APIErrorType.AUTHORIZATION, false],
      [APIErrorType.VALIDATION, false],
    ];
    for (const [type, expected] of reasonRetryable) {
      const result = await silenceConsole(() =>
        withAIFallback(async () => {
          throw new APIError("err", type);
        }),
      );
      assert.equal(
        result.retryable,
        expected,
        `${type} の retryable は ${expected} であるべき`,
      );
    }
  }

  // 7. withAIFallback: fallback 未指定でも success=false で返る
  {
    const { reporter } = makeRecordingReporter();
    registerExternalReporter(reporter);
    const result = await silenceConsole(() =>
      withAIFallback(async () => {
        throw new APIError("net", APIErrorType.NETWORK);
      }),
    );
    assert.equal(result.success, false);
    assert.equal(result.fallback, undefined);
    assert.equal(result.reason, "network");
    registerExternalReporter(null);
  }

  // 8. withAIFallback: 非 Error も Error にラップして処理される
  {
    const { reporter, exceptions } = makeRecordingReporter();
    registerExternalReporter(reporter);
    const result = await silenceConsole(() =>
      withAIFallback(async () => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "string error";
      }),
    );
    assert.equal(result.success, false);
    assert.ok(exceptions[0].error instanceof Error);
    assert.equal(exceptions[0].error.message, "string error");
    registerExternalReporter(null);
  }

  console.log("ai-fallback checks passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
