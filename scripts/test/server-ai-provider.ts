import assert from "node:assert/strict";

import {
  SAFE_AI_INPUT_LIMITS,
  sanitizeChatMessages,
  sanitizeClientAIOptions,
} from "../../lib/server-ai-provider";

// ---------------- sanitizeClientAIOptions ----------------

// 1. null / undefined / 非オブジェクトは空オブジェクトに
assert.deepEqual(sanitizeClientAIOptions(null), {});
assert.deepEqual(sanitizeClientAIOptions(undefined), {});
assert.deepEqual(sanitizeClientAIOptions("string"), {});
assert.deepEqual(sanitizeClientAIOptions(42), {});

// 2. provider / model / maxTokens は黙って drop（コスト爆発攻撃の塞ぎ込み）
{
  const result = sanitizeClientAIOptions({
    provider: "OpenAI",
    model: "gpt-4o",
    maxTokens: 128000,
  });
  assert.deepEqual(result, {}, "model/provider/maxTokens は dropped");
}

// 3. temperature は正常範囲内なら通る
{
  assert.deepEqual(sanitizeClientAIOptions({ temperature: 0.5 }), { temperature: 0.5 });
  assert.deepEqual(sanitizeClientAIOptions({ temperature: 0 }), { temperature: 0 });
  assert.deepEqual(sanitizeClientAIOptions({ temperature: 1 }), { temperature: 1 });
}

// 4. temperature は範囲外ならクランプ
{
  assert.deepEqual(sanitizeClientAIOptions({ temperature: -0.5 }), {
    temperature: SAFE_AI_INPUT_LIMITS.minTemperature,
  });
  assert.deepEqual(sanitizeClientAIOptions({ temperature: 10 }), {
    temperature: SAFE_AI_INPUT_LIMITS.maxTemperature,
  });
}

// 5. temperature が NaN / Infinity / 非数値なら無視
{
  assert.deepEqual(sanitizeClientAIOptions({ temperature: NaN }), {});
  assert.deepEqual(sanitizeClientAIOptions({ temperature: Infinity }), {});
  assert.deepEqual(sanitizeClientAIOptions({ temperature: "0.5" }), {});
  assert.deepEqual(sanitizeClientAIOptions({ temperature: null }), {});
}

// 6. 余分なフィールドは無視（temperature 以外無視）
{
  const result = sanitizeClientAIOptions({
    temperature: 0.3,
    model: "gpt-4o",
    maxTokens: 100000,
    foo: "bar",
  });
  assert.deepEqual(result, { temperature: 0.3 });
}

// ---------------- sanitizeChatMessages ----------------

// 7. 非配列は空配列に
assert.deepEqual(sanitizeChatMessages(null), []);
assert.deepEqual(sanitizeChatMessages("string"), []);
assert.deepEqual(sanitizeChatMessages({}), []);

// 8. 不正な shape は除外
{
  const result = sanitizeChatMessages([
    { role: "user", content: "ok" },
    { role: "bogus", content: "bad role" },
    { role: "user" }, // content 無し
    { content: "no role" }, // role 無し
    null,
    "string",
    { role: "user", content: 123 }, // content が数値
  ]);
  assert.deepEqual(result, [{ role: "user", content: "ok" }]);
}

// 9. content は maxContentChars に切り詰め
{
  const long = "x".repeat(SAFE_AI_INPUT_LIMITS.maxContentChars + 100);
  const result = sanitizeChatMessages([{ role: "user", content: long }]);
  assert.equal(result.length, 1);
  assert.equal(
    result[0].content.length,
    SAFE_AI_INPUT_LIMITS.maxContentChars,
    "長すぎる content は切り詰められる",
  );
}

// 10. メッセージ数は maxMessages に切り詰め
{
  const many = Array.from({ length: SAFE_AI_INPUT_LIMITS.maxMessages + 5 }, (_, i) => ({
    role: "user",
    content: `msg ${i}`,
  }));
  const result = sanitizeChatMessages(many);
  assert.equal(result.length, SAFE_AI_INPUT_LIMITS.maxMessages);
  assert.equal(result[0].content, "msg 0");
  assert.equal(
    result[result.length - 1].content,
    `msg ${SAFE_AI_INPUT_LIMITS.maxMessages - 1}`,
  );
}

// 11. system / user / assistant のいずれの role も通る
{
  const result = sanitizeChatMessages([
    { role: "system", content: "sys" },
    { role: "user", content: "u" },
    { role: "assistant", content: "a" },
  ]);
  assert.deepEqual(
    result.map((m) => m.role),
    ["system", "user", "assistant"],
  );
}

// 12. 攻撃シナリオ全体 — 巨大な maxTokens + 巨大 content + 大量メッセージ
{
  const attackBody = {
    messages: Array.from({ length: 100 }, () => ({
      role: "user",
      content: "x".repeat(10000),
    })),
    options: {
      provider: "OpenAI",
      model: "gpt-4o",
      maxTokens: 128000,
      temperature: 5,
    },
  };
  const safeMessages = sanitizeChatMessages(attackBody.messages);
  const safeOptions = sanitizeClientAIOptions(attackBody.options);
  assert.equal(safeMessages.length, SAFE_AI_INPUT_LIMITS.maxMessages);
  assert.ok(
    safeMessages.every((m) => m.content.length <= SAFE_AI_INPUT_LIMITS.maxContentChars),
  );
  assert.deepEqual(safeOptions, {
    temperature: SAFE_AI_INPUT_LIMITS.maxTemperature,
  });
}

console.log("server-ai-provider sanitization checks passed");
