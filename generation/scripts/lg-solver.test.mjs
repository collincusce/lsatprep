import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solveGame, verifyAnswer } from './lg-solver.mjs';

test('basic linear: X before Y — exactly half of permutations', () => {
  const result = solveGame({
    entities: ['A', 'B', 'C', 'D'],
    positions: [1, 2, 3, 4],
    rules: [{ type: 'before', a: 'A', b: 'B' }]
  });
  assert.equal(result.length, 12); // 4! / 2
});

test('no rules: all permutations', () => {
  const result = solveGame({
    entities: ['A', 'B', 'C'],
    positions: [1, 2, 3],
    rules: []
  });
  assert.equal(result.length, 6);
});

test('unsatisfiable rules return empty', () => {
  const result = solveGame({
    entities: ['A', 'B'],
    positions: [1, 2],
    rules: [
      { type: 'at', entity: 'A', position: 1 },
      { type: 'at', entity: 'A', position: 2 }
    ]
  });
  assert.equal(result.length, 0);
});

test('at rule fixes an entity', () => {
  const result = solveGame({
    entities: ['A', 'B', 'C'],
    positions: [1, 2, 3],
    rules: [{ type: 'at', entity: 'A', position: 1 }]
  });
  assert.equal(result.length, 2); // A=1, B and C permute over 2,3
  for (const s of result) assert.equal(s.A, 1);
});

test('not_at rule excludes a position for an entity', () => {
  const result = solveGame({
    entities: ['A', 'B', 'C'],
    positions: [1, 2, 3],
    rules: [{ type: 'not_at', entity: 'A', position: 1 }]
  });
  assert.equal(result.length, 4); // 6 total - 2 where A=1
  for (const s of result) assert.notEqual(s.A, 1);
});

test('adjacent rule: A next to B', () => {
  const result = solveGame({
    entities: ['A', 'B', 'C'],
    positions: [1, 2, 3],
    rules: [{ type: 'adjacent', a: 'A', b: 'B' }]
  });
  assert.equal(result.length, 4);
  for (const s of result) {
    assert.equal(Math.abs(s.A - s.B), 1);
  }
});

test('not_adjacent rule', () => {
  const result = solveGame({
    entities: ['A', 'B', 'C', 'D'],
    positions: [1, 2, 3, 4],
    rules: [{ type: 'not_adjacent', a: 'A', b: 'B' }]
  });
  for (const s of result) {
    assert.notEqual(Math.abs(s.A - s.B), 1);
  }
  // Of 24 permutations, 12 have A,B adjacent; expect 12 non-adjacent.
  assert.equal(result.length, 12);
});

test('conditional rule: if A=1 then B=3', () => {
  const result = solveGame({
    entities: ['A', 'B', 'C'],
    positions: [1, 2, 3],
    rules: [
      {
        type: 'conditional',
        ifRule: { type: 'at', entity: 'A', position: 1 },
        thenRule: { type: 'at', entity: 'B', position: 3 }
      }
    ]
  });
  for (const s of result) {
    if (s.A === 1) assert.equal(s.B, 3);
  }
  // 6 total; those where A=1 but B!=3 are eliminated.
  // A=1: 2 perms (B,C permute over 2,3) - 1 (B=2) = 1 kept.
  // A!=1: 4 perms kept.
  assert.equal(result.length, 5);
});

test('exactly_one_of rule', () => {
  const result = solveGame({
    entities: ['A', 'B', 'C'],
    positions: [1, 2, 3],
    rules: [{ type: 'exactly_one_of', entities: ['A', 'B'], position: 2 }]
  });
  for (const s of result) {
    const aAt2 = s.A === 2 ? 1 : 0;
    const bAt2 = s.B === 2 ? 1 : 0;
    assert.equal(aAt2 + bAt2, 1);
  }
});

test('grouping: same_group', () => {
  const result = solveGame({
    entities: ['A', 'B', 'C', 'D'],
    groups: ['X', 'Y'],
    groupSize: 2,
    rules: [{ type: 'same_group', a: 'A', b: 'B' }]
  });
  for (const s of result) {
    assert.equal(s.A, s.B);
  }
  assert.ok(result.length > 0);
});

test('grouping: different_group', () => {
  const result = solveGame({
    entities: ['A', 'B', 'C', 'D'],
    groups: ['X', 'Y'],
    groupSize: 2,
    rules: [{ type: 'different_group', a: 'A', b: 'B' }]
  });
  for (const s of result) {
    assert.notEqual(s.A, s.B);
  }
});

test('verifyAnswer: must_be_true is true only when all solutions satisfy assertion', () => {
  const game = {
    entities: ['A', 'B', 'C'],
    positions: [1, 2, 3],
    rules: [{ type: 'at', entity: 'A', position: 1 }]
  };
  // Under A=1, it's always true that A is before B and before C.
  const r1 = verifyAnswer(game, [], { kind: 'must_be_true', assertion: { type: 'before', a: 'A', b: 'B' } });
  assert.equal(r1, true);
  // B is at position 2 only in some solutions — not must-be-true.
  const r2 = verifyAnswer(game, [], { kind: 'must_be_true', assertion: { type: 'at', entity: 'B', position: 2 } });
  assert.equal(r2, false);
});

test('verifyAnswer: could_be_true checks any solution satisfies', () => {
  const game = {
    entities: ['A', 'B'],
    positions: [1, 2],
    rules: []
  };
  const r = verifyAnswer(game, [], { kind: 'could_be_true', assertion: { type: 'at', entity: 'A', position: 1 } });
  assert.equal(r, true);
});

test('verifyAnswer: with localRules applied', () => {
  const game = {
    entities: ['A', 'B', 'C'],
    positions: [1, 2, 3],
    rules: []
  };
  // Under local rule A=1, B is at 2 only sometimes. must_be_true should be false.
  const r1 = verifyAnswer(
    game,
    [{ type: 'at', entity: 'A', position: 1 }],
    { kind: 'must_be_true', assertion: { type: 'at', entity: 'B', position: 2 } }
  );
  assert.equal(r1, false);
  // Under local rule A=1 AND B=2, C=3 must be true.
  const r2 = verifyAnswer(
    game,
    [
      { type: 'at', entity: 'A', position: 1 },
      { type: 'at', entity: 'B', position: 2 }
    ],
    { kind: 'must_be_true', assertion: { type: 'at', entity: 'C', position: 3 } }
  );
  assert.equal(r2, true);
});
