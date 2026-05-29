import assert from "node:assert/strict";

import {
  IdempotencyMetadata,
  IdempotencyStore,
  withStripeIdempotency,
} from "../../lib/stripe-webhook-idempotency";

/**
 * テスト用 in-memory store。
 * 本物の Firestore は claim が transaction で原子的に行われるが、
 * このモックはシリアル動作のため atomicity を信じる前提で十分。
 */
class InMemoryStore implements IdempotencyStore {
  events = new Map<string, { metadata: IdempotencyMetadata; status: string }>();
  claimCalls = 0;
  markCompletedCalls = 0;
  releaseCalls = 0;
  releaseShouldThrow = false;

  async claim(eventId: string, metadata: IdempotencyMetadata): Promise<boolean> {
    this.claimCalls++;
    if (this.events.has(eventId)) return false;
    this.events.set(eventId, { metadata, status: "processing" });
    return true;
  }

  async markCompleted(eventId: string): Promise<void> {
    this.markCompletedCalls++;
    const entry = this.events.get(eventId);
    if (entry) entry.status = "completed";
  }

  async release(eventId: string): Promise<void> {
    this.releaseCalls++;
    if (this.releaseShouldThrow) {
      throw new Error("release failed");
    }
    this.events.delete(eventId);
  }
}

async function main() {
  // 1. 初回呼び出しは processed、handler の戻り値が伝播
  {
    const store = new InMemoryStore();
    let handlerRan = false;
    const result = await withStripeIdempotency(
      store,
      "evt_1",
      { type: "checkout.session.completed" },
      async () => {
        handlerRan = true;
        return "ok";
      },
    );
    assert.equal(result.result, "processed");
    assert.equal(result.value, "ok");
    assert.equal(handlerRan, true);
    assert.equal(store.events.get("evt_1")?.status, "completed");
    assert.equal(store.claimCalls, 1);
    assert.equal(store.markCompletedCalls, 1);
    assert.equal(store.releaseCalls, 0);
  }

  // 2. 同じ event ID で 2 回目は skipped、handler は走らない
  {
    const store = new InMemoryStore();
    await withStripeIdempotency(
      store,
      "evt_2",
      { type: "customer.subscription.updated" },
      async () => "first",
    );
    let secondHandlerRan = false;
    const second = await withStripeIdempotency(
      store,
      "evt_2",
      { type: "customer.subscription.updated" },
      async () => {
        secondHandlerRan = true;
        return "second";
      },
    );
    assert.equal(second.result, "skipped");
    assert.equal(second.value, undefined);
    assert.equal(secondHandlerRan, false);
    assert.equal(store.claimCalls, 2);
    assert.equal(store.markCompletedCalls, 1, "completed は初回のみ");
  }

  // 3. handler が throw すると release が呼ばれ、再処理可能になる
  {
    const store = new InMemoryStore();
    let firstHandlerRan = 0;
    let thrown: Error | null = null;
    try {
      await withStripeIdempotency(
        store,
        "evt_3",
        { type: "customer.subscription.deleted" },
        async () => {
          firstHandlerRan++;
          throw new Error("downstream failure");
        },
      );
    } catch (err) {
      thrown = err instanceof Error ? err : new Error(String(err));
    }
    assert.equal(thrown?.message, "downstream failure");
    assert.equal(firstHandlerRan, 1);
    assert.equal(store.releaseCalls, 1, "失敗時に release で claim を解放");
    assert.equal(store.events.has("evt_3"), false, "release で event 記録が消える");

    // Stripe が再送 → 同じ event_id で再処理可能
    let secondHandlerRan = false;
    const retry = await withStripeIdempotency(
      store,
      "evt_3",
      { type: "customer.subscription.deleted" },
      async () => {
        secondHandlerRan = true;
        return "success-on-retry";
      },
    );
    assert.equal(retry.result, "processed");
    assert.equal(retry.value, "success-on-retry");
    assert.equal(secondHandlerRan, true);
  }

  // 4. handler 内で throw + release 自体も throw する場合、handler の例外を優先
  {
    const store = new InMemoryStore();
    store.releaseShouldThrow = true;
    let thrown: Error | null = null;
    try {
      await withStripeIdempotency(
        store,
        "evt_4",
        { type: "checkout.session.completed" },
        async () => {
          throw new Error("handler error");
        },
      );
    } catch (err) {
      thrown = err instanceof Error ? err : new Error(String(err));
    }
    assert.equal(thrown?.message, "handler error", "release の失敗で元エラーが上書きされない");
    assert.equal(store.releaseCalls, 1);
  }

  // 5. metadata が claim に渡される（記録の検証）
  {
    const store = new InMemoryStore();
    await withStripeIdempotency(
      store,
      "evt_5",
      { type: "checkout.session.completed" },
      async () => "ok",
    );
    const entry = store.events.get("evt_5");
    assert.deepEqual(entry?.metadata, { type: "checkout.session.completed" });
    assert.equal(entry?.status, "completed");
  }

  // 6. 異なる event ID は独立して処理できる
  {
    const store = new InMemoryStore();
    const a = await withStripeIdempotency(
      store,
      "evt_6a",
      { type: "checkout.session.completed" },
      async () => "a",
    );
    const b = await withStripeIdempotency(
      store,
      "evt_6b",
      { type: "checkout.session.completed" },
      async () => "b",
    );
    assert.equal(a.result, "processed");
    assert.equal(b.result, "processed");
    assert.equal(a.value, "a");
    assert.equal(b.value, "b");
    assert.equal(store.markCompletedCalls, 2);
  }

  // 7. 同じ event が 5 回届いても handler は1回しか走らない
  {
    const store = new InMemoryStore();
    let runCount = 0;
    for (let i = 0; i < 5; i++) {
      await withStripeIdempotency(
        store,
        "evt_7",
        { type: "customer.subscription.updated" },
        async () => {
          runCount++;
          return runCount;
        },
      );
    }
    assert.equal(runCount, 1, "5回 webhook が届いても handler は1回のみ");
    assert.equal(store.claimCalls, 5);
    assert.equal(store.markCompletedCalls, 1);
  }

  console.log("stripe-webhook-idempotency checks passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
