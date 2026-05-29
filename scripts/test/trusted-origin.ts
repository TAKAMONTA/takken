import assert from "node:assert/strict";

import { resolveTrustedOrigin } from "../../lib/trusted-origin";

// ---- 本番モード: NEXT_PUBLIC_APP_URL と完全一致のみ ----
{
  const env = {
    NEXT_PUBLIC_APP_URL: "https://takken-study.com",
    NODE_ENV: "production",
  };

  assert.equal(
    resolveTrustedOrigin("https://takken-study.com", env),
    "https://takken-study.com",
  );

  assert.equal(
    resolveTrustedOrigin("https://attacker.example.com", env),
    "https://takken-study.com",
    "本番では攻撃者 origin を拒否",
  );

  assert.equal(
    resolveTrustedOrigin("http://localhost:3000", env),
    "https://takken-study.com",
    "本番では localhost も拒否",
  );

  assert.equal(
    resolveTrustedOrigin("not a url", env),
    "https://takken-study.com",
  );

  assert.equal(resolveTrustedOrigin(null, env), "https://takken-study.com");
  assert.equal(resolveTrustedOrigin(undefined, env), "https://takken-study.com");
  assert.equal(resolveTrustedOrigin("", env), "https://takken-study.com");
}

// ---- 非本番モード: localhost も許可 ----
{
  const env = {
    NEXT_PUBLIC_APP_URL: "https://takken-study.com",
    NODE_ENV: "development",
  };

  assert.equal(
    resolveTrustedOrigin("http://localhost:3000", env),
    "http://localhost:3000",
    "dev では localhost を許可",
  );

  assert.equal(
    resolveTrustedOrigin("http://localhost:5173", env),
    "http://localhost:5173",
    "任意ポートの localhost も許可",
  );

  assert.equal(
    resolveTrustedOrigin("http://127.0.0.1:3000", env),
    "http://127.0.0.1:3000",
  );

  assert.equal(
    resolveTrustedOrigin("https://evil.example.com", env),
    "https://takken-study.com",
  );

  assert.equal(
    resolveTrustedOrigin("https://takken-study.com", env),
    "https://takken-study.com",
  );
}

// ---- NEXT_PUBLIC_APP_URL 未設定 ----
{
  const env = { NODE_ENV: "production" };

  assert.equal(
    resolveTrustedOrigin("https://takken-study.com", env),
    "https://takken-study.com",
    "未設定時はデフォルトの takken-study.com にフォールバック",
  );

  assert.equal(
    resolveTrustedOrigin("https://attacker.example.com", env),
    "https://takken-study.com",
  );
}

// ---- 攻撃シナリオの実例: Stripe フィッシング ----
{
  const env = {
    NEXT_PUBLIC_APP_URL: "https://takken-study.com",
    NODE_ENV: "production",
  };

  const result = resolveTrustedOrigin("https://phishing-takken.com", env);
  assert.equal(result, "https://takken-study.com");
  // success_url が `${result}/subscription/success?...` になるので
  // 攻撃者ドメインに session_id を漏らさない
}

console.log("trusted-origin checks passed");
