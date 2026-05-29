import assert from "node:assert/strict";

import {
  AppConfig,
  checkAppVersion,
  compareVersions,
  fetchAppConfig,
  isForceUpdateRequired,
  parseVersion,
} from "../../lib/version-check";

/**
 * minimal fetch mock — Response 風オブジェクトを返す。
 */
function mockFetch(
  ok: boolean,
  body?: unknown,
  capture?: { lastUrl?: string; lastInit?: RequestInit },
): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    if (capture) {
      capture.lastUrl = typeof input === "string" ? input : String(input);
      capture.lastInit = init;
    }
    return {
      ok,
      json: async () => body,
    } as Response;
  }) as typeof fetch;
}

async function main() {
  // ---- parseVersion ----
  assert.deepEqual(parseVersion("1.4.0"), [1, 4, 0]);
  assert.deepEqual(parseVersion("1.4"), [1, 4, 0], "1.4 は 1.4.0 として扱う");
  assert.deepEqual(parseVersion("2"), [2, 0, 0]);
  assert.deepEqual(parseVersion("1.4.0-beta"), [1, 4, 0], "prerelease 無視");
  assert.deepEqual(parseVersion("10.20.30"), [10, 20, 30]);
  assert.equal(parseVersion(""), null);
  assert.equal(parseVersion("not.a.version"), null);
  assert.equal(parseVersion("1.x.0"), null);

  // ---- compareVersions ----
  assert.equal(compareVersions("1.4.0", "1.4.0"), 0);
  assert.equal(compareVersions("1.4.0", "1.4.1"), -1);
  assert.equal(compareVersions("1.5.0", "1.4.9"), 1);
  assert.equal(compareVersions("2.0.0", "1.99.99"), 1);
  assert.equal(compareVersions("1.4", "1.4.0"), 0, "1.4 == 1.4.0");
  assert.equal(compareVersions("invalid", "1.4.0"), 0, "parse fail は 0");
  assert.equal(compareVersions("1.4.0", "invalid"), 0);

  // ---- isForceUpdateRequired ----
  assert.equal(isForceUpdateRequired("1.4.0", "1.5.0"), true);
  assert.equal(isForceUpdateRequired("1.5.0", "1.4.0"), false);
  assert.equal(isForceUpdateRequired("1.4.0", "1.4.0"), false);
  assert.equal(isForceUpdateRequired(undefined, "1.4.0"), false, "current 無しは保守的に false");
  assert.equal(isForceUpdateRequired("1.4.0", undefined), false, "minimum 無しは保守的に false");
  assert.equal(isForceUpdateRequired("", ""), false);

  // ---- fetchAppConfig: 成功 ----
  {
    const capture: { lastUrl?: string; lastInit?: RequestInit } = {};
    const config: AppConfig = {
      minVersion: { ios: "1.4.0", web: "1.3.0" },
      forceUpdate: false,
    };
    const result = await fetchAppConfig("https://example.com", mockFetch(true, config, capture));
    assert.deepEqual(result, config);
    assert.equal(capture.lastUrl, "https://example.com/app-config.json");
    assert.deepEqual(capture.lastInit?.cache, "no-store", "cache: no-store でリモートの最新を取得");
  }

  // ---- fetchAppConfig: HTTP 失敗は null ----
  {
    const result = await fetchAppConfig("https://example.com", mockFetch(false, {}));
    assert.equal(result, null);
  }

  // ---- fetchAppConfig: 例外も null（安全側） ----
  {
    const throwingFetch: typeof fetch = (async () => {
      throw new Error("network down");
    }) as typeof fetch;
    const result = await fetchAppConfig("https://example.com", throwingFetch);
    assert.equal(result, null);
  }

  // ---- fetchAppConfig: baseUrl 空なら null ----
  {
    const result = await fetchAppConfig("", mockFetch(true, {}));
    assert.equal(result, null);
  }

  // ---- checkAppVersion: config 取得失敗時は forceUpdate=false ----
  {
    const result = await checkAppVersion({
      baseUrl: "https://example.com",
      fetchFn: mockFetch(false, {}),
      platform: "ios",
      current: "1.4.0",
    });
    assert.equal(result.forceUpdate, false, "config 取得失敗は安全側");
    assert.equal(result.current, "1.4.0");
    assert.equal(result.platform, "ios");
  }

  // ---- checkAppVersion: バージョン不足で forceUpdate=true ----
  {
    const result = await checkAppVersion({
      baseUrl: "https://example.com",
      fetchFn: mockFetch(true, {
        minVersion: { ios: "1.5.0", web: "1.3.0" },
      }),
      platform: "ios",
      current: "1.4.0",
    });
    assert.equal(result.forceUpdate, true);
    assert.equal(result.minimum, "1.5.0");
    assert.equal(result.platform, "ios");
    assert.ok(result.message && result.message.length > 0, "デフォルトメッセージが入る");
  }

  // ---- checkAppVersion: web プラットフォームは web の minVersion を見る ----
  {
    const result = await checkAppVersion({
      baseUrl: "https://example.com",
      fetchFn: mockFetch(true, {
        minVersion: { ios: "1.5.0", web: "1.5.0" },
      }),
      platform: "web",
      current: "1.4.0",
    });
    assert.equal(result.forceUpdate, true);
    assert.equal(result.minimum, "1.5.0");
    assert.equal(result.platform, "web");
  }

  // ---- checkAppVersion: バージョン十分なら forceUpdate=false ----
  {
    const result = await checkAppVersion({
      baseUrl: "https://example.com",
      fetchFn: mockFetch(true, {
        minVersion: { ios: "1.4.0", web: "1.4.0" },
      }),
      platform: "ios",
      current: "1.5.0",
    });
    assert.equal(result.forceUpdate, false);
  }

  // ---- checkAppVersion: forceUpdate=true なら version 比較なしで強制 ----
  {
    const result = await checkAppVersion({
      baseUrl: "https://example.com",
      fetchFn: mockFetch(true, {
        forceUpdate: true,
        message: "メンテナンス中です",
      }),
      platform: "ios",
      current: "999.999.999",
    });
    assert.equal(result.forceUpdate, true);
    assert.equal(result.message, "メンテナンス中です");
  }

  // ---- checkAppVersion: storeUrl のオーバーライド ----
  {
    const result = await checkAppVersion({
      baseUrl: "https://example.com",
      fetchFn: mockFetch(true, {
        minVersion: { ios: "1.5.0" },
        storeUrl: { ios: "https://apps.apple.com/jp/app/customid" },
      }),
      platform: "ios",
      current: "1.4.0",
    });
    assert.equal(result.storeUrl, "https://apps.apple.com/jp/app/customid");
  }

  // ---- checkAppVersion: current 未設定なら forceUpdate=false（保守的） ----
  {
    const result = await checkAppVersion({
      baseUrl: "https://example.com",
      fetchFn: mockFetch(true, {
        minVersion: { ios: "1.5.0" },
      }),
      platform: "ios",
      current: undefined,
    });
    assert.equal(result.forceUpdate, false, "current 未設定は skip 扱い");
  }

  console.log("version-check checks passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
