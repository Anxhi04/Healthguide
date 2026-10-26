const { test } = require("node:test");
const assert = require("node:assert/strict");
require("ts-node/register/transpile-only");
const { assertFirebaseClock, verifyFirebaseClock } = require("../utils/firebaseClock");

test("accepts small clock differences and rejects skew in either direction", () => {
  const now = Date.now();
  assert.doesNotThrow(() => assertFirebaseClock(now, now + 60000));
  for (const offset of [-3520000, 3520000]) {
    assert.throws(() => assertFirebaseClock(now, now + offset), {
      code: "FIREBASE_CLOCK_SKEW",
    });
  }
});

test("checks Google's Date header and propagates network failures", async (t) => {
  const original = global.fetch;
  t.after(() => { global.fetch = original; });
  global.fetch = async () => new Response(null, {
    headers: { date: new Date(Date.now() + 3520000).toUTCString() },
  });
  await assert.rejects(verifyFirebaseClock(), { code: "FIREBASE_CLOCK_SKEW" });
  global.fetch = async () => new Response(null, { headers: { date: new Date().toUTCString() } });
  await assert.doesNotReject(verifyFirebaseClock());
  global.fetch = async () => new Response(null, { status: 404, headers: { date: new Date().toUTCString() } });
  await assert.doesNotReject(verifyFirebaseClock());
  global.fetch = async () => new Response(null, {
    headers: { date: new Date(Date.now() - 3600000).toUTCString(), age: "3600" },
  });
  await assert.doesNotReject(verifyFirebaseClock());
  let attempts = 0;
  global.fetch = async () => {
    if (++attempts === 1) throw new Error("First endpoint unavailable");
    return new Response(null, { status: 405, headers: { date: new Date().toUTCString() } });
  };
  await assert.doesNotReject(verifyFirebaseClock());
  assert.equal(attempts, 2);
  global.fetch = async () => { throw new Error("Network unavailable"); };
  await assert.rejects(verifyFirebaseClock(), /Network unavailable/);
  global.fetch = async () => new Response(null);
  await assert.rejects(verifyFirebaseClock(), /valid server Date header/);
});
