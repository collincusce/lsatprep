import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickQuestions, seededRng } from './selector.js';

function makeBank(questions) {
  const bySection = { LR: [], RC: [], LG: [] };
  const byId = new Map();
  for (const q of questions) {
    bySection[q.section].push(q);
    byId.set(q.id, q);
  }
  return { allQuestions: questions, bySection, byId };
}

const q = (id, section, subtype, difficulty) => ({ id, section, subtype, difficulty });

test('filters by section', () => {
  const bank = makeBank([
    q('lr-1', 'LR', 'strengthen', 1),
    q('lr-2', 'LR', 'weaken', 2),
    q('rc-1', 'RC', 'main_point', 1)
  ]);
  const picked = pickQuestions({ bank, filters: { section: 'LR' }, count: 5, seenIds: new Set(), rng: seededRng(1) });
  assert.equal(picked.length, 2);
  for (const x of picked) assert.equal(x.section, 'LR');
});

test('filters by subtype', () => {
  const bank = makeBank([
    q('lr-1', 'LR', 'strengthen', 1),
    q('lr-2', 'LR', 'weaken', 2)
  ]);
  const picked = pickQuestions({ bank, filters: { section: 'LR', subtypes: ['strengthen'] }, count: 5, seenIds: new Set(), rng: seededRng(1) });
  assert.equal(picked.length, 1);
  assert.equal(picked[0].id, 'lr-1');
});

test('filters by difficulty range', () => {
  const bank = makeBank([
    q('lr-1', 'LR', 'strengthen', 1),
    q('lr-2', 'LR', 'weaken', 2),
    q('lr-3', 'LR', 'flaw', 3)
  ]);
  const picked = pickQuestions({ bank, filters: { section: 'LR', difficultyMin: 2, difficultyMax: 3 }, count: 5, seenIds: new Set(), rng: seededRng(1) });
  assert.equal(picked.length, 2);
});

test('seen ids are preferred absent first', () => {
  const bank = makeBank([
    q('lr-1', 'LR', 'strengthen', 1),
    q('lr-2', 'LR', 'strengthen', 1),
    q('lr-3', 'LR', 'strengthen', 1)
  ]);
  const picked = pickQuestions({ bank, filters: { section: 'LR' }, count: 2, seenIds: new Set(['lr-1', 'lr-2']), rng: seededRng(1) });
  // First pick should include lr-3 (unseen).
  assert.ok(picked.find(x => x.id === 'lr-3'));
});

test('falls back to seen if unseen pool is exhausted', () => {
  const bank = makeBank([
    q('lr-1', 'LR', 'strengthen', 1),
    q('lr-2', 'LR', 'strengthen', 1)
  ]);
  const picked = pickQuestions({ bank, filters: { section: 'LR' }, count: 3, seenIds: new Set(['lr-1', 'lr-2']), rng: seededRng(1) });
  assert.equal(picked.length, 2); // bank exhausted
});

test('deterministic under same seed', () => {
  const bank = makeBank([
    q('lr-1', 'LR', 'strengthen', 1),
    q('lr-2', 'LR', 'strengthen', 1),
    q('lr-3', 'LR', 'strengthen', 1),
    q('lr-4', 'LR', 'strengthen', 1)
  ]);
  const a = pickQuestions({ bank, filters: { section: 'LR' }, count: 3, seenIds: new Set(), rng: seededRng(42) });
  const b = pickQuestions({ bank, filters: { section: 'LR' }, count: 3, seenIds: new Set(), rng: seededRng(42) });
  assert.deepEqual(a.map(x => x.id), b.map(x => x.id));
});

test('lgEnabled=false excludes LG even when asked for all sections', () => {
  const bank = makeBank([
    q('lr-1', 'LR', 'strengthen', 1),
    q('lg-1', 'LG', 'basic_linear', 1)
  ]);
  const picked = pickQuestions({ bank, filters: { lgEnabled: false }, count: 5, seenIds: new Set(), rng: seededRng(1) });
  for (const x of picked) assert.notEqual(x.section, 'LG');
});
