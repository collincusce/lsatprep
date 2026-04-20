import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const fixture = JSON.parse(readFileSync(new URL('../questions.json', import.meta.url)));
let fetchCalls = 0;
globalThis.fetch = async (url) => {
  fetchCalls++;
  return { ok: true, json: async () => fixture };
};

const bank = await import('./bank.js');

beforeEach(() => {
  bank.__resetForTests();
  fetchCalls = 0;
});

test('loadBank returns indexed views', async () => {
  const b = await bank.loadBank();
  assert.ok(b.byId);
  assert.ok(b.bySection);
  assert.equal(b.bySection.LR.length, fixture.lr.length);
  assert.ok(b.byId.get('lr-0001'));
});

test('loadBank memoizes subsequent calls', async () => {
  await bank.loadBank();
  await bank.loadBank();
  await bank.loadBank();
  assert.equal(fetchCalls, 1);
});

test('byDifficulty groups per-section', async () => {
  const b = await bank.loadBank();
  const lrD1 = b.byDifficulty.LR[1] || [];
  const lrD2 = b.byDifficulty.LR[2] || [];
  assert.equal(lrD1.length + lrD2.length, fixture.lr.length);
});

test('allQuestions flattens LR + RC + LG', async () => {
  const b = await bank.loadBank();
  const totalRC = fixture.rc.reduce((a, p) => a + p.questions.length, 0);
  const totalLG = fixture.lg.reduce((a, g) => a + g.questions.length, 0);
  assert.equal(b.allQuestions.length, fixture.lr.length + totalRC + totalLG);
});
