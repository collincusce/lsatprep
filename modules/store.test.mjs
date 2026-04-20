import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Shim localStorage before importing the module.
globalThis.localStorage = (() => {
  const map = new Map();
  return {
    get length() { return map.size; },
    key: i => [...map.keys()][i],
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: k => { map.delete(k); },
    clear: () => map.clear()
  };
})();
globalThis.window = { addEventListener: () => {} };

const store = await import('./store.js');

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

test('load() returns default shape when empty', () => {
  const s = store.load();
  assert.equal(s.schemaVersion, 1);
  assert.deepEqual(s.attempts, []);
  assert.deepEqual(s.sessions, []);
  assert.deepEqual(s.writingSamples, []);
  assert.deepEqual(s.coachThreads, []);
  assert.equal(typeof s.preferences, 'object');
});

test('load() parses an existing blob', () => {
  localStorage.setItem('lsatprep:v1:state', JSON.stringify({
    schemaVersion: 1,
    bankVersion: '2026-04-19-placeholder',
    preferences: { lgEnabled: true, theme: 'dark', defaultSection: 'RC' },
    attempts: [{ id: 'a1', questionId: 'lr-0001', sessionId: 's1', chosenAnswer: 'B', correct: true, timeSpentMs: 1000, timestamp: '2026-04-19T00:00:00Z' }],
    sessions: [],
    writingSamples: [],
    coachThreads: []
  }));
  const s = store.load();
  assert.equal(s.attempts.length, 1);
  assert.equal(s.preferences.lgEnabled, true);
});

test('recordAttempt appends attempt', async () => {
  store.load();
  store.recordAttempt({ id: 'a1', questionId: 'lr-0001', sessionId: 's1', chosenAnswer: 'A', correct: false, timeSpentMs: 500, timestamp: '2026-04-19T00:00:00Z' });
  await new Promise(r => setTimeout(r, 250)); // let the debounced save flush
  const raw = JSON.parse(localStorage.getItem('lsatprep:v1:state'));
  assert.equal(raw.attempts.length, 1);
  assert.equal(raw.attempts[0].questionId, 'lr-0001');
});

test('recordSession appends session', async () => {
  store.load();
  store.recordSession({ id: 's1', mode: 'drill', startedAt: 't', finishedAt: 't', questionIds: ['lr-0001'], score: 1, elapsedMs: 1000 });
  await new Promise(r => setTimeout(r, 250));
  const raw = JSON.parse(localStorage.getItem('lsatprep:v1:state'));
  assert.equal(raw.sessions.length, 1);
});

test('mergeImport union-by-id deduplicates', async () => {
  store.load();
  store.recordAttempt({ id: 'a1', questionId: 'lr-0001', sessionId: 's1', chosenAnswer: 'A', correct: false, timeSpentMs: 1, timestamp: '2026-04-19T00:00:00Z' });
  await new Promise(r => setTimeout(r, 250));

  const imported = {
    schemaVersion: 1,
    bankVersion: '2026-04-19-placeholder',
    preferences: { lgEnabled: true, theme: 'auto', defaultSection: 'LR' },
    attempts: [
      { id: 'a1', questionId: 'lr-0001', sessionId: 's1', chosenAnswer: 'B', correct: true, timeSpentMs: 2, timestamp: '2026-04-19T01:00:00Z' }, // newer — should win
      { id: 'a2', questionId: 'lr-0002', sessionId: 's1', chosenAnswer: 'A', correct: true, timeSpentMs: 1, timestamp: '2026-04-19T00:00:00Z' }
    ],
    sessions: [],
    writingSamples: [],
    coachThreads: []
  };

  const report = store.mergeImport(imported);
  const s = store.snapshot();
  assert.equal(s.attempts.length, 2);
  assert.equal(s.attempts.find(a => a.id === 'a1').chosenAnswer, 'B');
  assert.equal(s.preferences.lgEnabled, true);
  assert.equal(report.attemptsAdded, 1);
  assert.equal(report.attemptsOverwritten, 1);
});

test('mergeImport drops attempts with unknown questionIds when bankVersion differs and knownIds provided', () => {
  store.load();
  const imported = {
    schemaVersion: 1,
    bankVersion: 'something-older',
    preferences: { lgEnabled: false, theme: 'auto', defaultSection: 'LR' },
    attempts: [
      { id: 'a1', questionId: 'lr-0001', sessionId: 's1', chosenAnswer: 'A', correct: false, timeSpentMs: 1, timestamp: 't' },
      { id: 'a2', questionId: 'lr-999999', sessionId: 's1', chosenAnswer: 'A', correct: false, timeSpentMs: 1, timestamp: 't' }
    ],
    sessions: [],
    writingSamples: [],
    coachThreads: []
  };
  const report = store.mergeImport(imported, { knownQuestionIds: new Set(['lr-0001']) });
  const s = store.snapshot();
  assert.equal(s.attempts.length, 1);
  assert.equal(report.attemptsDroppedStale, 1);
});

test('mergeImport rejects newer schemaVersion', () => {
  store.load();
  assert.throws(() => {
    store.mergeImport({ schemaVersion: 99, attempts: [], sessions: [], writingSamples: [], coachThreads: [], preferences: {} });
  }, /schemaVersion/);
});

test('export returns full state blob', async () => {
  store.load();
  store.recordAttempt({ id: 'a1', questionId: 'lr-0001', sessionId: 's1', chosenAnswer: 'A', correct: true, timeSpentMs: 1, timestamp: 't' });
  await new Promise(r => setTimeout(r, 250));
  const blob = store.exportState();
  assert.equal(blob.schemaVersion, 1);
  assert.equal(blob.attempts.length, 1);
});

test('clear resets to defaults', async () => {
  store.load();
  store.recordAttempt({ id: 'a1', questionId: 'lr-0001', sessionId: 's1', chosenAnswer: 'A', correct: true, timeSpentMs: 1, timestamp: 't' });
  await new Promise(r => setTimeout(r, 250));
  store.clear();
  const raw = localStorage.getItem('lsatprep:v1:state');
  const parsed = raw ? JSON.parse(raw) : null;
  assert.equal(parsed === null || parsed.attempts.length === 0, true);
});

test('seenQuestionIds returns unique set of attempted ids', async () => {
  store.load();
  store.recordAttempt({ id: 'a1', questionId: 'lr-0001', sessionId: 's1', chosenAnswer: 'A', correct: true, timeSpentMs: 1, timestamp: 't' });
  store.recordAttempt({ id: 'a2', questionId: 'lr-0001', sessionId: 's2', chosenAnswer: 'B', correct: false, timeSpentMs: 1, timestamp: 't' });
  store.recordAttempt({ id: 'a3', questionId: 'lr-0002', sessionId: 's2', chosenAnswer: 'A', correct: true, timeSpentMs: 1, timestamp: 't' });
  await new Promise(r => setTimeout(r, 250));
  const seen = store.seenQuestionIds();
  assert.equal(seen.size, 2);
  assert.ok(seen.has('lr-0001'));
  assert.ok(seen.has('lr-0002'));
});

test('subscribe is called on state change', () => {
  store.load();
  let called = 0;
  const unsub = store.subscribe(() => { called++; });
  store.recordAttempt({ id: 'a1', questionId: 'lr-0001', sessionId: 's1', chosenAnswer: 'A', correct: true, timeSpentMs: 1, timestamp: 't' });
  assert.ok(called >= 1);
  unsub();
});
