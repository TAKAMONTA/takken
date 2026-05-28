import assert from "node:assert/strict";

import {
  ExternalReporter,
  getExternalReporter,
  registerExternalReporter,
  reportError,
  reportMessage,
  setReportUser,
} from "../../lib/error-reporter";

interface RecordedException {
  error: Error;
  context: unknown;
}

interface RecordedMessage {
  message: string;
  context: unknown;
}

function makeRecordingReporter() {
  const exceptions: RecordedException[] = [];
  const messages: RecordedMessage[] = [];
  let lastUser: { id: string } | null = null;
  const reporter: ExternalReporter = {
    captureException: (error, context) => exceptions.push({ error, context }),
    captureMessage: (message, context) => messages.push({ message, context }),
    setUser: (user) => {
      lastUser = user;
    },
  };
  return { reporter, exceptions, messages, get user() { return lastUser; } };
}

function withSilencedConsole<T>(fn: () => T): T {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  try {
    return fn();
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
    console.info = originalInfo;
  }
}

// 1. reporter 未登録でも例外を投げない
{
  registerExternalReporter(null);
  withSilencedConsole(() => {
    reportError(new Error("no reporter"));
    reportMessage("no reporter message");
    setReportUser("u1");
    setReportUser(null);
  });
  assert.equal(getExternalReporter(), null);
}

// 2. reporter 登録時に exception が forward される
{
  const rec = makeRecordingReporter();
  registerExternalReporter(rec.reporter);
  withSilencedConsole(() => {
    const err = new Error("boom");
    reportError(err, { tags: { route: "/api/x" }, userId: "u123" });
  });
  assert.equal(rec.exceptions.length, 1);
  assert.equal(rec.exceptions[0].error.message, "boom");
  assert.deepEqual(rec.exceptions[0].context, {
    tags: { route: "/api/x" },
    userId: "u123",
  });
}

// 3. 非 Error 値も Error にラップされて forward される
{
  const rec = makeRecordingReporter();
  registerExternalReporter(rec.reporter);
  withSilencedConsole(() => {
    reportError("string error");
  });
  assert.equal(rec.exceptions.length, 1);
  assert.ok(rec.exceptions[0].error instanceof Error);
  assert.equal(rec.exceptions[0].error.message, "string error");
}

// 4. reportMessage は severity に応じた logger を選び reporter にも forward
{
  const rec = makeRecordingReporter();
  registerExternalReporter(rec.reporter);
  withSilencedConsole(() => {
    reportMessage("warn msg", { severity: "warning", tags: { area: "auth" } });
  });
  assert.equal(rec.messages.length, 1);
  assert.equal(rec.messages[0].message, "warn msg");
  assert.deepEqual(rec.messages[0].context, {
    severity: "warning",
    tags: { area: "auth" },
  });
}

// 5. setReportUser が伝播。null でログアウト相当
{
  const rec = makeRecordingReporter();
  registerExternalReporter(rec.reporter);
  withSilencedConsole(() => {
    setReportUser("user-42");
    assert.deepEqual(rec.user, { id: "user-42" });
    setReportUser(null);
    assert.equal(rec.user, null);
  });
}

// 6. reporter が throw しても本流を止めない
{
  const broken: ExternalReporter = {
    captureException: () => {
      throw new Error("reporter died");
    },
    captureMessage: () => {
      throw new Error("reporter died");
    },
    setUser: () => {
      throw new Error("reporter died");
    },
  };
  registerExternalReporter(broken);
  withSilencedConsole(() => {
    // 例外を投げないことを確認
    reportError(new Error("safe"));
    reportMessage("safe");
    setReportUser("u");
  });
}

// クリーンアップ
registerExternalReporter(null);

console.log("error-reporter checks passed");
