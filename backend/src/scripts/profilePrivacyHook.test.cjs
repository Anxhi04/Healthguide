const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Exercise the existing mobile save hook without React Native or Firebase.
const filename = path.resolve(__dirname, '../../..', 'mobile/HealthGuide/hooks/usePhoneVisibility.ts');
const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function setup(api, profileVisibility = true) {
  let state;
  let cleanup;
  const saved = [];
  const react = {
    useState: initial => { state = initial; return [state, next => { state = typeof next === 'function' ? next(state) : next; }]; },
    useRef: current => ({ current }),
    useEffect: effect => { cleanup = effect(); },
  };
  const module = { exports: {} };
  const requireMock = name => {
    if (name === 'react') return react;
    if (name === '@/services/userService') return api;
    if (name === '@/utils/commentPresentation') return { commentErrorMessage: (_cause, fallback) => fallback };
    throw Error(`Unexpected module: ${name}`);
  };
  new Function('require', 'module', 'exports', source)(requireMock, module, module.exports);
  const hook = module.exports.default('owner', value => saved.push(value), profileVisibility);
  return { hook, saved, getState: () => state, cleanup: () => cleanup() };
}

(async () => {
  for (const value of [true, false]) {
    const phone = setup({ setPhoneVisibility: async input => { assert.equal(input, value); return { showPhonePublicly: value }; } }, false);
    await phone.hook.save(value);
    assert.deepEqual(phone.saved, [value]); assert.equal(phone.getState().saved, true); assert.equal(phone.getState().busy, false);
  }
  const failedPhone = setup({ setPhoneVisibility: async () => { throw Error('Offline'); } }, false);
  await failedPhone.hook.save(true);
  assert.deepEqual(failedPhone.saved, []); assert.match(failedPhone.getState().error, /Could not save privacy settings/);
  const malformed = setup({ setPhoneVisibility: async () => ({}) }, false);
  await malformed.hook.save(true);
  assert.deepEqual(malformed.saved, []); assert.equal(malformed.getState().saved, false); assert.match(malformed.getState().error, /Could not save privacy settings/);
  let finish;
  let calls = 0;
  const pending = setup({ setProfileVisibility: value => { calls++; assert.equal(value, false); return new Promise(resolve => { finish = resolve; }); } });
  const saving = pending.hook.save(false);
  assert.equal(pending.getState().busy, true);
  assert.deepEqual(pending.saved, []);
  await pending.hook.save(false);
  assert.equal(calls, 1, 'Concurrent toggles must not issue duplicate writes');
  finish({ publicProfile: false });
  await saving;
  assert.deepEqual(pending.saved, [false]);
  assert.equal(pending.getState().busy, false);
  assert.equal(pending.getState().saved, true);

  const failed = setup({ setProfileVisibility: async () => { throw Error('Offline'); } });
  await failed.hook.save(false);
  assert.deepEqual(failed.saved, [], 'Failed saves must preserve the previous visibility');
  assert.equal(failed.getState().busy, false);
  assert.match(failed.getState().error, /Could not save privacy settings/);

  let finishStale;
  const stale = setup({ setProfileVisibility: () => new Promise(resolve => { finishStale = resolve; }) });
  const staleSave = stale.hook.save(true);
  stale.cleanup();
  finishStale({ publicProfile: true });
  await staleSave;
  assert.deepEqual(stale.saved, [], 'Unmounted account sessions must ignore late responses');
  console.log('Profile privacy mobile hook checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
