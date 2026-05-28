import assert from "node:assert/strict";
import { __private__ } from "../../lib/firestore-service";

async function run() {
  const fakeDb = { type: "fake-firestore" };

  const resolved = await __private__.resolveFirestoreDb(async () => ({
    fallback: false,
    db: fakeDb,
  }));

  assert.equal(resolved, fakeDb, "uses Firestore db returned by async Firebase initialization");

  const fallbackResolved = await __private__.resolveFirestoreDb(async () => ({
    fallback: true,
    db: fakeDb,
  }));

  assert.equal(fallbackResolved, null, "does not use db when Firebase is in fallback mode");

  const missingResolved = await __private__.resolveFirestoreDb(async () => ({
    fallback: false,
    db: null,
  }));

  assert.equal(missingResolved, null, "returns null when initialization has no db");
}

run()
  .then(() => {
    console.log("firestore db resolver checks passed");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
