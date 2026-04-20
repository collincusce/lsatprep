import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateCoverageMatrix } from './validate-coverage-matrix.mjs';

function write(obj) {
  const dir = mkdtempSync(join(tmpdir(), 'lsat-mat-'));
  const p = join(dir, 'matrix.json');
  writeFileSync(p, JSON.stringify(obj));
  return p;
}

const minimalTaxonomy = {
  sections: {
    LR: { subtypes: { strengthen: {}, weaken: {} } },
    RC: { genres: { humanities: {} } },
    LG: { families: { basic_linear: {} } }
  }
};

test('valid matrix passes', () => {
  const m = {
    version: '1',
    totalTarget: 10,
    cells: [
      { section: 'LR', subtype: 'strengthen', difficulty: 1, count: 5, batchSize: 5 },
      { section: 'LR', subtype: 'weaken', difficulty: 2, count: 5, batchSize: 5 }
    ]
  };
  const res = validateCoverageMatrix(write(m), minimalTaxonomy);
  assert.equal(res.ok, true, res.errors.join('\n'));
});

test('sum != totalTarget fails', () => {
  const m = {
    version: '1',
    totalTarget: 100,
    cells: [{ section: 'LR', subtype: 'strengthen', difficulty: 1, count: 5, batchSize: 5 }]
  };
  const res = validateCoverageMatrix(write(m), minimalTaxonomy);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /sum/i.test(e)));
});

test('unknown LR subtype fails', () => {
  const m = {
    version: '1',
    totalTarget: 5,
    cells: [{ section: 'LR', subtype: 'nonsense_subtype', difficulty: 1, count: 5, batchSize: 5 }]
  };
  const res = validateCoverageMatrix(write(m), minimalTaxonomy);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /subtype/.test(e)));
});

test('difficulty out of range fails', () => {
  const m = {
    version: '1',
    totalTarget: 5,
    cells: [{ section: 'LR', subtype: 'strengthen', difficulty: 4, count: 5, batchSize: 5 }]
  };
  const res = validateCoverageMatrix(write(m), minimalTaxonomy);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /difficulty/.test(e)));
});

test('batchSize <= 0 fails', () => {
  const m = {
    version: '1',
    totalTarget: 5,
    cells: [{ section: 'LR', subtype: 'strengthen', difficulty: 1, count: 5, batchSize: 0 }]
  };
  const res = validateCoverageMatrix(write(m), minimalTaxonomy);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /batchSize/.test(e)));
});

test('unknown RC genre fails', () => {
  const m = {
    version: '1',
    totalTarget: 5,
    cells: [{ section: 'RC', genre: 'unknown_genre', difficulty: 1, count: 5, batchSize: 5 }]
  };
  const res = validateCoverageMatrix(write(m), minimalTaxonomy);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => /genre/.test(e)));
});
